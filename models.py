from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Table, UniqueConstraint
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
    forum_replies = relationship("ForumReply", back_populates="user")
    post_likes = relationship("PostLike", back_populates="user")


class Plant(Base):
    __tablename__ = "plants"
    plant_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    common_name = Column(String(255))   # new column
    species = Column(String(255))       # updated column type

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
    replies = relationship("ForumReply", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("PostLike", back_populates="post", cascade="all, delete-orphan")


class PostLike(Base):
    __tablename__ = "post_likes"
    like_id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("forum_posts.post_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("post_id", "user_id", name="uq_post_user_like"),)

    post = relationship("ForumPost", back_populates="likes")
    user = relationship("User", back_populates="post_likes")

class ForumReply(Base):
    __tablename__ = "forum_replies"
    reply_id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("forum_posts.post_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    post = relationship("ForumPost", back_populates="replies")
    user = relationship("User", back_populates="forum_replies")