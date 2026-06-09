from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_type = Column(String)
    confidence = Column(Float)
    image_path = Column(String)
    timestamp = Column(
    DateTime,
    default=datetime.utcnow
)