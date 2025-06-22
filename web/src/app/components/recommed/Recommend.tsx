import React from 'react'
import { useState } from "react";
import axios from "axios";

const products = [
  "Juhayna Milk",
  "Domty Cheese",
  "Greenland Mozzarella",
  "Nescafe Classic",
  "Lipton Tea",
  "Pepsi",
  "Coca-Cola",
  "Fayrouz Apple",
  "Tiger Energy Drink",
  "Baraka Water",
  "Heinz Ketchup",
  "Regina Pasta",
  "Farm Frites Fries",
  "Sunbulah Chicken",
  "Cadbury Dairy Milk",
  "Corona Chocolate",
  "Edita Molto",
  "Tiger Corn Flakes",
  "Al Doha Rice",
  "Persil Detergent",
];
export default function Recommend() {
    const [selectedProduct, setSelectedProduct] = useState<string>("");
    const [recommendations, setRecommendations] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
  
    const handleRecommend = async () => {
      if (!selectedProduct) return;
      setLoading(true);
      try {
        const response = await axios.post("http://localhost:5000/recommend", {
          product_name: selectedProduct,
        });
        setRecommendations(response.data.recommendations);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Product Recommender</h1>
  
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <label className="block mb-2 text-gray-700 font-semibold">
            Select a product:
          </label>
          <select
            className="w-full p-2 border rounded-md mb-4"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">-- Choose Product --</option>
            {products.map((product) => (
              <option key={product} value={product}>
                {product}
              </option>
            ))}
          </select>
  
          <button
            onClick={handleRecommend}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-full"
            disabled={loading}
          >
            {loading ? "Loading..." : "Get Recommendations"}
          </button>
  
          {recommendations.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-3 text-gray-800">Recommended Products:</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
}
