#  Smart Shopping Cart Based on Computer Vision

Graduation project aimed at enhancing the in-store shopping experience through the use of computer vision and indoor navigation.  
The system detects products using YOLOv11 and guides users within the store using dynamic SVG-based maps.

---

## Overview

This system provides a smart cart capable of:

- Detecting products using a camera on the cart via a trained YOLOv11 model
- Automatically adding recognized items to a digital shopping cart
- Guiding users to desired product locations using indoor navigation
- Managing products and users via a dedicated admin dashboard built with Next.js

---

## Main Features

### YOLOv11-Based Product Detection
- Real-time object detection using a custom-trained YOLOv11 model (PyTorch-based)
- No barcodes needed; camera detects products from visual input
- Supports multi-class detection with confidence scores and bounding boxes

### Smart Cart System
- Each product detected is added to the virtual cart
- Quantity is auto-incremented for repeated products
- Total price and cart contents update live

### Indoor Navigation with SVG
- Indoor map built using layered SVG files
- Nodes represent locations on the store map
- Uses Dijkstra’s Algorithm to calculate shortest paths between locations
- Real-time display of cart location and navigation arrows

### Admin Dashboard (Next.js)
- Admin can:
  - Add/remove/update product details
  - View current cart usage
  - Monitor user behavior and navigation
- Built with React + TailwindCSS using the Next.js framework

---

## Tech Stack

| Component       | Technology             |
|----------------|------------------------|
| Frontend       | Flutter                |
| Backend        | Python, Supabase, Next.js |
| Object Detection | YOLOv11 (PyTorch)     |
| Mapping        | Custom SVG + Dijkstra Algorithm |
| Database       | Supabase PostgreSQL    |
| File Storage   | Supabase Storage       |

---

## Project Structure

```bash
Smart-shopping-cart/
├── model/              # YOLOv11 model and backend scripts
├── recommendation/     # Product recommendation logic
├── web/                # Admin dashboard (Next.js)
├── README.md           # Documentation
