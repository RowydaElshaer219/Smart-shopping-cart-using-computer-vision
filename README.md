# 🛒 BAR2 (Smart Shopping Cart) 

A graduation project that aims to enhance the in-store shopping experience using computer vision and indoor navigation. The system enables automatic product detection using YOLOv11 and guides users through the store using SVG-based indoor maps.

## 🚀 Overview

This smart shopping cart system combines real-time object detection and indoor mapping to:
- Detect products using a camera mounted on the cart.
- Automatically add items to a virtual shopping cart.
- Display indoor navigation to help users find products efficiently.
- Manage product and user data using a Next.js dashboard.

## 🧠 Main Features

- 🔍 **YOLOv11-Based Object Detection**  
  Detects and recognizes products in real time without barcodes.

- 🛒 **Cart Management System**  
  Detected products are auto-added to the digital cart, with quantity and total price updated dynamically.

- 🗺️ **Indoor Navigation System**  
  Built using SVG maps and Dijkstra’s algorithm to guide users inside the store to their selected products.

- 🧭 **Route Optimization**  
  Shortest path calculation between cart location and desired product location.

- 📊 **Admin Dashboard (Next.js)**  
  A web interface for managing product data, viewing user activity, and system control.

## 🛠️ Tech Stack

| Component | Technology |
|----------|------------|
| Frontend | Flutter     |
| Backend  | Python, Supabase, Next.js |
| CV Model | YOLOv11 (PyTorch) |
| Maps     | SVG + Dijkstra Algorithm |
| Storage  | Supabase Storage |

## 📁 Project Structure

```bash
smart-shopping-cart/
├── model/                 # YOLOv11 model files and processing scripts
├── recommendation/        # Recommendation engine and logic
├── web/                   # Next.js dashboard for data management
├── README.md              # Project documentation
```

[Overview Video ](https://drive.google.com/file/u/0/d/1nQub6-MFoiFiLvgXKkEJPIKgzGiim87u/view)

![Cart View](https://raw.githubusercontent.com/Abuhamida/BAR2-Graduation-project/main/images/cart.jpg)

![Indoor Map](https://raw.githubusercontent.com/Abuhamida/BAR2-Graduation-project/main/images/map.png)

![Add Product](https://raw.githubusercontent.com/Abuhamida/BAR2-Graduation-project/main/images/product.jpg)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/smart-shopping-cart.git
cd smart-shopping-cart
```

### 2. Install Backend Dependencies

```bash
cd model
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

> **Note:**  
> Before running the backend, make sure to update the Supabase URL and Key in `model/Data.py`:
> ```python
> url: str = "Add supabase URL"
> key: str = "Add supabase Key"
> ```
> Replace the placeholder strings with your actual Supabase project credentials.



### 3. Run YOLOv11 Inference Server

Make sure your dataset is ready and the model is trained.

```bash
python main.py
```

### 4. Run Next.js Dashboard

Navigate to the `web/` folder and run:

```bash
npm install
npm run dev
```
> **Important:**  
> For security and best practices, **do not** hardcode your Supabase URL and Key in the code.  
> Instead, create a `.env` file in the `web/` directory and add your credentials:
> ```
> SUPABASE_URL=your-supabase-url
> PUBLIC_ANON_KEY=your-supabase-key
> ```


## 🧪 Testing

- Test object recognition using sample images or live video feed.
- Navigate through the map and verify route calculation.
- Add/remove products and check if the cart updates correctly.
- Use the admin dashboard to manage products and view data.

## 📚 Future Enhancements

- Integration with self-checkout/payment systems.
- User authentication and purchase history.
- Real-time store inventory management.
- Voice-assisted navigation.

## 🙏 Acknowledgements

- Supervisor: Dr. Amany Sarhan  
- Team Members: Mohamed AbuHamida, Faris Awad, Rowayda El Shaer, Amr Awad, Mariam Ghoniem, Mariam Eslam, Ahmed ElShafai, Mahmoud Afandi, Omer Mohamed, Mohamed Amr
- Tools: Ultralytics YOLO, Supabase, Flutter, PyTorch, Next.js

## 📜 License

This project is currently under development with the intent of forming a commercial startup.  
You are free to view the code and provide feedback, but **commercial use, redistribution, or replication is not permitted** without written permission from the authors.

For collaboration, licensing, or partnership inquiries, please contact us directly.

