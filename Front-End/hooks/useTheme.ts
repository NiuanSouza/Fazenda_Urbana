"use client";
import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return { theme, toggleTheme };
}
