import React from "react";

export type BadgeVariant = "green" | "red" | "yellow" | "blue" | "purple" | "gray";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

export function Badge({ children, variant = "gray", icon }: BadgeProps) {
  return (
    <span className={`badge badge-${variant}`}>
      {icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>}
      {children}
    </span>
  );
}
