
"use client";
import React, { useState, ChangeEvent } from "react";
import axios from "axios";

const ProductDetector: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [detectedClass, setDetectedClass] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const detectProduct = async () => {
    if (!image) {
      alert("Please upload an image first.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", image);

      const response = await axios({
        method: "POST",
        url: "https://detect.roboflow.com/egyptian-market-products/3",
        params: {
          api_key: "K3DGLdydynKvl5fNNlxV",
        },
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.predictions.length > 0) {
        const detected = response.data.predictions[0].class;
        setDetectedClass(detected);
      } else {
        setDetectedClass("No product detected.");
      }
    } catch (error: any) {
      console.error("Detection Error:", error.message);
      setDetectedClass("Error during detection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-10 px-6">
      {/* Header Section */}
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Product Detection with AI
      </h1>
      <p className="text-gray-600 text-lg text-center max-w-2xl mb-10">
        Upload an image of a product, and our AI system will detect and classify the product for you in real-time.
      </p>

      {/* Upload Section */}
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Upload Product Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Image Preview */}
        {image && (
          <div className="mb-6 flex justify-center">
            <img
              src={URL.createObjectURL(image)}
              alt="Uploaded Preview"
              className="w-64 h-64 object-cover rounded-lg border border-gray-300"
            />
          </div>
        )}

        {/* Detection Button */}
        <div className="text-center">
          <button
            onClick={detectProduct}
            disabled={loading}
            className={`px-6 py-3 rounded-lg text-lg font-semibold transition ${
              loading
                ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                : "bg-background text-white hover:bg-primary"
            }`}
          >
            {loading ? "Detecting..." : "Detect Product"}
          </button>
        </div>
      </div>

      {/* Detected Class */}
      {detectedClass && (
        <div className="mt-10 bg-white max-w-lg w-full p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Detected Product
          </h2>
          <p className="text-gray-700 text-lg">{detectedClass}</p>
        </div>
      )}
    </div>
  );
};

export default ProductDetector;
