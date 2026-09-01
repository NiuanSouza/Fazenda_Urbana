import React from "react";
import styles from "./StatsCard.module.css";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  highlightColor?: "green" | "blue" | "purple" | "yellow" | "red" | "gray";
}

export function StatsCard({ title, value, icon, trend, highlightColor = "green" }: StatsCardProps) {
  return (
    <div className={`card ${styles.statsCard}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <div className={`${styles.iconWrapper} ${styles[highlightColor]}`}>
          {icon}
        </div>
      </div>
      <div className={styles.value}>{value}</div>
      {trend && (
        <div className={styles.trend}>
          <span className={trend.isPositive ? styles.trendUp : styles.trendDown}>
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
          <span className={styles.trendLabel}>{trend.label}</span>
        </div>
      )}
    </div>
  );
}
