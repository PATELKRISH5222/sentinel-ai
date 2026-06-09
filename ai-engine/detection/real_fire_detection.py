import sys
import os
import cv2
import time

from ultralytics import YOLO
from datetime import datetime
from playsound import playsound

# Backend path add
sys.path.append("../../backend/app")

# Database function import
from save_incident import save_incident

# Load YOLO model
model = YOLO("yolov8n.pt")

# Open webcam
cap = cv2.VideoCapture(0)

# Objects to detect
danger_objects = ["person"]

# Incident image folder
save_folder = "../incidents"

# Create folder if not exists
os.makedirs(save_folder, exist_ok=True)

# Cooldown settings
last_saved_time = 0
cooldown = 10  # seconds

while True:

    # Read webcam frame
    success, frame = cap.read()

    # If camera fails
    if not success:
        print("Camera not working")
        break

    # Run AI detection
    results = model(frame)

    # Draw detection boxes
    annotated_frame = results[0].plot()

    # Loop through detected objects
    for box in results[0].boxes:

        # Get class id
        class_id = int(box.cls[0])

        # Get class name
        class_name = model.names[class_id]

        # Check danger object with cooldown
        if class_name in danger_objects and time.time() - last_saved_time > cooldown:

            print(f"ALERT: {class_name} detected!")

            # Play alarm sound
            playsound("../sounds/alarm.mp3")

            # Create unique timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

            # Image filename
            filename = f"{class_name}_{timestamp}.jpg"

            # Full image path
            filepath = os.path.join(save_folder, filename)

            # Save screenshot
            cv2.imwrite(filepath, frame)

            # Detection confidence
            confidence = float(box.conf[0])

            # Save to database
            save_incident(
                class_name,
                confidence,
                filepath
            )

            # Update cooldown timer
            last_saved_time = time.time()

    # Show webcam window
    cv2.imshow("Sentinel AI", annotated_frame)

    # Press Q to exit
    if cv2.waitKey(1) == ord("q"):
        break

# Release camera
cap.release()

# Close all windows
cv2.destroyAllWindows()