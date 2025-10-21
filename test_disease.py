import torch
from torchvision import models, transforms
from PIL import Image
import torch.nn as nn
from torchvision import datasets

image_paths = [
    "diseased_plants/mildew.jpg",
    "diseased_plants/black_rot.jpg",
    "diseased_plants/early_blight.jpg",
    "diseased_plants/strawberry_healthy.jpg",
    "diseased_plants/spider_mite.jpg",

]
model_path = "disease_model.pth"
num_classes = 38  # number of classes
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


model = models.mobilenet_v3_large(weights=None)
model.classifier[3] = nn.Linear(model.classifier[3].in_features, num_classes)
model.load_state_dict(torch.load(model_path, map_location=device), strict=False)
model.to(device)
model.eval()


transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

dataset_path = 'data/plantvillage/raw/color'
dataset = datasets.ImageFolder(dataset_path, transform=transform)
class_names = dataset.classes



# top k probabilities
for img_path in image_paths:
    img = Image.open(img_path).convert("RGB")
    img_tensor = transform(img).unsqueeze(0).to(device)
    print(f"\n{img_path.split('/')[-1].split('.')[0].upper()}" + " disease test")
    with torch.no_grad():
        outputs = model(img_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        top_probs, top_probs_indexes = torch.topk(probabilities, 4)

    for i in range(4):
        print(f"{class_names[top_probs_indexes[0][i]]}: {top_probs[0][i].item() * 100:.2f}%")




