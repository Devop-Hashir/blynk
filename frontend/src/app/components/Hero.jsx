import Link from "next/link";
import React from "react";

export default function Hero() {
  return (
    <div>
      <section
        style={{
          background: "#f7f7f7",
          padding: "100px 24px 80px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: "#d4f532",
            borderRadius: "20px",
            padding: "4px 14px",
            fontSize: "12px",
            fontWeight: "700",
            color: "#111",
            marginBottom: "24px",
            letterSpacing: "0.05em",
          }}
        >
          HOME AUTOMATION
        </div>

        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: "900",
            color: "#111",
            lineHeight: 1.1,
            margin: "0 auto 24px",
            maxWidth: "720px",
          }}
        >
          Control your home
          <br />
          <span
            style={{
              color: "#111",
              background: "#d4f532",
              padding: "0 8px",
              borderRadius: "4px",
            }}
          >
            from anywhere.
          </span>
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "#666",
            maxWidth: "520px",
            margin: "0 auto 40px",
            lineHeight: 1.6,
          }}
        >
          Blynk lets you add home appliances, assign ESP32 GPIO pins, and toggle
          them on or off — all from a clean dashboard.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/auth/signup"
            style={{
              background: "#d4f532",
              color: "#111",
              fontWeight: "700",
              fontSize: "15px",
              padding: "14px 32px",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            Start for free →
          </Link>
          <Link
            href="/auth/login"
            style={{
              background: "#fff",
              color: "#111",
              fontWeight: "600",
              fontSize: "15px",
              padding: "14px 32px",
              borderRadius: "8px",
              textDecoration: "none",
              border: "1.5px solid #e0e0e0",
            }}
          >
            Log in
          </Link>
        </div>

        {/* Mock dashboard preview */}
        <div
          style={{
            marginTop: "64px",
            maxWidth: "800px",
            margin: "64px auto 0",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 8px 48px rgba(0,0,0,0.10)",
            overflow: "hidden",
            border: "1px solid #e8e8e8",
          }}
        >
          {/* Fake browser bar */}
          <div
            style={{
              background: "#f5f5f5",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              borderBottom: "1px solid #e8e8e8",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#ff5f57",
              }}
            />
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#febc2e",
              }}
            />
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#28c840",
              }}
            />
            <div
              style={{
                flex: 1,
                background: "#e8e8e8",
                borderRadius: "4px",
                height: "20px",
                marginLeft: "8px",
                maxWidth: "240px",
              }}
            />
          </div>
          {/* Fake dashboard content */}
          <div style={{ padding: "24px", background: "#f0f0f0" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              {[
                ["🏠", "4", "Devices"],
                ["✅", "2", "Active"],
                ["🚪", "2", "Rooms"],
              ].map(([icon, val, label]) => (
                <div
                  key={label}
                  style={{
                    background: "#fff",
                    borderRadius: "8px",
                    padding: "14px",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: "18px" }}>{icon}</div>
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: "700",
                      color: "#111",
                    }}
                  >
                    {val}
                  </div>
                  <div style={{ fontSize: "11px", color: "#888" }}>{label}</div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "12px",
              }}
            >
              {[
                { name: "Living Room Light", pin: "D2", icon: "💡", on: true },
                { name: "Bedroom Fan", pin: "D4", icon: "🌀", on: false },
                { name: "AC Unit", pin: "D5", icon: "❄️", on: true },
                { name: "TV", pin: "D6", icon: "📺", on: false },
              ].map((d) => (
                <div
                  key={d.name}
                  style={{
                    background: d.on ? "#111" : "#fff",
                    borderRadius: "10px",
                    padding: "16px",
                    border: d.on
                      ? "2px solid #d4f532"
                      : "2px solid transparent",
                  }}
                >
                  <div style={{ fontSize: "22px", marginBottom: "8px" }}>
                    {d.icon}
                  </div>
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "13px",
                      color: d.on ? "#fff" : "#111",
                    }}
                  >
                    {d.name}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: d.on ? "#aaa" : "#888",
                      marginBottom: "10px",
                    }}
                  >
                    Pin: {d.pin}
                  </div>
                  <div
                    style={{
                      width: "36px",
                      height: "20px",
                      borderRadius: "10px",
                      background: d.on ? "#d4f532" : "#ddd",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "3px",
                        left: d.on ? "19px" : "3px",
                        width: "14px",
                        height: "14px",
                        borderRadius: "50%",
                        background: "#fff",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
