# LeafLens
Senior Capstone Project
***
## TABLE OF CONTENTS
### These two files were models that were created to train a spcies prediction model. Because the final product used a pre-trained model from another source, these are labeled **UNUSED**.
- Species_Model_UNUSED_LeafLens.jpynb
- species_model_train_UNUSED.py
### These model png's contain images of training results from the **unused** species model I was training prior to switching to a pre-trained model from another source.
- model_v1.png
- modelv2.1.png
- modelv2.2.png
### This file contained a program to use one-hot encoding to turn a users categorical data into something interpretable by the CNN. It was not used in the final product.
- Categorical_data.jpynb
### This is the **main training file for the disease model**. Disease_train_output contains the output from the training and diseased_image_tests contain the results from personal testing on images.
- Disease_train.py
- disease_train_output.png
- disease_image_tests.png
### Full_pipeline.py contains the program I made which **mimics the full AI process**, as a test before being integrated in the backend.
- full_piepline.py
### These **"test"** files are programs that use a function to upload images and test each mode.
- test_disease.py
- test_species.py
### An image of the loss vs epoch for training on the **disease model**.
- training_plot.png
### Mapping.py filters out diseases that do not correspond with the predicted species output
- mapping.py

_The majority of the rest of the work involved backend integration, and creating/managing the endpoint that functions as the AI model._



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
