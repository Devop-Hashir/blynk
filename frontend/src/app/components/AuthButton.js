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
        backgroundColor: disabled ? "#e8e8e8" : "#3F8F3A",
        color: disabled ? "#999" : "white",
        fontWeight: "700",
        fontSize: "15px",
        border: "none",
        borderRadius: "6px",
        cursor: disabled ? "not-allowed" : "pointer",
        marginBottom: "20px",
        transition: "background-color 0.2s",
      }}
      onMouseEnter={(e) => { if (!disabled) e.target.style.backgroundColor = "#44cc00" }}
      onMouseLeave={(e) => { if (!disabled) e.target.style.backgroundColor = "#3F8F3A" }}
    >
      {children}
    </button>
  );
}