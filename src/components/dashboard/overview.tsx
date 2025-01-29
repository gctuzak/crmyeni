"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Oca",
    total: 120000
  },
  {
    name: "Şub",
    total: 180000
  },
  {
    name: "Mar",
    total: 240000
  },
  {
    name: "Nis",
    total: 160000
  },
  {
    name: "May",
    total: 320000
  },
  {
    name: "Haz",
    total: 280000
  },
  {
    name: "Tem",
    total: 260000
  },
  {
    name: "Ağu",
    total: 340000
  },
  {
    name: "Eyl",
    total: 280000
  },
  {
    name: "Eki",
    total: 300000
  },
  {
    name: "Kas",
    total: 380000
  },
  {
    name: "Ara",
    total: 420000
  }
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value / 1000}k₺`}
        />
        <Tooltip 
          formatter={(value: number) => [`${value.toLocaleString('tr-TR')}₺`, "Toplam"]}
          cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  )
} 