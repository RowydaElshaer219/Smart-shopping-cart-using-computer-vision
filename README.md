#  Smart Shopping Cart Based on Computer Vision



Graduation project aimed at enhancing the in-store shopping experience through the use of computer vision and indoor navigation.  
The system detects products using YOLOv11 and guides users within the store using dynamic SVG-based maps.


## Overview

This system provides a smart cart capable of:

- Detecting products using a camera on the cart via a trained YOLOv11 model  
- Automatically adding recognized items to a digital shopping cart  
- Guiding users to desired product locations using indoor navigation  
- Managing products and users via a dedicated admin dashboard built with Next.js


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


## Tech Stack

| Component        | Technology               |
|------------------|---------------------------|
| Frontend         | Flutter                   |
| Backend          | Python, Supabase, Next.js |
| Object Detection | YOLOv11 (PyTorch)         |
| Mapping          | Custom SVG + Dijkstra     |
| Database         | Supabase PostgreSQL       |
| File Storage     | Supabase Storage          |



## Project Structure

```bash
Smart-shopping-cart/
├── model/              # YOLOv11 model and backend scripts
├── recommendation/     # Product recommendation logic
├── web/                # Admin dashboard (Next.js)
├── README.md           # Documentation
├── cart.jpg            # Project image
├── map.png             # Project image
├── product.jpg         # Project image


###  Cart View

![Cart View](https://raw.githubusercontent.com/RowydaElshaer219/Smart-shopping-cart-using-computer-vision/main/images/cart.jpg
)

###  Indoor Mapping

![Indoor Map](https://raw.githubusercontent.com/RowydaElshaer219/Smart-shopping-cart-using-computer-vision/main/images/map.png)

###  Add Product

![Add Product](https://raw.githubusercontent.com/RowydaElshaer219/Smart-shopping-cart-using-computer-vision/main/images/product.jpg)


## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/RowydaElshaer219/Smart-shopping-cart-using-computer-vision.git
cd Smart-shopping-cart-using-computer-vision
```

### 2. Set Up the Backend

```bash
cd model
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
```

> Update the `Supabase URL` and `Key` inside `Data.py`:

```python
url: str = "YOUR_SUPABASE_URL"
key: str = "YOUR_SUPABASE_KEY"
```

### 3. Run the Object Detection Server

```bash
python main.py
```

### 4. Set Up the Admin Dashboard

```bash
cd ../web
npm install
npm run dev
```

Create a `.env` file inside the `web/` directory:

```
SUPABASE_URL=your-supabase-url
PUBLIC_ANON_KEY=your-supabase-key
```


## Testing

* Present products in front of the cart camera to verify recognition
* Use the SVG indoor map to navigate and test pathfinding
* Try adding/removing products from the cart
* Use the admin dashboard to monitor data


## Demo Video

[🎥 Project Demo (Google Drive)](https://drive.google.com/file/d/1nQub6-MFoiFiLvgXKkEJPIKgzGiim87u/view)


## Team Members
* Rowayda Abdelrahem
* Mohamed AbuHamida
* Faris Awad
* Mohamed Amr
* Amr Awad
* Mariam Ghoniem
* Mariam Eslam
* Ahmed ElShafai
* Mahmoud Afandi
* Omer Mohamed



