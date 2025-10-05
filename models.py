from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    user_type = Column(String(20), nullable=False)

    scans = relationship("Scan", back_populates="user")
    forum_posts = relationship("ForumPost", back_populates="user")


class Plant(Base):
    __tablename__ = "plants"
    plant_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    species = Column(String(100))
    category = Column(String(100))

    scans = relationship("Scan", back_populates="plant")


class Disease(Base):
    __tablename__ = "diseases"
    disease_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    symptoms = Column(Text)
    treatments = Column(Text)
    prevention = Column(Text)

    scans = relationship("Scan", back_populates="disease")
    recommendations = relationship("Recommendation", back_populates="disease")


class Scan(Base):
    __tablename__ = "scans"
    scan_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    plant_id = Column(Integer, ForeignKey("plants.plant_id"))
    disease_id = Column(Integer, ForeignKey("diseases.disease_id"))
    date = Column(DateTime, default=datetime.utcnow)
    confidence_score = Column(Float)

    user = relationship("User", back_populates="scans")
    plant = relationship("Plant", back_populates="scans")
    disease = relationship("Disease", back_populates="scans")
    images = relationship("ScanImage", back_populates="scan")


class ScanImage(Base):
    __tablename__ = "scan_images"
    image_id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.scan_id"), nullable=False)
    image_path = Column(String(255), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    scan = relationship("Scan", back_populates="images")


class Recommendation(Base):
    __tablename__ = "recommendations"
    rec_id = Column(Integer, primary_key=True, index=True)
    disease_id = Column(Integer, ForeignKey("diseases.disease_id"))
    recommendation_text = Column(Text)

    disease = relationship("Disease", back_populates="recommendations")


class ForumPost(Base):
    __tablename__ = "forum_posts"
    post_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    title = Column(String(255))
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="forum_posts")


class Weather(Base):
    __tablename__ = "weather"
    weather_id = Column(Integer, primary_key=True, index=True)
    city_name = Column(String(100), nullable=False)
    country = Column(String(50))
    latitude = Column(Float)
    longitude = Column(Float)
    condition = Column(String(100))
    temperature = Column(Float)
    humidity = Column(Float)
    wind_speed = Column(Float)
    precipitation = Column(Float)
    observation_time = Column(DateTime, default=datetime.utcnow)
