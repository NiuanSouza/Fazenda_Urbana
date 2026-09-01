import React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state card">
      <div className="empty-state-icon">{icon}</div>
      <h3 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "8px" }}>
        {title}
      </h3>
      {description && <p className="empty-state-text" style={{ marginBottom: "20px" }}>{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
