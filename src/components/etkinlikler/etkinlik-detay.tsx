"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { EtkinlikForm } from "./etkinlik-form"
import { deleteEtkinlik } from "@/lib/actions/etkinlik"
import type { Etkinlikler, Musteriler, Kullanicilar } from "@prisma/client"

interface EtkinlikDetayProps {
  etkinlik: Etkinlikler & {
    musteri: Musteriler
    kullanici: Kullanicilar
  }
}

export function EtkinlikDetay({ etkinlik }: EtkinlikDetayProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)

  async function handleDelete() {
    if (confirm("Bu etkinliği silmek istediğinizden emin misiniz?")) {
      const result = await deleteEtkinlik(etkinlik.id)
      if (result.error) {
        // TODO: Hata gösterimi ekle
        console.error(result.error)
        return
      }
      router.push("/etkinlikler")
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {etkinlik.etkinlikTipi}
        </h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "İptal" : "Düzenle"}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Sil
          </Button>
        </div>
      </div>

      {isEditing ? (
        <EtkinlikForm
          initialData={{
            musteriId: etkinlik.musteriId,
            etkinlikTipi: etkinlik.etkinlikTipi,
            baslangicTarihi: format(new Date(etkinlik.baslangicTarihi), "yyyy-MM-dd'T'HH:mm"),
            bitisTarihi: etkinlik.bitisTarihi
              ? format(new Date(etkinlik.bitisTarihi), "yyyy-MM-dd'T'HH:mm")
              : "",
            aciklama: etkinlik.aciklama || "",
            kullaniciId: etkinlik.kullaniciId,
            id: etkinlik.id,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Müşteri</h2>
              <p className="mt-1">
                {etkinlik.musteri.ad} {etkinlik.musteri.soyad}
              </p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Başlangıç Tarihi</h2>
              <p className="mt-1">
                {format(new Date(etkinlik.baslangicTarihi), "PPP HH:mm", { locale: tr })}
              </p>
            </div>
            {etkinlik.bitisTarihi && (
              <div>
                <h2 className="text-sm font-medium text-gray-500">Bitiş Tarihi</h2>
                <p className="mt-1">
                  {format(new Date(etkinlik.bitisTarihi), "PPP HH:mm", { locale: tr })}
                </p>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Sorumlu</h2>
              <p className="mt-1">
                {etkinlik.kullanici.ad} {etkinlik.kullanici.soyad}
              </p>
            </div>
            {etkinlik.aciklama && (
              <div>
                <h2 className="text-sm font-medium text-gray-500">Açıklama</h2>
                <p className="mt-1 whitespace-pre-wrap">{etkinlik.aciklama}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 