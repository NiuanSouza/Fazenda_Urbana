"use client";
import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../../../hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  // To avoid hydration mismatch, only render after mount if needed, 
  // but simpler to just render the button
  return (
    <button
      onClick={toggleTheme}
      style={{
        background: "transparent",
        border: "1px solid var(--border)",
        color: "var(--text-secondary)",
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all var(--transition-fast)"
      }}
      aria-label="Toggle theme"
      title="Alternar tema"
    >
      {theme === "light" ? <FiMoon size={18} /> : <FiSun size={18} />}
    </button>
  );
}
