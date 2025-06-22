"use client";

import React from "react";
import RealTimeDetection from "./WebcamPrediction";
import ProductDetector from "./ProductDetector";
import { motion } from "motion/react";
export default function Home(): JSX.Element {
  const [activeComponent, setActiveComponent] =
    React.useState<string>("realtime");

  return (
    <div className="bg-gray-50 text-background min-h-screen pt-10">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-background to-background/90 text-white py-16 text-center">
        <motion.h1
          className="text-4xl font-bold mb-4"
          initial={{ opacity: 0, x: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0, x: 0 }}
          transition={{
            duration: 1,
            ease: "easeInOut",
          }}
          viewport={{ once: true }}
        >
          Smart Product Detection
        </motion.h1>
        <motion.p
          className="text-lg"
          initial={{ opacity: 0, x: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0, x: 0 }}
          transition={{
            duration: 1,
            ease: "easeInOut",
            delay: 0.2,
          }}
          viewport={{ once: true }}
        >
          Choose between real-time detection or upload an image to identify
          products instantly.
        </motion.p>
      </div>

      {/* Navigation Buttons */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8 flex justify-center space-x-6">
        <button
          onClick={() => setActiveComponent("realtime")}
          className={`px-6 py-3 rounded-lg text-lg font-bold ${
            activeComponent === "realtime"
              ? "bg-background text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          } transition duration-300`}
        >
          Realtime Detection
        </button>
        <button
          onClick={() => setActiveComponent("image")}
          className={`px-6 py-3 rounded-lg text-lg font-bold ${
            activeComponent === "image"
              ? "bg-background text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          } transition duration-300`}
        >
          Detect by Image
        </button>
      </div>

      {/* Active Component Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8">
        {activeComponent === "realtime" && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Realtime Detection
            </h2>
            <RealTimeDetection />
          </div>
        )}
        {activeComponent === "image" && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Detect by Image
            </h2>
            <ProductDetector />
          </div>
        )}
      </div>

      <div className="bg-background text-white py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 text-center">
          <h2 className="text-3xl font-semibold mb-4">Try it Now!</h2>
          <p className="text-lg mb-6">
            Discover the power of AI with our product detection tools. Start
            your free trial today.
          </p>
          <a
            href="/contact"
            className="bg-white text-background px-6 py-3 rounded-lg text-lg font-bold hover:bg-gray-200 transition duration-300"
          >
            Contact Us for More Info
          </a>
        </div>
      </div>
    </div>
  );
}