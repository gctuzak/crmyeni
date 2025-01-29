"use client"

import Link from "next/link"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import type { Etkinlikler, Musteriler, Kullanicilar } from "@prisma/client"

interface EtkinlikListesiProps {
  etkinlikler: (Etkinlikler & {
    musteri: Musteriler
    kullanici: Kullanicilar
  })[]
}

export function EtkinlikListesi({ etkinlikler }: EtkinlikListesiProps) {
  return (
    <div className="space-y-4">
      {etkinlikler.map((etkinlik) => (
        <Link
          key={etkinlik.id}
          href={`/etkinlikler/${etkinlik.id}`}
          className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">{etkinlik.etkinlikTipi}</h2>
              <p className="text-sm text-muted-foreground">
                {etkinlik.musteri.ad} {etkinlik.musteri.soyad}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                {format(new Date(etkinlik.baslangicTarihi), "PPP", { locale: tr })}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(etkinlik.baslangicTarihi), "HH:mm", { locale: tr })}
              </p>
            </div>
          </div>

          {etkinlik.aciklama && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
              {etkinlik.aciklama}
            </p>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Sorumlu: {etkinlik.kullanici.ad} {etkinlik.kullanici.soyad}
            </p>
            {etkinlik.bitisTarihi && (
              <p>
                Bitiş: {format(new Date(etkinlik.bitisTarihi), "PPP HH:mm", { locale: tr })}
              </p>
            )}
          </div>
        </Link>
      ))}

      {etkinlikler.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          Henüz etkinlik bulunmuyor.
        </div>
      )}
    </div>
  )
} 