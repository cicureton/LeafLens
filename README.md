## 60% Progress Check
Decided to utilize FastAPI instead of Flask because…
Leaf lens needs fast, async APIs for handling uploads, notifications and external api calls
The app requires real-time features (like forum, alerts, community sharing)
It’s better aligned with performance, scalability, and reliability requirements 
Built-in docs
Made tweaks to the database structure
Removed the “plant_diseases” link database because it was redundant due to the scan table already linking the plant and disease together
Add the scan_images table to the database
Did this for the sake or normalization and flexibility 
Scans table: stores the metadata about the scan
Scan_image table: stores the image files
Scan_images enables users to be able to link multiple images to a scan.
Implemented the endpoints utilizing FastAPI and sqlalchemy 
Split the structure up into:
Database.py: creates the connection to my database
models.py: defines classes that map to the database tables
schemas.py: Defines how requests/response data should look 
main.py: Creates the FastAPI app instance
uvicorn main:app --reload
http://127.0.0.1:8000/docs#/
Next steps: 
Fully implement actual data and non-dummy data
Fully integrate the weather data utilizing openweather API
Fully integrate plant and disease information utilizing the perennial API 
Connecting the backend to the frontend
integrating the AI model to the backend

