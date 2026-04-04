import React from "react";

export default function Works() {
  const steps = [
    {
      step: "01",
      title: "Create an account",
      desc: "Sign up with your email and password. Verify your email to activate.",
    },
    {
      step: "02",
      title: "Add your devices",
      desc: "Name your appliance, pick its type, assign an ESP32 pin, and set the room.",
    },
    {
      step: "03",
      title: "Flash your ESP32",
      desc: "Use the pin map from your dashboard in your Arduino/ESP32 sketch.",
    },
    {
      step: "04",
      title: "Control from anywhere",
      desc: "Toggle devices on or off from your dashboard in real time.",
    },
  ];
  return (
    <div>
      <section style={{ background: "#f7f7f7", padding: "80px 24px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: "32px",
              fontWeight: "800",
              marginBottom: "8px",
            }}
          >
            How it works
          </h2>
          <p
            style={{
              textAlign: "center",
              color: "#888",
              fontSize: "15px",
              marginBottom: "48px",
            }}
          >
            Up and running in minutes.
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {steps.map((s, i) => (
              <div
                key={s.step}
                style={{
                  display: "flex",
                  gap: "20px",
                  alignItems: "flex-start",
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    minWidth: "44px",
                    height: "44px",
                    background: "#d4f532",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "900",
                    fontSize: "14px",
                    color: "#111",
                  }}
                >
                  {s.step}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: "700",
                      fontSize: "16px",
                      marginBottom: "4px",
                      color: "#111",
                    }}
                  >
                    {s.title}
                  </div>
                  <div
                    style={{ fontSize: "14px", color: "#666", lineHeight: 1.6 }}
                  >
                    {s.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
