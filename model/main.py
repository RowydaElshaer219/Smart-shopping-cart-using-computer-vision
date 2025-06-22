import cv2
import numpy as np
from ultralytics import YOLO
import logging
import cvzone
from polym import PolylineManager  # Ensure this imports the class correctly
from Data import manage_cart  # Import from Data.py
logging.getLogger("ultralytics").setLevel(logging.WARNING)


# Initialize the camera video stream
stream = cv2.VideoCapture(0)
if not stream.isOpened():
    print("Error: Could not open camera.")
    exit()

# Load COCO class names
with open("./products.txt", "r") as f:
    class_names = f.read().splitlines()

# Load the YOLO model
model = YOLO("./yolo_model.pt")

# Create a PolylineManager instance
polyline_manager = PolylineManager()

cv2.namedWindow('RGB')

# Mouse callback to get mouse movements
def RGB(event, x, y, flags, param):
    if event == cv2.EVENT_LBUTTONDOWN:
        polyline_manager.add_point((x, y))

cv2.setMouseCallback('RGB', RGB)

going_up = {}
going_down = {}
gnu = []
gnd = []

# Function to update the database
def update_database(action, product_name):
    cart_id = 7  # Assuming a single cart for simplicity
    return manage_cart(action, cart_id, product_name)

while True:
    ret, frame = stream.read()
    if not ret:
        print("Error: Could not read frame from camera.")
        break

    frame = cv2.resize(frame, (1020, 500))

    results = model.track(frame, persist=True)

    if results[0].boxes is not None and results[0].boxes.id is not None:
        boxes = results[0].boxes.xyxy.int().cpu().tolist()
        class_ids = results[0].boxes.cls.int().cpu().tolist()
        track_ids = results[0].boxes.id.int().cpu().tolist()

        for box, class_id, track_id in zip(boxes, class_ids, track_ids):
            product_name = class_names[class_id]
            x1, y1, x2, y2 = box
            cx = (x1 + x2) // 2
            cy = (y1 + y2) // 2

            if polyline_manager.point_polygon_test((cx, cy), 'area1'):
                going_up[track_id] = (cx, cy)
            if track_id in going_up:
                if polyline_manager.point_polygon_test((cx, cy), 'area2'):
                    if gnu.count(track_id) == 0:
                        gnu.append(track_id)
                        result = update_database("delete", product_name)
                        print(f"Removed to DB: {result}")

            if polyline_manager.point_polygon_test((cx, cy), 'area2'):
                going_down[track_id] = (cx, cy)
            if track_id in going_down:
                if polyline_manager.point_polygon_test((cx, cy), 'area1'):
                    if gnd.count(track_id) == 0:
                        gnd.append(track_id)
                        result = update_database("add", product_name)
                        print(f"Added from DB: {result}")

    godown = len(gnd)
    goup = len(gnu)
    cvzone.putTextRect(frame, f'IN: {godown}', (50, 60), 2, 2)
    cvzone.putTextRect(frame, f'OUT: {goup}', (50, 160), 2, 2)

    frame = polyline_manager.draw_polylines(frame)
    cv2.imshow("RGB", frame)

    if not polyline_manager.handle_key_events():
        break

stream.release()
cv2.destroyAllWindows()
