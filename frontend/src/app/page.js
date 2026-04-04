"use client";
import { useState } from "react";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Works from "./components/Works";
import CTA from "./components/CTA";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', sans-serif",
        background: "#fff",
        color: "#111",
      }}
    >
      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <Hero />

      {/* Features */}
      <Features />
      {/* How it works */}
      <Works />

      {/* CTA */}

      <CTA />
      {/* Footer */}
      <Footer />
    </div>
  );
}
