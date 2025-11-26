"""
@inproceedings{plantnet-300k,
author    = {Garcin, Camille and Joly, Alexis and Bonnet, Pierre and Lombardo, Jean-Christophe and Affouard, Antoine and Chouet, Mathias and Servajean, Maximilien and Lorieul, Titouan and Salmon, Joseph},
booktitle = {NeurIPS Datasets and Benchmarks 2021},
title     = {{Pl@ntNet-300K}: a plant image dataset with high label ambiguity and a long-tailed distribution},
year      = {2021},
}
"""
from torchvision import models
import torch.nn as nn
from torchvision import datasets
import torch
from PIL import Image
from torchvision import transforms
from utils import load_model
from torchvision.models import mobilenet_v3_large
import json

image_paths = [
    "diseased_plants/mildew.jpg",
    "diseased_plants/black_rot.jpg",
    "diseased_plants/early_blight.jpg",
    "diseased_plants/strawberry_healthy.jpg",
    "diseased_plants/spider_mite.jpg",
]
# load species prediction model
filename = 'mobilenet_v3_large_weights_best_acc.tar' # pre-trained model path
species_model = mobilenet_v3_large(num_classes=1081) # 1081 classes in Pl@ntNet-300K
use_cuda = torch.cuda.is_available()
load_model(species_model, filename=filename, use_gpu=use_cuda)
species_model.eval()
print("model loaded")

# load disease prediction model
model_path = "disease_model.pth"
num_classes = 38  # number of classes
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

disease_model = models.mobilenet_v3_large(weights=None)
disease_model.classifier[3] = nn.Linear(disease_model.classifier[3].in_features, num_classes)
disease_model.load_state_dict(torch.load(model_path, map_location=device), strict=False)
disease_model.to(device)
disease_model.eval()


# image transform
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

dataset_path = 'data/plantvillage/raw/color'
dataset = datasets.ImageFolder(dataset_path, transform=transform)
class_names = dataset.classes

class_idx_to_species_id = "metada_files/class_idx_to_species_id.json"
species_id_to_name = "metada_files/plantnet300K_species_id_2_name.json"

with open(class_idx_to_species_id) as f:
    class_idx_to_species_id = json.load(f)

with open(species_id_to_name) as f:
    species_id_to_name = json.load(f)

def predict_species_batch(image_paths, topk=4, model):
    batch_tensors = []

    for image_path in image_paths:
        img = Image.open(image_path).convert("RGB")
        img_tensor = transform(img)
        batch_tensors.append(img_tensor)

    batch = torch.stack(batch_tensors).to(device)

    with torch.no_grad():
        outputs = model(batch)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        aggregated_probs = probabilities.mean(dim=0)
        top_probs, top_idxs = torch.topk(aggregated_probs, topk)

    predictions = []
    for i in range(topk):
        class_idx = top_idxs[i].item()
        species_id = class_idx_to_species_id[str(class_idx)]
        species_name = species_id_to_name[species_id]
        prob = top_probs[i].item() / len(image_paths) * 100
        predictions.append((species_name, prob))

    print("\nAggregated Predictions for all images:")
    for species, prob in predictions:
        print(f"{species}: {prob:.2f}%")

    return predictions




# top k probabilities
for img_path in image_paths:
    img = Image.open(img_path).convert("RGB")
    img_tensor = transform(img).unsqueeze(0).to(device)
    print(f"\n{img_path.split('/')[-1].split('.')[0].upper()}" + " disease test")
    with torch.no_grad():
        outputs = disease_model(img_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        top_probs, top_probs_indexes = torch.topk(probabilities, 4)

    for i in range(4):
        print(f"{class_names[top_probs_indexes[0][i]]}: {top_probs[0][i].item() * 100:.2f}%")
