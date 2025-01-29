"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  {
    name: "İlk Görüşme",
    value: 15,
    color: "#0ea5e9"
  },
  {
    name: "İhtiyaç Analizi",
    value: 12,
    color: "#6366f1"
  },
  {
    name: "Teklif Hazırlama",
    value: 8,
    color: "#8b5cf6"
  },
  {
    name: "Teklif Sunumu",
    value: 6,
    color: "#d946ef"
  },
  {
    name: "Müzakere",
    value: 4,
    color: "#f59e0b"
  },
  {
    name: "Sözleşme",
    value: 2,
    color: "#f97316"
  }
]

export function SalesFunnel() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [`${value} Fırsat`, ""]}
          itemStyle={{ color: "#000" }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
} 