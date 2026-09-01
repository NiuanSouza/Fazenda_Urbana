"use client";
import React from "react";
import { FiSearch } from "react-icons/fi";
import { useDebounce } from "../../../hooks/useDebounce";

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
}

export function SearchInput({ placeholder = "Buscar...", onSearch, debounceMs = 300 }: SearchInputProps) {
  const [value, setValue] = React.useState("");
  const debouncedValue = useDebounce(value, debounceMs);

  React.useEffect(() => {
    onSearch(debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
      <FiSearch 
        size={16} 
        style={{ 
          position: "absolute", left: "12px", top: "50%", 
          transform: "translateY(-50%)", color: "var(--text-muted)" 
        }} 
      />
      <input
        type="text"
        className="form-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ paddingLeft: "36px" }}
      />
    </div>
  );
}
