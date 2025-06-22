"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { li } from "motion/react-m";
export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    {
      href: "/",
      name: "Home",
    },
    {
      href: "/about",
      name: "About",
    },
    {
      href: "/services",
      name: "Services",
    },
    {
      href: "/contact",
      name: "Contact",
    },
  ];

  return (
    <nav className="bg-background text-white fixed top-0 w-full z-10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold text-blue-400 hover:text-primary"
            >
              <Image
                src={"/images/logo.jpg"}
                alt=""
                height={56}
                width={56}
              ></Image>
            </Link>
          </div>

          {/* Links for Desktop */}
          <div className="hidden md:flex space-x-8">
            {links.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className={`${
                  pathname == link.href
                    ? "border-b border-primary text-primary"
                    : ""
                } hover:text-primary`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-background">
          {links.map((link, index) => (
            <Link
              href={link.href}
              key={index}
              className={`${
                pathname == link.href
                  ? "border-b border-primary text-primary"
                  : ""
              } block px-4 py-2 text-sm hover:bg-gray-600 hover:text-primary`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
