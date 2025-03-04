"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { FirsatForm } from "./firsat-form"
import { deleteFirsat, updateFirsatAsama } from "@/lib/actions/firsat"
import { FIRSAT_ASAMALARI } from "@/lib/validations/firsat"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Firsatlar, Musteriler, Asamalar } from "@prisma/client"

interface FirsatDetayProps {
  firsat: Firsatlar & {
    musteri: Musteriler
    asama: Asamalar
  }
}

export function FirsatDetay({ firsat }: FirsatDetayProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)

  async function handleDelete() {
    if (confirm("Bu fırsatı silmek istediğinizden emin misiniz?")) {
      const result = await deleteFirsat(firsat.id)
      if (result.error) {
        // TODO: Hata gösterimi ekle
        console.error(result.error)
        return
      }
      router.push("/firsatlar")
    }
  }

  async function handleAsamaChange(asamaId: string) {
    const result = await updateFirsatAsama(firsat.id, parseInt(asamaId))
    if (result.error) {
      // TODO: Hata gösterimi ekle
      console.error(result.error)
      return
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{firsat.baslik}</h1>
            <span className={`px-2 py-1 text-sm font-medium rounded-full ${getAsamaStyle(firsat.asama.asamaAdi)}`}>
              {firsat.asama.asamaAdi}
            </span>
          </div>
          <p className="text-muted-foreground">
            {firsat.musteri.ad} {firsat.musteri.soyad}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            defaultValue={firsat.asamaId.toString()}
            onValueChange={handleAsamaChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Aşama seçin" />
            </SelectTrigger>
            <SelectContent>
              {FIRSAT_ASAMALARI.map((asama) => (
                <SelectItem key={asama.id} value={asama.id.toString()}>
                  {asama.asamaAdi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              console.log("Düzenleme durumu değişiyor, mevcut durum:", isEditing);
              setIsEditing(!isEditing);
              console.log("Düzenleme durumu yeni değer:", !isEditing);
            }}
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
        <FirsatForm
          initialData={{
            musteriId: firsat.musteriId,
            baslik: firsat.baslik,
            beklenenKapanisTarihi: firsat.beklenenKapanisTarihi 
              ? format(new Date(firsat.beklenenKapanisTarihi), "yyyy-MM-dd'T'HH:mm") 
              : "",
            asamaId: firsat.asamaId,
            olasilik: Number(firsat.olasilik),
            id: firsat.id,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Beklenen Kapanış Tarihi</h2>
              <p className="mt-1">
                {firsat.beklenenKapanisTarihi 
                  ? format(new Date(firsat.beklenenKapanisTarihi as Date), "PPP", { locale: tr }) 
                  : "Tarih Belirtilmemiş"}
              </p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Olasılık</h2>
              <p className="mt-1">%{typeof firsat.olasilik === 'number' ? firsat.olasilik : Number(firsat.olasilik)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Aşama</h2>
              <p className="mt-1">
                <span className={`px-2 py-1 text-sm font-medium rounded-full ${getAsamaStyle(firsat.asama.asamaAdi)}`}>
                  {firsat.asama.asamaAdi}
                </span>
              </p>
            </div>
          </div>
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