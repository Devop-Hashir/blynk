import React from 'react'

export default function Features() {
    const features = [
      {
        icon: "💡",
        title: "Control Any Appliance",
        desc: "Lights, fans, AC, TV — add any home device and control it from one place.",
      },
      {
        icon: "🔌",
        title: "ESP32 & Relay Ready",
        desc: "Each device maps to a GPIO pin. Drop the pin into your ESP32 sketch and you're live.",
      },
      {
        icon: "🏠",
        title: "Organize by Room",
        desc: "Group devices by room so your dashboard stays clean and easy to navigate.",
      },
      {
        icon: "⚡",
        title: "Real-Time Toggling",
        desc: "Flip devices on or off instantly. No lag, no refresh needed.",
      },
      {
        icon: "🔒",
        title: "Secure Auth",
        desc: "Email verification, hashed passwords, and JWT-protected sessions.",
      },
      {
        icon: "📱",
        title: "Works Everywhere",
        desc: "Responsive layout that works on desktop, tablet, and mobile.",
      },
    ];
    
  return (
    <div>
            <section
        style={{ padding: "80px 24px", maxWidth: "1000px", margin: "0 auto" }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "32px",
            fontWeight: "800",
            marginBottom: "8px",
          }}
        >
          Everything you need
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#888",
            fontSize: "15px",
            marginBottom: "48px",
          }}
        >
          Built for makers, hobbyists, and anyone who wants a smarter home.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: "#f7f7f7",
                borderRadius: "12px",
                padding: "28px 24px",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "12px" }}>
                {f.icon}
              </div>
              <div
                style={{
                  fontWeight: "700",
                  fontSize: "16px",
                  marginBottom: "8px",
                  color: "#111",
                }}
              >
                {f.title}
              </div>
              <div style={{ fontSize: "14px", color: "#666", lineHeight: 1.6 }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
