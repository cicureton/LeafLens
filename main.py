import os, shutil
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import models, schemas
from database import SessionLocal, engine, Base


Base.metadata.create_all(bind=engine)

app = FastAPI(title="LeafLens API")

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
def create_scan(scan: schemas.ScanCreate, db: Session = Depends(get_db)):
    new_scan = models.Scan(
        user_id=scan.user_id,
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
    return query.all()


@app.post("/weather/", response_model=schemas.WeatherResponse)
def create_weather(weather: schemas.WeatherCreate, db: Session = Depends(get_db)):
    new_weather = models.Weather(**weather.dict())
    db.add(new_weather)
    db.commit()
    db.refresh(new_weather)
    return new_weather

@app.get("/weather/", response_model=List[schemas.WeatherResponse])
def get_weather(db: Session = Depends(get_db)):
    return db.query(models.Weather).all()
