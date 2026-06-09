from ultralytics import YOLO
import cv2
from fastapi.responses import StreamingResponse
import csv
from fastapi.responses import FileResponse
from collections import defaultdict
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer
)
from reportlab.lib.styles import (
    getSampleStyleSheet
)

from database import SessionLocal
from models import Incident
from collections import Counter
model = YOLO("yolov8n.pt")
app = FastAPI()

# Images Folder
app.mount(
    "/incidents_images",
    StaticFiles(directory="../../ai-engine/incidents"),
    name="incidents_images"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Home
@app.get("/")
def home():
    return {
        "message": "Sentinel AI Backend Running"
    }


# INCIDENTS API
@app.get("/incidents")
def get_incidents():

    db = SessionLocal()

    incidents = db.query(Incident).all()

    data = []

    for incident in incidents:

        image_name = os.path.basename(
            incident.image_path
        )

        data.append({
    "id": incident.id,
    "type": incident.incident_type,
    "confidence": incident.confidence,
    "image": image_name,
    "timestamp": (
        incident.timestamp.strftime(
            "%d-%m-%Y %H:%M:%S"
        )
        if incident.timestamp
        else ""
    )
})

    db.close()

    return data


# ANALYTICS API
@app.get("/analytics")
def analytics():

    db = SessionLocal()

    incidents = db.query(Incident).all()

    stats = defaultdict(int)

    for incident in incidents:

        filename = os.path.basename(
            incident.image_path
        )

        try:

            date_part = filename.split("_")[1]

            day = (
                date_part[6:8]
                + "-"
                + date_part[4:6]
                + "-"
                + date_part[0:4]
            )

            stats[day] += 1

        except:
            pass

    db.close()

    return [
        {
            "day": day,
            "incidents": count
        }
        for day, count in stats.items()
    ]


# PDF REPORT API
@app.get("/report")
def generate_report():

    db = SessionLocal()

    incidents = db.query(Incident).all()

    pdf_file = "incident_report.pdf"

    doc = SimpleDocTemplate(pdf_file)

    styles = getSampleStyleSheet()

    content = []

    content.append(
        Paragraph(
            "Sentinel AI Security Report",
            styles["Title"]
        )
    )

    content.append(
        Spacer(1, 20)
    )

    content.append(
        Paragraph(
            f"Total Incidents: {len(incidents)}",
            styles["Heading2"]
        )
    )

    content.append(
        Spacer(1, 20)
    )

    for incident in incidents:

        content.append(
            Paragraph(
                f"""
                ID: {incident.id}<br/>
                Type: {incident.incident_type}<br/>
                Confidence: {incident.confidence}
                """,
                styles["Normal"]
            )
        )

        content.append(
            Spacer(1, 10)
        )

    doc.build(content)

    db.close()

    return FileResponse(
        pdf_file,
        media_type="application/pdf",
        filename="Sentinel_Report.pdf"
    )


def generate_frames():

    camera = cv2.VideoCapture(0)

    while True:

        success, frame = camera.read()
        if not success:
            break
        results = model(frame)
        frame = results[0].plot()
        _, buffer = cv2.imencode(".jpg", frame)

        frame = buffer.tobytes()

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n"
            + frame +
            b"\r\n"
        )


@app.get("/video_feed")
def video_feed():

    return StreamingResponse(
        generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@app.get("/export-csv")
def export_csv():

    db = SessionLocal()

    incidents = db.query(Incident).all()

    csv_file = "incidents.csv"

    with open(
        csv_file,
        mode="w",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.writer(file)

        writer.writerow([
            "ID",
            "Type",
            "Confidence",
            "Image"
        ])

        for incident in incidents:

            writer.writerow([
                incident.id,
                incident.incident_type,
                incident.confidence,
                incident.image_path
            ])

    db.close()

    return FileResponse(
        csv_file,
        media_type="text/csv",
        filename="Sentinel_Incidents.csv"
    )


@app.delete("/incidents/{incident_id}")
def delete_incident(incident_id: int):

    db = SessionLocal()

    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if not incident:

        db.close()

        return {
            "message": "Incident not found"
        }

    db.delete(incident)
    db.commit()

    db.close()

    return {
        "message": "Incident deleted successfully"
    }
@app.get("/incident-types")
def incident_types():

    db = SessionLocal()

    incidents = db.query(Incident).all()

    stats = defaultdict(int)

    for incident in incidents:
        stats[incident.incident_type] += 1

    db.close()

    return [
        {
            "name": key,
            "value": value
        }
        for key, value in stats.items()
    ]
