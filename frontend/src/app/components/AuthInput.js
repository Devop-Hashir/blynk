'use client'
import { useState } from "react";

export default function AuthInput({
  id,
  label,
  type = "text",
  icon,
  value,
  onChange
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div style={{ marginBottom: "16px" }}>
      <label htmlFor={id} style={{
        display: "block", fontSize: "11px", fontWeight: "700",
        color: "#888", letterSpacing: "0.08em", marginBottom: "6px",
        textTransform: "uppercase",
      }}>
        {label}
      </label>

      <div style={{ position: "relative" }}>
        {/* Left Icon */}
        <span style={{
          position: "absolute", left: "12px", top: "50%",
          transform: "translateY(-50%)", fontSize: "16px", color: "#aaa",
        }}>
          {icon}
        </span>

        {/* Input */}
        <input
          id={id}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          style={{
            width: "100%",
            padding: isPassword
              ? "10px 40px 10px 36px" // space for both icons
              : "10px 12px 10px 36px",
            border: "1.5px solid #e0e0e0",
            borderRadius: "6px",
            fontSize: "14px",
            color: "#333",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#3F8F3A")}
          onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
        />

        {/* Right Eye Icon (only for password) */}
        {isPassword && (
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              fontSize: "16px",
              color: "#aaa",
            }}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        )}
      </div>
    </div>
  );
}