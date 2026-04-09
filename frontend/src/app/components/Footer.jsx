import Link from 'next/link'
import React from 'react'

export default function Footer() {
  return (
    <div>
       <footer style={{
        borderTop: "1px solid #f0f0f0", padding: "24px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "26px", height: "26px", background: "#3F8F3A", color:"white ",
            display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "3px"
          }}>
            <span style={{ fontWeight: "900", fontSize: "14px" }}>A</span>
          </div>
          <span style={{ fontWeight: "700", fontSize: "14px", color: "#111" }}>AutoHome</span>
        </div>
        <span style={{ fontSize: "13px", color: "#aaa" }}>© {new Date().getFullYear()} AutoHome. All rights reserved.</span>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link href="/auth/login" style={{ fontSize: "13px", color: "#888", textDecoration: "none" }}>Login</Link>
          <Link href="/auth/signup" style={{ fontSize: "13px", color: "#888", textDecoration: "none" }}>Sign Up</Link>
        </div>
      </footer>
    </div>
  )
}
