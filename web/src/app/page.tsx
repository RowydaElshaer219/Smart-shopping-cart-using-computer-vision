"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

import { motion } from "motion/react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-background mt-12">
      {/* Hero Section */}
      <motion.div
        className="relative bg-cover bg-center h-screen flex items-center justify-center"
        style={{
          backgroundImage: `url('/main-bg3.png')`,
        }}
        initial={{ opacity: 0.5, x: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        viewport={{ once: true }}
      >
        <motion.div
          className="text-center text-white px-6"
          initial={{ opacity: 0, x: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" , delay:0.5 }}
          viewport={{ once: true }}
        >
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
            Welcome to the Future of Shopping
          </h1>
          <p className="text-lg md:text-2xl mb-6">
            Experience seamless shopping with AI-powered carts.
          </p>
          <Link
            href={"/predict"}
            className="bg-background hover:bg-primary text-white font-bold py-3 px-8 rounded-md"
          >
            Try Free Demo
          </Link>
        </motion.div>
      </motion.div>

      {/* Introduction Section */}
      <motion.section
        className="py-16 px-8 bg-white"
        initial={{ opacity: 0, x: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">About Smart Shopping Cart</h2>
          <p className="text-lg text-gray-600">
            Our Smart Shopping Cart uses AI, IoT, and computer vision to
            revolutionize the shopping experience. From real-time price
            calculations to seamless checkout, it's the ultimate retail
            solution.
          </p>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-center mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Real-Time Cost",
                description:
                  "Automatically calculates the total cost of items in your cart.",
                icon: "/cost.png",
              },
              {
                title: "Seamless Checkout",
                description: "Skip the lines and pay directly via the cart.",
                icon: "/checkout.png",
              },
              {
                title: "Personalized Recommendations",
                description:
                  "Get tailored product suggestions based on your preferences.",
                icon: "/Recommendations.png",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="p-6 bg-white shadow-lg rounded-md text-center"
                initial={{ opacity: 0, x: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                transition={{
                  duration: 1,
                  ease: "easeInOut",
                  delay: 0.4 * index,
                }}
                viewport={{ once: true }}
              >
                <img
                  src={feature.icon}
                  alt={feature.title}
                  className="w-16 h-16 mx-auto mb-4 "
                />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            See the Smart Cart in Action
          </h2>
          <iframe
            width="100%"
            height="400"
            src="https://drive.google.com/file/d/1nQub6-MFoiFiLvgXKkEJPIKgzGiim87u/preview"
            title="Smart Cart Demo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          
          ></iframe>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                name: "Sarah J.",
                comment:
                  "The Smart Shopping Cart made my grocery trips so much faster and easier!",
                photo: "/female.png",
              },
              {
                name: "John D.",
                comment:
                  "I love the personalized recommendations. They’re spot on!",
                photo: "/male.png",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="p-6 bg-white shadow-lg rounded-md text-center"
                initial={{ opacity: 0, x:-50, y: 0 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                transition={{
                  duration: 1,
                  ease: "easeInOut",
                  delay: 0.4 * index,
                }}
                viewport={{ once: true }}
              >
                <img
                  src={testimonial.photo}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full mx-auto mb-4"
                />
                <p className="italic text-gray-600">"{testimonial.comment}"</p>
                <h4 className="text-lg font-bold mt-4">{testimonial.name}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
