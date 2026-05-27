from ultralytics import YOLO
import cv2
import os
from datetime import datetime
from playsound import playsound

model = YOLO("yolov8n.pt")

cap = cv2.VideoCapture(0)

danger_objects = ["person"]

save_folder = "../incidents"

os.makedirs(save_folder, exist_ok=True)

while True:
    success, frame = cap.read()

    results = model(frame)

    annotated_frame = results[0].plot()

    for box in results[0].boxes:

        class_id = int(box.cls[0])

        class_name = model.names[class_id]

        if class_name in danger_objects:

            print(f"ALERT: {class_name} detected!")

            playsound("../sounds/alarm.mp3")

            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

            filename = f"{class_name}_{timestamp}.jpg"

            filepath = os.path.join(save_folder, filename)

            cv2.imwrite(filepath, frame)

    cv2.imshow("Sentinel AI", annotated_frame)

    if cv2.waitKey(1) == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()