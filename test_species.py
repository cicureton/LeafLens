import torch
import torch.nn as nn
from torchvision import models, transforms, datasets
from PIL import Image
import pandas as pd
#

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# path to model
model_path = "mobilenet_v3_large_plants.pth"

# Number of species in your dataset
num_species = 20

# Load model
model = models.mobilenet_v3_large(weights=None)
model.classifier[3] = nn.Linear(model.classifier[3].in_features, 20)
model.load_state_dict(torch.load('mobilenet_v3_large_plants.pth', map_location=device), strict=False)
model.to(device)
model.eval()

# image transform
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])


# load the dataset class names to predict
dataset_path = "data/subset_metadata.csv"
dataset = pd.read_csv(dataset_path)
class_names = sorted(dataset["species"].unique())


def predict_species(image_path, topk=4):
    img = Image.open(image_path).convert("RGB")
    img_tensor = transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        predictions = []
        outputs = model(img_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        top_probs, top_probs_indexes = torch.topk(probabilities, topk)

        # top 4 predictions
        for i in range(topk):
            predictions.append((class_names[top_probs_indexes[0][i]], top_probs[0][i].item() * 100))

    print(f"\nPredictions for {image_path}:")
    for species, prob in predictions:
        print(f"{species}: {prob:.2f}%")

    return predictions



predict_species("plant_species/sour_cherry.jpg", topk=4)
