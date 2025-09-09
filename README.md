# LeafLens
Senior Capstone Project
***
## 30% Progress Checkpoint
- I chose my specific dataset to detect plant species
- I use MobileNetV3 for transfer learning
- Freeze early layers of model and leave last 10 layers to train on
- Took a subset of the dataset that contains 20 different species and over 8000 images to work on (the overall dataset is very large and would take a long time to train on).
- Split datset (subset) into 60:20:20 (train,val,test)
- Clean data
- Normalize data and transform images to meet model requirements (224x224)
- Create dataset to hold the train/validate images so i can feed it into the model using DataLoader
- Feed images through model 7 times, and try to track the loss each time
- Compare with the validation set and calculate validation accuracy
- Save model
