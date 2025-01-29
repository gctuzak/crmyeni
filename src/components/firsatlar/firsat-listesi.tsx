"use client"

import Link from "next/link"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import type { Firsatlar, Musteriler, Asamalar } from "@prisma/client"

interface FirsatListesiProps {
  firsatlar: (Firsatlar & {
    musteri: Musteriler
    asama: Asamalar
  })[]
}

export function FirsatListesi({ firsatlar }: FirsatListesiProps) {
  return (
    <div className="space-y-4">
      {firsatlar.map((firsat) => (
        <Link
          key={firsat.id}
          href={`/firsatlar/${firsat.id}`}
          className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">{firsat.baslik}</h2>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAsamaStyle(firsat.asama.asamaAdi)}`}>
                  {firsat.asama.asamaAdi}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {firsat.musteri.ad} {firsat.musteri.soyad}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">
                %{typeof firsat.olasilik === 'number' ? firsat.olasilik : Number(firsat.olasilik)}
              </p>
              {firsat.beklenenKapanisTarihi && (
                <p className="text-sm text-muted-foreground">
                  {format(new Date(firsat.beklenenKapanisTarihi), "d MMM yyyy", { locale: tr })}
                </p>
              )}
            </div>
          </div>
        </Link>
      ))}

      {firsatlar.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          Henüz fırsat bulunmuyor.
        </div>
      )}
    </div>
  )
}

function getAsamaStyle(asamaAdi: string) {
  switch (asamaAdi) {
    case "İlk Görüşme":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "İhtiyaç Analizi":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
    case "Teklif Hazırlama":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    case "Teklif Sunumu":
      return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
    case "Müzakere":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "Sözleşme":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    case "Kazanıldı":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "Kaybedildi":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  }
} 