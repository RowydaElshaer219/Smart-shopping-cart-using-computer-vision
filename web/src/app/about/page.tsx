"use client";
import { motion } from "motion/react";
import React from "react";

const AboutPage: React.FC = () => {
  return (
    <div className="bg-gray-100 text-background min-h-screen pt-10">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-background to-background/90 text-white py-20 text-center ">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
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
            About Smart Shopping Cart
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
            Revolutionizing the way we shop with AI, computer vision, and IoT.
            Experience seamless and efficient shopping like never before.
          </motion.p>
        </div>
      </div>

      {/* Mission and Vision */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Mission */}
          <div>
            <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
            <p className="text-lg leading-relaxed">
              To provide a smarter and more efficient shopping experience
              through cutting-edge technology, reducing time spent in checkout
              lines and enhancing customer satisfaction.
            </p>
          </div>
          {/* Vision */}
          <div>
            <h2 className="text-3xl font-semibold mb-4">Our Vision</h2>
            <p className="text-lg leading-relaxed">
              To revolutionize retail by integrating AI and IoT into everyday
              shopping, creating a future where convenience and innovation meet
              seamlessly.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <h2 className="text-3xl font-semibold mb-8 text-center">
            Technology We Use
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {/* AI */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-bold mb-4">
                Artificial Intelligence
              </h3>
              <p className="text-gray-600">
                Smart algorithms to recognize products, predict customer
                preferences, and optimize the shopping process.
              </p>
            </div>
            {/* Computer Vision */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-bold mb-4">Computer Vision</h3>
              <p className="text-gray-600">
                Real-time item recognition using cameras and sensors for
                automatic billing and inventory management.
              </p>
            </div>
            {/* IoT */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md text-center">
              <h3 className="text-xl font-bold mb-4">IoT Integration</h3>
              <p className="text-gray-600">
                Seamlessly connected devices to track carts, assist with
                navigation, and provide a personalized experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-background text-white py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 text-center">
          <h2 className="text-3xl font-semibold mb-4">
            Learn More About Smart Shopping
          </h2>
          <p className="text-lg mb-6">
            Join us on our journey to redefine the shopping experience. Stay
            updated with our innovations and advancements.
          </p>
          <a
            href="/contact"
            className="bg-white text-background px-6 py-3 rounded-lg text-lg font-bold hover:bg-gray-200 transition duration-300"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
