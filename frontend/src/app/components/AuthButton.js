"use client";

export default function AuthButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "12px",
        backgroundColor: disabled ? "#e8e8e8" : "#d4f532",
        color: disabled ? "#999" : "#111",
        fontWeight: "700",
        fontSize: "15px",
        border: "none",
        borderRadius: "6px",
        cursor: disabled ? "not-allowed" : "pointer",
        marginBottom: "20px",
        transition: "background-color 0.2s",
      }}
      onMouseEnter={(e) => { if (!disabled) e.target.style.backgroundColor = "#c2e020" }}
      onMouseLeave={(e) => { if (!disabled) e.target.style.backgroundColor = "#d4f532" }}
    >
      {children}
    </button>
  );
}