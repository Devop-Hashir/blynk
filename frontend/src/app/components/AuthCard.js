"use client";

import Image from "next/image";

export default function AuthCard({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f0f0f0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', sans-serif",
        padding: "16px", // ← responsive padding
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <Image src={"/favicon.png"} height={60} width={60} alt="logo" />
      </div>

      {/* Card */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          padding: "40px 32px",
          width: "100%",
          maxWidth: "380px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
          boxSizing: "border-box", // ← responsive
        }}
      >
        {children}
      </div>
    </div>
  );
}
