import Link from 'next/link'
import React from 'react'

export default function Navbar() {
  return (
    <div>
            <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)",
        borderBottom: "1px solid #f0f0f0",
        padding: "0 32px", height: "60px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "34px", height: "34px", background: "#d4f532",
            display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px"
          }}>
            <span style={{ fontWeight: "900", fontSize: "18px", color: "#000" }}>B</span>
          </div>
          <span style={{ fontWeight: "800", fontSize: "18px", color: "#111" }}>Blynk</span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link href="/auth/login" style={{
            fontSize: "14px", fontWeight: "600", color: "#555",
            textDecoration: "none", padding: "8px 16px"
          }}>
            Log In
          </Link>
          <Link href="/auth/signup" style={{
            fontSize: "14px", fontWeight: "700", color: "#111",
            textDecoration: "none", padding: "8px 18px",
            background: "#d4f532", borderRadius: "6px"
          }}>
            Get Started
          </Link>
        </div>
      </nav>
    </div>
  )
}
