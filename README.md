# LeafLens
Senior Capstone Project
***
# AI-Model Architecture
## 1. Species Detection
### Image data → MobileNetV3Large → Feature vector
### Extract meaningful features (edges, textures, shapes) from the leaf image.
### This feature vector represents the most important visual characteristics of the leaf.
### Goes through classification layer to predict what species it is (exaple: “This is likely an Oak Leaf”)
# 2. Metadata Processing
### The metadata will be the information we get from users. We will ask the users when they upload images a few questions about their plants and their personal information (where are you located? indoor or outdoor plant?, etc.) → go through a small NN to learn patterns in data that will help with disease prediction → Will output a feature vector that can be interpreted by our model
### Will convert the user inputs (from questionnaire) or environmental info (from external api) into a numerical vectors for the model to understand. One way to do this is by converting categorical data with one-hot encoding. Meaning they are assigned a binary value based on the answer.
### Then we have to do more preprocessing and normalize data (e.g., leaf age, temperature) to fit model requirements (how the images were normalized and transformed).
### From here both the categorical and numerical data have been encoded to become numerical in some form. Categorical data will become binary in a form that is interpretable, and numerical data will be normalized usually between 0-1.
### Feed the data into a small NN(learn complex data patterns) to generate a feature vector for all user-side inputted data.
### Now all the user-inputted data must be combined to create one single feature vector that will be turned into a 1D tensor for the model to interpret.
# 3. Disease Detection
### Concatenate (combine) image feature vector + user-inputted data feature vector → Run through our disease Classifier
### Basically combining the visual information from the images with contextual data from user inputs.
### Output: Coming from our disease classifier (fully connected layer) should predict most accurate disease label.

