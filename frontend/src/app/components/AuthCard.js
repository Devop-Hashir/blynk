'use client'

export default function AuthCard({ children }) {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f0f0f0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif",
      padding: "16px",        // ← responsive padding
    }}>
      {/* Logo */}
      <div style={{
        width: "64px",
        height: "64px",
        backgroundColor: "#d4f532",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "24px",
      }}>
        <span style={{ fontSize: "36px", fontWeight: "900", color: "#000", lineHeight: 1 }}>
          B
        </span>
      </div>

      {/* Card */}
      <div style={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "40px 32px",
        width: "100%",
        maxWidth: "380px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        boxSizing: "border-box",   // ← responsive
      }}>
        {children}
      </div>
    </div>
  )
}