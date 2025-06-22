from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

# Load product data
products_df = pd.DataFrame([
    {"product_name": "Juhayna Milk", "category": "Dairy", "description": "Fresh cow milk rich in calcium", "price": 25.00},
    {"product_name": "Domty Cheese", "category": "Dairy", "description": "Soft white cheese with a creamy texture", "price": 30.00},
    {"product_name": "Greenland Mozzarella", "category": "Dairy", "description": "Shredded mozzarella cheese for pizza", "price": 65.00},
    {"product_name": "Nescafe Classic", "category": "Beverages", "description": "Instant coffee with rich aroma", "price": 85.00},
    {"product_name": "Lipton Tea", "category": "Beverages", "description": "Black tea leaves for a strong taste", "price": 45.00},
    {"product_name": "Pepsi", "category": "Soft Drinks", "description": "Carbonated cola-flavored soft drink", "price": 15.00},
    {"product_name": "Coca-Cola", "category": "Soft Drinks", "description": "Refreshing cola drink with a unique taste", "price": 15.00},
    {"product_name": "Fayrouz Apple", "category": "Soft Drinks", "description": "Apple-flavored malt beverage", "price": 20.00},
    {"product_name": "Tiger Energy Drink", "category": "Energy Drinks", "description": "High caffeine energy drink", "price": 35.00},
    {"product_name": "Baraka Water", "category": "Water", "description": "Natural mineral water bottle", "price": 10.00},
    {"product_name": "Heinz Ketchup", "category": "Sauces & Condiments", "description": "Tomato ketchup with a sweet and tangy taste", "price": 30.00},
    {"product_name": "Regina Pasta", "category": "Dry Food", "description": "Premium quality macaroni pasta", "price": 35.00},
    {"product_name": "Farm Frites Fries", "category": "Frozen Food", "description": "Frozen French fries, crispy and golden", "price": 50.00},
    {"product_name": "Sunbulah Chicken", "category": "Frozen Food", "description": "Frozen chicken breasts", "price": 120.00},
    {"product_name": "Cadbury Dairy Milk", "category": "Snacks", "description": "Chocolate bar with a smooth creamy texture", "price": 25.00},
    {"product_name": "Corona Chocolate", "category": "Snacks", "description": "Egyptian-made milk chocolate", "price": 20.00},
    {"product_name": "Edita Molto", "category": "Bakery & Snacks", "description": "Chocolate-filled croissant", "price": 15.00},
    {"product_name": "Tiger Corn Flakes", "category": "Breakfast Cereals", "description": "Crispy corn flakes fortified with vitamins", "price": 40.00},
    {"product_name": "Al Doha Rice", "category": "Dry Food", "description": "Egyptian white rice", "price": 50.00},
    {"product_name": "Persil Detergent", "category": "Cleaning Supplies", "description": "Powerful laundry detergent", "price": 90.00}
])

# TF-IDF Vectorization
tfidf = TfidfVectorizer(stop_words="english")
tfidf_matrix = tfidf.fit_transform(products_df["description"])

# Compute similarity
cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

# Recommendation function
def get_recommendations(product_name, num_recommendations=3):
    if product_name not in products_df["product_name"].values:
        return []
    
    idx = products_df[products_df["product_name"] == product_name].index[0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:num_recommendations+1]
    recommended_products = [products_df.iloc[i[0]]["product_name"] for i in sim_scores]
    return recommended_products

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    product_name = data.get("product_name", "")
    recommendations = get_recommendations(product_name)
    return jsonify({"recommendations": recommendations})

if __name__ == '__main__':
    app.run(debug=True)
