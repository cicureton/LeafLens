import torch
import torch.nn as nn
from torchvision import models
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
import torch.optim as optim
import torch.optim.lr_scheduler as lr_scheduler
import matplotlib.pyplot as plt
from collections import Counter
import numpy as np
from sklearn.metrics import confusion_matrix






device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(device)

# Load pretrained model
model = models.mobilenet_v3_large(weights=None)


model.classifier[3] = nn.Linear(model.classifier[3].in_features, 20)
model.load_state_dict(torch.load('mobilenet_v3_large_plants.pth', map_location=device), strict=False)
print(model.classifier)
print("Model loaded successfully.")



# Replace classifier head with new head for 38 disease classes
num_features = model.classifier[3].in_features
model.classifier[3] = nn.Linear(num_features, 38)


transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

dataset_path = 'data/plantvillage/raw/color'
dataset = datasets.ImageFolder(dataset_path, transform=transform)
print(dataset.classes)
class_names = dataset.classes



# Freeze all layers except classifier head
for param in model.features[:-6].parameters():
    param.requires_grad = False



train_size = int(0.6 * len(dataset))
val_size = int(0.2 * len(dataset))
test_size = len(dataset) - train_size - val_size
train_dataset, test_dataset, val_dataset = torch.utils.data.random_split(dataset, [train_size, test_size, val_size])


train_labels = [label for _, label in train_dataset]
val_labels = [label for _, label in val_dataset]
# print("Train class counts:", Counter(train_labels))
# print("Val class counts:", Counter(val_labels))
#
# train_paths = set([dataset.samples[i][0] for i in train_dataset.indices])
# val_paths = set([dataset.samples[i][0] for i in val_dataset.indices])
# print("Overlap:", len(train_paths & val_paths))
#


train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=64, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=64, shuffle=True)


class_counts = [train_labels.count(i) for i in range(38)]
weights = 1.0 / torch.tensor(class_counts, dtype=torch.float)
weights = weights / weights.sum() * 38 # num classes
criterion = nn.CrossEntropyLoss(weight=weights.to(device))
optimizer = optim.Adam(model.parameters(), lr=0.001)
scheduler = lr_scheduler.StepLR(optimizer, step_size=2, gamma=0.5)

num_epochs = 5
patience = 2
min_delta = 0.001
best_val_loss = float("inf")
counter = 0
model.to(device)



train_losses = []
val_losses = []
val_accuracies = []
lrs = []

for epoch in range(num_epochs):
    model.train()
    running_loss = 0.0
    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()

        # Forward pass calculates the output by feeding input thorugh model nad loss using criterion function
        outputs = model(images)
        loss = criterion(outputs, labels)

        # Backward pass and optimization
        loss.backward()
        optimizer.step()

        running_loss += loss.item()


    scheduler.step()

    # Average loss for the epoch
    epoch_loss = running_loss / len(train_loader)
    train_losses.append(epoch_loss)


    # evaluation mode
    model.eval()
    val_loss = 0.0
    correct = 0
    total = 0
    # No gradient calculation
    with torch.no_grad():
        for images, labels in val_loader:  # tqdm removed
            images, labels = images.to(device), labels.to(device)
            # Forward pass
            outputs = model(images)
            loss = criterion(outputs, labels)
            val_loss += loss.item()

            # Get class with highest score
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    val_loss = val_loss / len(val_loader)
    val_losses.append(val_loss)
    val_accuracy = 100 * correct / total
    val_accuracies.append(100 * correct / total)
    lrs.append(optimizer.param_groups[0]['lr'])

    print(f"Epoch [{epoch+1}/{num_epochs}], Train Loss: {epoch_loss:.4f}, Val Loss: {val_loss:.4f}")
    print(f"Validation Accuracy: {val_accuracy:.2f}%")

    if val_loss < best_val_loss - min_delta:
        best_val_loss = val_loss
        counter = 0
    else:
        counter += 1
        if counter >= patience:
            print("Early stopped!")
            break

epochs = range(1, num_epochs + 1)

torch.save(model.state_dict(), "/home/abcrubaugh/disease_model.pth")


# plt.figure(figsize=(12,5))
#
# # Loss plot
# plt.subplot(1,2,1)
# plt.plot(epochs, train_losses, label='Train Loss')
# plt.plot(epochs, val_losses, label='Val Loss')
# plt.xlabel('Epoch')
# plt.ylabel('Loss')
# plt.title('Loss vs Epoch')
# plt.legend()
#
# # Learning rate plot
# plt.subplot(1,2,2)
# plt.plot(epochs, lrs, label='Learning Rate')
# plt.xlabel('Epoch')
# plt.ylabel('Learning Rate')
# plt.title('Learning Rate vs Epoch')
# plt.legend()
#
# plt.savefig("training_plot.png")  # save to file (works on HPC)
# plt.close()
all_preds = []
all_labels = []
model.eval()  # evaluation mode
correct = 0
total = 0
# No gradient calculation
with torch.no_grad():
    for inputs, labels in test_loader:  # tqdm removed
        inputs, labels = inputs.to(device), labels.to(device)
        # Forward pass
        outputs = model(inputs)
        _, preds = torch.max(outputs, 1)
        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())
        # Get class with highest score
        _, predicted = torch.max(outputs, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

print(f"Test Accuracy: {100 * correct / total:.2f}%")
