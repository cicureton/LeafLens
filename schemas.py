from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class UserBase(BaseModel):
    name: str
    email: EmailStr
    user_type: str

class UserCreate(UserBase):
    password_hash: str  

class UserResponse(UserBase):
    user_id: int

    class Config:
        orm_mode = True

class PlantBase(BaseModel):
    name: str
    species: Optional[str] = None
    category: Optional[str] = None

class PlantCreate(PlantBase):
    pass

class PlantResponse(PlantBase):
    plant_id: int

    class Config:
        orm_mode = True


class DiseaseBase(BaseModel):
    name: str
    symptoms: Optional[str] = None
    treatments: Optional[str] = None
    prevention: Optional[str] = None

class DiseaseCreate(DiseaseBase):
    pass

class DiseaseResponse(DiseaseBase):
    disease_id: int

    class Config:
        orm_mode = True


class ScanBase(BaseModel):
    user_id: int
    plant_id: Optional[int] = None
    disease_id: Optional[int] = None
    confidence_score: Optional[float] = None

class ScanCreate(ScanBase):
    pass

class ScanResponse(ScanBase):
    scan_id: int
    date: datetime

    class Config:
        orm_mode = True


class ScanImageBase(BaseModel):
    scan_id: int
    image_path: str

class ScanImageCreate(ScanImageBase):
    pass

class ScanImageResponse(ScanImageBase):
    image_id: int
    uploaded_at: datetime

    class Config:
        orm_mode = True


class RecommendationBase(BaseModel):
    disease_id: int
    recommendation_text: str

class RecommendationCreate(RecommendationBase):
    pass

class RecommendationResponse(RecommendationBase):
    rec_id: int

    class Config:
        orm_mode = True


class ForumPostBase(BaseModel):
    user_id: Optional[int] = None
    title: str
    content: str

class ForumPostCreate(ForumPostBase):
    pass

class ForumPostResponse(ForumPostBase):
    post_id: int
    timestamp: datetime

    class Config:
        orm_mode = True


class WeatherBase(BaseModel):
    city_name: str
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    condition: Optional[str] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    wind_speed: Optional[float] = None
    precipitation: Optional[float] = None

class WeatherCreate(WeatherBase):
    pass

class WeatherResponse(WeatherBase):
    weather_id: int
    observation_time: datetime

    class Config:
        orm_mode = True
