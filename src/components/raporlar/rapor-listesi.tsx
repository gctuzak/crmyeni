"use client"

import Link from "next/link"
import { BarChart3, LineChart, PieChart, Activity, FileText } from "lucide-react"

interface RaporListesiProps {
  raporlar: {
    id: string
    baslik: string
    aciklama: string
  }[]
}

export function RaporListesi({ raporlar }: RaporListesiProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {raporlar.map((rapor) => (
        <Link
          key={rapor.id}
          href={`/raporlar/${rapor.id}`}
          className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              {getRaporIcon(rapor.id)}
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">{rapor.baslik}</h2>
              <p className="text-sm text-muted-foreground">{rapor.aciklama}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function getRaporIcon(raporId: string) {
  switch (raporId) {
    case "musteri-aktivite":
      return <Activity className="w-6 h-6 text-primary" />
    case "satis-performans":
      return <LineChart className="w-6 h-6 text-primary" />
    case "firsat-durum":
      return <PieChart className="w-6 h-6 text-primary" />
    case "teklif-analiz":
      return <BarChart3 className="w-6 h-6 text-primary" />
    default:
      return <FileText className="w-6 h-6 text-primary" />
  }
} 