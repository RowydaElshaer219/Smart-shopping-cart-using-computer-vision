"use client";

import React from "react";
import Prediction from "../components/prediction/Prediction";
import Recommend from "../components/recommed/Recommend";
import Map from "../components/map/Map";

export default function Home(): JSX.Element {
  const [activeSection, setActiveSection] = React.useState<string>("prediction");

  return (
    <div className="bg-gray-50 text-background min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar Buttons */}
      <div className="fixed  left-0 right-0 lg:top-1/2 lg:translate-y-[-50%] lg:left-auto lg:right-2 z-10 flex flex-row lg:flex-col items-center justify-center gap-4 p-3 bg-[#152d41] lg:rounded-2xl lg:py-6 lg:px-2">
        {["prediction", "recommendation", "map"].map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`[writing-mode:vertical-lr] rotate-180 text-sm lg:text-lg transition-all duration-300 rounded-xl py-3 px-2 text-white hover:scale-95 ${
              activeSection === section
                ? "bg-[#0f1f2c] shadow-black/90 shadow-lg scale-95"
                : "bg-[#152d41]"
            }`}
          >
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </button>
        ))}
      </div>

      {/* Main Section */}
      <div className="w-full">
        {activeSection === "prediction" && <Prediction />}
        {activeSection === "map" && <Map />}
        {activeSection === "recommendation" && <Recommend />}
      </div>
    </div>
  );
}
