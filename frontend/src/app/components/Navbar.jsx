import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Navbar() {
  return (
    <div>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #f0f0f0",
          padding: "0 16px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
 <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>        
         <Image src={"/favicon.png"} height={32} width={32} alt="logo"/>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link
            href="/auth/login"
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#555",
              textDecoration: "none",
              padding: "8px 16px",
            }}
          >
            Log In
          </Link>
          <Link
            href="/auth/signup"
            style={{
              fontSize: "14px",
              fontWeight: "700",
              color: "white",
              textDecoration: "none",
              padding: "8px 18px",
              background: "#3F8F3A",
              borderRadius: "6px",
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>
    </div>
  );
}
