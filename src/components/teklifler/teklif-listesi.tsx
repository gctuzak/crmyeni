"use client"

import Link from "next/link"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import type { Teklifler, Musteriler, Kullanicilar, TeklifKalemleri } from "@prisma/client"

interface TeklifListesiProps {
  teklifler: (Teklifler & {
    musteri: Musteriler
    kullanici: Kullanicilar
    teklifKalemleri: TeklifKalemleri[]
  })[]
}

export function TeklifListesi({ teklifler }: TeklifListesiProps) {
  return (
    <div className="space-y-4">
      {teklifler.map((teklif) => (
        <Link
          key={teklif.id}
          href={`/teklifler/${teklif.id}`}
          className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">{teklif.baslik}</h2>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700">
                  {teklif.teklifNo}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {teklif.musteri.ad} {teklif.musteri.soyad}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">
                {new Intl.NumberFormat("tr-TR", {
                  style: "currency",
                  currency: teklif.paraBirimi,
                }).format(Number(teklif.toplamTutar))}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(teklif.olusturmaTarihi), "PPP", { locale: tr })}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">
                Sorumlu: {teklif.kullanici.ad} {teklif.kullanici.soyad}
              </p>
              <p className="text-muted-foreground">
                Kalem Sayısı: {teklif.teklifKalemleri.length}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDurumStyle(teklif.durum)}`}>
                  {teklif.durum}
                </span>
              </p>
              <p className="text-muted-foreground">
                Revizyon: {teklif.revizyon}
              </p>
            </div>
          </div>
        </Link>
      ))}

      {teklifler.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          Henüz teklif bulunmuyor.
        </div>
      )}
    </div>
  )
}

function getDurumStyle(durum: string) {
  switch (durum) {
    case "Taslak":
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    case "Hazırlanıyor":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "Gönderildi":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "Revize Edildi":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    case "Onaylandı":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "Reddedildi":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    case "İptal Edildi":
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  }
} 