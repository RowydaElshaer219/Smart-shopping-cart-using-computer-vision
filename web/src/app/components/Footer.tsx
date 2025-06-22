"use client";
import React from "react";
import { usePathname } from "next/navigation";
export default function Footer() {

  const pathname = usePathname();
  return (
    <section className={`${pathname === "/map" ? "bg-[#01205e]" : "bg-background"} text-white py-8`}>
      <div className="max-w-6xl mx-auto text-center">
        <p>
          &copy; {new Date().getFullYear()} Smart Shopping Cart. All Rights
          Reserved.
        </p>
      </div>
    </section>
  );
}
