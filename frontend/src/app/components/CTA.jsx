import Link from 'next/link'
import React from 'react'

export default function CTA() {
  return (
    <div>
            <section style={{ padding: "80px 24px", textAlign: "center" }}>
        <h2
          style={{
            fontSize: "36px",
            fontWeight: "900",
            marginBottom: "16px",
            color: "#111",
          }}
        >
          Ready to automate your home?
        </h2>
        <p style={{ fontSize: "16px", color: "#888", marginBottom: "36px" }}>
          Free to use. No credit card required.
        </p>
        <Link
          href="/auth/signup"
          style={{
            background: "#d4f532",
            color: "#111",
            fontWeight: "700",
            fontSize: "16px",
            padding: "16px 40px",
            borderRadius: "8px",
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          Create your account →
        </Link>
      </section>
    </div>
  )
}
