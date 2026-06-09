from database import SessionLocal
from models import Incident

def save_incident(incident_type, confidence, image_path):

    db = SessionLocal()

    incident = Incident(
        incident_type=incident_type,
        confidence=confidence,
        image_path=image_path
    )

    db.add(incident)

    db.commit()

    db.close()

    print("Incident saved to database")