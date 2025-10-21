
## 60% Progress Check
- Decided to utilize FastAPI instead of Flask because...
  - Leaf lens needs fast, async APIs for handling uploads, notifications and external api calls
  - The app requires real-time features (like forum, alerts, community sharing)
  - It’s better aligned with performance, scalability, and reliability requirements 
  - Built-in docs
- Made tweaks to the database structure
  - Removed the “plant_diseases” link database because it was redundant due to the scan table already linking the plant and disease together
  - Add the scan_images table to the database
    - Did this for the sake or normalization and flexibility 
    - Scans table: stores the metadata about the scan
    - Scan_image table: stores the image files
    - Scan_images enables users to be able to link multiple images to a scan.
- Implemented the endpoints utilizing FastAPI and sqlalchemy 
- Split the structure up into:
  - Database.py: creates the connection to my database
  - models.py: defines classes that map to the database tables
  - schemas.py: Defines how requests/response data should look 
  - main.py: Creates the FastAPI app instance
- Next steps: 
  - Fully implement actual data and non-dummy data
  - Fully integrate the weather data utilizing openweather API
  - Fully integrate plant and disease information utilizing the perennial API 
  - Connecting the backend to the frontend
  - integrating the AI model to the backend

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
