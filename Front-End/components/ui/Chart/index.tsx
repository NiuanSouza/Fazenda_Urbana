"use client";
import React from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface ChartProps {
  data: any[];
  height?: number;
}

const COLORS = {
  primary: "var(--green-500)",
  secondary: "var(--green-200)",
  blue: "var(--blue-600)",
  purple: "var(--purple-600)",
  yellow: "var(--yellow)",
  red: "var(--red)",
  grid: "var(--border)",
  text: "var(--text-muted)"
};

const PIE_COLORS = [COLORS.primary, COLORS.blue, COLORS.purple, COLORS.yellow, COLORS.red];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number | string; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "var(--bg-card-solid)",
        border: "1px solid var(--border)",
        padding: "12px",
        borderRadius: "var(--radius-sm)",
        boxShadow: "var(--shadow-md)"
      }}>
        <p style={{ color: "var(--text-primary)", fontWeight: 600, marginBottom: "8px" }}>{label}</p>
        {payload.map((entry, index: number) => (
          <p key={index} style={{ color: entry.color, fontSize: "13px", fontWeight: 500 }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AreaChart({ data, height = 300 }: ChartProps & { dataKey: string; xAxisKey: string }) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
          <XAxis dataKey="mes" stroke={COLORS.text} fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke={COLORS.text} fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="count" name="Quantidade" stroke={COLORS.primary} strokeWidth={2} fillOpacity={1} fill="url(#colorPrimary)" />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChart({ data, height = 300 }: ChartProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
          <XAxis dataKey="mes" stroke={COLORS.text} fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke={COLORS.text} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="valor" name="Receita" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PieChart({ data, height = 300 }: ChartProps) {
  // Filter out 0 values for better display
  const filteredData = data.filter(item => item.value > 0);
  
  if (filteredData.length === 0) {
    return (
      <div style={{ width: "100%", height, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
        Sem dados suficientes
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px", color: "var(--text-primary)" }} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
