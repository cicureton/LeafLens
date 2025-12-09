# Table Of Contents (what and where our code is?)
Frontend (to run frontend follow these steps)
- Download the Expo Go in the app store or google playstore if have not already (https://expo.dev/go)
- Then download the zip files from main branch, and open "frontend" directory within VSCode or a CLI
- Install all dependecies (make sure you are in the "frontend" directory), by typing:
- **npm install**
- **npm install -g expo-cli**
- Start the development server with:
**npx expo start**
(if doesn't work, try "npx expo start --tunnel")

Backend
- This directory includes all the code that is used on our backend server on Render at https://leaflens-16s1.onrender.com
- The AI model is loaded and runs on this server as well, using an API for requests.


# 🌿 LeafLens - Plant Disease Detection & Care Assistant

Senior Capstone Project

---

Branches:
1. admin-web
2. ai-model
3. backend
4. deployment
5. frontend
6. frontend-v2

**AI-powered plant disease detection and treatment recommendation system**

## 📱 About The Project
LeafLens is a comprehensive mobile application that helps plant enthusiasts, gardeners, and farmers identify plant diseases through AI-powered image recognition. Our system not only detects diseases but also provides detailed treatment plans and prevention strategies to help users maintain healthy plants.

### 🎯 Problem Statement
Plant diseases cause significant agricultural losses and can be challenging to identify for non-experts. Traditional diagnosis methods require specialized knowledge and can be time-consuming.

### 💡 Our Solution
LeafLens uses advanced machine learning models to instantly analyze plant images, identify potential diseases with confidence scores, and provide actionable treatment recommendations - all through a user-friendly mobile interface.

## ✨ Features

### 🔍 Core Features
- **AI-Powered Disease Detection**: Upload plant photos for instant disease analysis
- **Species Identification**: Automatically identify plant species from images
- **Confidence Scoring**: Get accuracy percentages for each diagnosis
- **Treatment Recommendations**: Detailed treatment and prevention plans
- **Scan History**: Track all your previous plant analyses
- **User Community**: Forum for sharing plant care tips and experiences

### 📊 Additional Features
- **Real-time Camera Integration**: Capture and analyze plants on the fly
- **Personalized Profiles**: Track your plants and scan history
- **Expert Database**: Comprehensive plant disease information
- **Social Features**: Like and comment on community posts

## 🚀 Installation

### Prerequisites
- Node.js 16+ 
- Python 3.9+
- iOS/Android device or emulator
- Expo Go app (for mobile testing)

### Mobile App Setup
```bash
# Expo Go App
download the Expo Go in the app store or google playstore if have not already

# Download the files
then in the github:
here inside the main, download the zip files
extract the files and keep clicking the folder until you see "frontend" folder
open the "frontend" folder in VS Code

# Install dependencies
from there, inside the terminal (make sure you are in the "frontend" directory), type:
npm install

# Install Expo CLI
npm install -g expo-cli

# Start the development server
npx expo start
(if doesn't work, try "npx expo start --tunnel")
```

## 🛠 Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build tools
- **Expo Router** - File-based navigation
- **Async Storage** - Local data persistence

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM and database management
- **PostgreSQL** - Production database
- **SQLite** - Development database
- **Pydantic** - Data validation and settings management

### AI/ML
- **PyTorch** - Deep learning framework
- **MobileNetV3** - Pre-trained image classification model
- **TorchVision** - Image transformations and datasets
- **PIL** - Image processing capabilities

### Deployment
- **Render** - Backend hosting
- **Expo Application Services** - Mobile app builds

## 🤝 Team

LeafLens is developed as a Senior Capstone Project by:

| Role | Name | Contribution |
|------|------|--------------|
| Frontend | Robertson Siu | React Native app, Frontend development, UI/UX design, Camera integration with AI |
| AI Model | Alexander Crubaugh | AI model development, dataset preparation, Species & disease detection models, integration with backend |
| Backend | Christian Cureton | Backend development, Database design & management, API endpoint creation, Deployment setup |

## 📈 Future Enhancements

- [ ] **Seasonal Disease Alerts** based on location and time of year
- [ ] **Weather Integration** for personalized care reminders
- [ ] **AR Plant Identification** using augmented reality

## 🙏 Acknowledgments

- PlantVillage dataset for training data
- FastAPI and React Native communities
- Our faculty advisors and mentors
- All the plant enthusiasts who tested our application

---

**Made with ❤️ for healthier plants and happier gardeners**
