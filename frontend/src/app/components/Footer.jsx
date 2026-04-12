import Image from 'next/image'
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
         <Image src={"/favicon.png"} height={32} width={32} alt='logo'/>
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
