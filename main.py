import os, shutil
from typing import Optional, List

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session
from sqlalchemy import func

import models, schemas
from database import SessionLocal, engine, Base

from PIL import Image
import torch
import io
from torchvision import transforms
from torchvision.models import mobilenet_v3_large
import torch.nn as nn

import json
from utils import load_model
from filter_modules import normalize_species_name, filter_disease_predictions
from disease_classes import disease_classes
from mapping import species_to_diseases


Base.metadata.create_all(bind=engine)

app = FastAPI(title="LeafLens API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = models.User(**user.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get("/users/", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.get("/users/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/users/{user_id}", response_model=schemas.UserResponse)
def update_user(user_id: int, user_update: schemas.UserCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for key, value in user_update.dict().items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"detail": "User deleted successfully"}

@app.post("/plants/", response_model=schemas.PlantResponse)
def create_plant(plant: schemas.PlantCreate, db: Session = Depends(get_db)):
    new_plant = models.Plant(**plant.dict())
    db.add(new_plant)
    db.commit()
    db.refresh(new_plant)
    return new_plant

@app.get("/plants/", response_model=List[schemas.PlantResponse])
def get_plants(db: Session = Depends(get_db)):
    return db.query(models.Plant).all()

@app.get("/plants/{plant_id}", response_model=schemas.PlantResponse)
def get_plant(plant_id: int, db: Session = Depends(get_db)):
    plant = db.query(models.Plant).filter(models.Plant.plant_id == plant_id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return plant

@app.post("/diseases/", response_model=schemas.DiseaseResponse)
def create_disease(disease: schemas.DiseaseCreate, db: Session = Depends(get_db)):
    new_disease = models.Disease(**disease.dict())
    db.add(new_disease)
    db.commit()
    db.refresh(new_disease)
    return new_disease

@app.get("/diseases/", response_model=List[schemas.DiseaseResponse])
def get_diseases(db: Session = Depends(get_db)):
    return db.query(models.Disease).all()

@app.get("/diseases/{disease_id}", response_model=schemas.DiseaseResponse)
def get_disease(disease_id: int, db: Session = Depends(get_db)):
    disease = db.query(models.Disease).filter(models.Disease.disease_id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")
    return disease

@app.post("/scans/", response_model=schemas.ScanResponse)
def create_scan(scan: schemas.ScanCreate,user_id: int = Form(...), db: Session = Depends(get_db)):
    new_scan = models.Scan(
        user_id=user_id,
        plant_id=scan.plant_id,
        disease_id=scan.disease_id,
        confidence_score=scan.confidence_score
    )
    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)

    if hasattr(scan, "image_paths") and scan.image_paths:
        for path in scan.image_paths:
            new_image = models.ScanImage(scan_id=new_scan.scan_id, image_path=path)
            db.add(new_image)
        db.commit()

    db.refresh(new_scan)
    return new_scan


@app.get("/scans/", response_model=List[schemas.ScanResponse])
def get_scans(
    user_id: Optional[int] = None,
    plant_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Scan)
    if user_id:
        query = query.filter(models.Scan.user_id == user_id)
    if plant_id:
        query = query.filter(models.Scan.plant_id == plant_id)
    return query.all()


UPLOAD_DIR = "uploads"

@app.delete("/scans/{scan_id}")
def delete_scan(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(models.Scan).filter(models.Scan.scan_id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    db.delete(scan)
    db.commit()
    return {"detail": "Scan deleted successfully"}


@app.post("/scan_images/", response_model=schemas.ScanImageResponse)
def create_scan_image(
    scan_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    new_image = models.ScanImage(scan_id=scan_id, image_path=file_path)
    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return new_image

@app.get("/scan_images/", response_model=List[schemas.ScanImageResponse])
def get_scan_images(db: Session = Depends(get_db)):
    return db.query(models.ScanImage).all()

@app.post("/recommendations/", response_model=schemas.RecommendationResponse)
def create_recommendation(rec: schemas.RecommendationCreate, db: Session = Depends(get_db)):
    new_rec = models.Recommendation(**rec.dict())
    db.add(new_rec)
    db.commit()
    db.refresh(new_rec)
    return new_rec

@app.get("/recommendations/", response_model=List[schemas.RecommendationResponse])
def get_recommendations(db: Session = Depends(get_db)):
    return db.query(models.Recommendation).all()

@app.post("/forum_posts/", response_model=schemas.ForumPostResponse)
def create_forum_post(post: schemas.ForumPostCreate, db: Session = Depends(get_db)):
    new_post = models.ForumPost(**post.dict())
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post

@app.get("/forum_posts/", response_model=List[schemas.ForumPostResponse])
def get_forum_posts(
    plant: Optional[str] = None,
    disease: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.ForumPost)

    if plant:
        query = query.filter(models.ForumPost.title.ilike(f"%{plant}%"))

    if disease:
        query = query.filter(models.ForumPost.content.ilike(f"%{disease}%"))

    posts = query.all()

    for post in posts:
        like_count = db.query(models.PostLike).filter(
            models.PostLike.post_id == post.post_id
        ).count()
        post.like_count = like_count

    return posts

@app.put("/forum_posts/{post_id}", response_model=schemas.ForumPostResponse)
def update_forum_post(post_id: int, update_data: schemas.ForumPostCreate, db: Session = Depends(get_db)):
    post = db.query(models.ForumPost).filter(models.ForumPost.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.title = update_data.title
    post.content = update_data.content
    db.commit()
    db.refresh(post)
    return post

@app.delete("/forum_posts/{post_id}")
def delete_forum_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.ForumPost).filter(models.ForumPost.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    db.delete(post)
    db.commit()
    return {"detail": "Post deleted successfully"}



device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --- Load species model ---
species_model = mobilenet_v3_large(num_classes=1081)
load_model(species_model, filename='mobilenet_v3_large_weights_best_acc.tar', use_gpu=torch.cuda.is_available())
species_model.eval()

with open("metada_files/class_idx_to_species_id.json") as f:
    class_idx_to_species_id = json.load(f)

with open("metada_files/plantnet300K_species_id_2_name.json") as f:
    species_id_to_name = json.load(f)

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# --- Load disease model ---
disease_model = mobilenet_v3_large(weights=None)
disease_model.classifier[3] = nn.Linear(disease_model.classifier[3].in_features, len(disease_classes))
disease_model.load_state_dict(torch.load("disease_model.pth", map_location=device), strict=False)
disease_model.to(device)
disease_model.eval()

disease_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# -- endpiont --
@app.post("/predict_species_and_disease_batch")
async def predict_species_and_disease_batch(
    user_id: int = Form(...),
    files: List[UploadFile] = File(...),
    topk_species: int = 1,
    topk_disease: int = 4,
    db: Session = Depends(get_db)
):
    
    """
    Predict species and diseases for a batch of images.
    Disease predictions will be filtered based on the top predicted species.
    Works for both single and multiple images.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No images uploaded")

    species_tensors = []
    disease_tensors = []

    # --- Preprocess all images ---
    for file in files:
        img_bytes = await file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        species_tensors.append(transform(img))
        disease_tensors.append(disease_transform(img))

    # --- Stack tensors and move to device ---
    species_batch = torch.stack(species_tensors).to(device)
    disease_batch = torch.stack(disease_tensors).to(device)

    # --- Species prediction ---
    with torch.no_grad():
        species_outputs = species_model(species_batch)
        species_probs = torch.nn.functional.softmax(species_outputs, dim=1)
        avg_species_probs = species_probs.mean(dim=0)
        top_species_probs, top_species_idxs = torch.topk(avg_species_probs, topk_species)

    species_predictions = []
    for i in range(top_species_probs.size(0)):
        class_idx = top_species_idxs[i].item()
        species_id = class_idx_to_species_id.get(str(class_idx), f"class_{class_idx}")
        species_name = species_id_to_name.get(species_id, "Unknown Species")
        prob = top_species_probs[i].item() * 100
        species_predictions.append({
            "species": species_name,
            "confidence": round(prob, 2)
        })

    top_species_name = species_predictions[0]["species"] if species_predictions else None

    # --- Disease prediction ---
    with torch.no_grad():
        disease_outputs = disease_model(disease_batch)
        disease_probs = torch.nn.functional.softmax(disease_outputs, dim=1)
        avg_disease_probs = disease_probs.mean(dim=0)
        top_disease_probs, top_disease_idxs = torch.topk(avg_disease_probs, topk_disease * 2)

    raw_disease_predictions = []
    for i in range(top_disease_probs.size(0)):
        disease_name = disease_classes[top_disease_idxs[i].item()]
        prob = top_disease_probs[i].item() * 100
        raw_disease_predictions.append({
            "disease": disease_name,
            "confidence": round(prob, 2)
        })

    # --- Filter diseases based on top species ---
    if top_species_name:
        normalized = normalize_species_name(top_species_name)
        if normalized and normalized in species_to_diseases:
            allowed = set(species_to_diseases[normalized])
            filtered = [pred for pred in raw_disease_predictions if pred["disease"] in allowed]
            disease_predictions = filtered[:topk_disease] if filtered else raw_disease_predictions[:topk_disease]
        else:
            disease_predictions = raw_disease_predictions[:topk_disease]
    else:
        disease_predictions = raw_disease_predictions[:topk_disease]

    # next step -> connect returned disease to disease in database
    # create a scan entry using diseaseID that was found
    # link the scan to scan/image to upload the image


    top_disease_name = disease_predictions[0]["disease"] if disease_predictions else None
    top_confidence = disease_predictions[0]["confidence"] if disease_predictions else 0

    db_disease = db.query(models.Disease).filter(models.Disease.name == top_disease_name).first()
    disease_id = db_disease.disease_id if db_disease else None


    new_scan = models.Scan(
    user_id=user_id,    
    plant_id=None,  # optional: set if known
    disease_id=disease_id,
    confidence_score=top_confidence
    )
    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)
    scan_id = new_scan.scan_id


    return JSONResponse({
        "scan_id": scan_id,
        "species_predictions": species_predictions,
        "disease_predictions": disease_predictions
    })

@app.post("/forum_posts/{post_id}/replies", response_model=schemas.ForumReplyResponse)
def create_forum_reply(post_id: int, reply: schemas.ForumReplyCreate, db: Session = Depends(get_db)):
    # ensure post exists
    post = db.query(models.ForumPost).filter(models.ForumPost.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Forum post not found")

    # verify body post_id matches path (optional, but safer)
    if reply.post_id != post_id:
        raise HTTPException(status_code=400, detail="post_id mismatch")

    # optional: verify user exists
    user = db.query(models.User).filter(models.User.user_id == reply.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Replying user not found")

    new_reply = models.ForumReply(post_id=post_id, user_id=reply.user_id, content=reply.content)
    db.add(new_reply)
    db.commit()
    db.refresh(new_reply)
    return new_reply

@app.get("/forum_posts/{post_id}/replies", response_model=List[schemas.ForumReplyResponse])
def get_replies_for_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.ForumPost).filter(models.ForumPost.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Forum post not found")
    return db.query(models.ForumReply).filter(models.ForumReply.post_id == post_id).order_by(models.ForumReply.timestamp.asc()).all()


@app.post("/forum_posts/{post_id}/like")
def toggle_like_on_post(post_id: int, like_payload: schemas.PostLikeCreate, db: Session = Depends(get_db)):
    """
    Toggle like: if the user already liked the post -> unlike (delete), otherwise create like.
    Returns JSON: { "liked": bool, "like_count": int }
    """
    if like_payload.post_id != post_id:
        raise HTTPException(status_code=400, detail="post_id mismatch")

    # ensure post exists
    post = db.query(models.ForumPost).filter(models.ForumPost.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Forum post not found")

    # ensure user exists
    user = db.query(models.User).filter(models.User.user_id == like_payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_like = db.query(models.PostLike).filter(
        models.PostLike.post_id == post_id,
        models.PostLike.user_id == like_payload.user_id
    ).first()

    if existing_like:
        # unlike
        db.delete(existing_like)
        db.commit()
        liked = False
    else:
        new_like = models.PostLike(post_id=post_id, user_id=like_payload.user_id)
        db.add(new_like)
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            # could be UniqueConstraint violation or other DB error
            raise HTTPException(status_code=500, detail="Could not create like")
        liked = True

    # compute updated like count
    like_count = db.query(models.PostLike).filter(models.PostLike.post_id == post_id).count()

    return {"liked": liked, "like_count": like_count}

@app.get("/users/{user_id}/stats", response_model=schemas.UserStats)
def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    # ensure user exists
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # number of posts by this user
    posts_count = db.query(models.ForumPost).filter(models.ForumPost.user_id == user_id).count()

    # total likes received across all posts
    total_likes_received = db.query(func.count(models.PostLike.like_id)).join(
        models.ForumPost, models.PostLike.post_id == models.ForumPost.post_id
    ).filter(models.ForumPost.user_id == user_id).scalar() or 0

    # number of scans
    scans_count = db.query(models.Scan).filter(models.Scan.user_id == user_id).count()

    return schemas.UserStats(
        user_id=user_id,
        posts_count=posts_count,
        total_likes_received=total_likes_received,
        scans_count=scans_count
    )
