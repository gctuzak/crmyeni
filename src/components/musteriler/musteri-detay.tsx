"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MusteriForm } from "./musteri-form"
import { IlgiliKisiForm } from "./ilgili-kisi-form"
import { deleteMusteri } from "@/lib/actions/musteri"
import { useAuth } from "@/hooks/use-auth"
import type { Musteriler, IlgiliKisiler } from "@prisma/client"

interface MusteriDetayProps {
  musteri: Musteriler & {
    ilgiliKisiler: IlgiliKisiler[]
  }
}

export function MusteriDetay({ musteri }: MusteriDetayProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showIlgiliKisiForm, setShowIlgiliKisiForm] = useState(false)

  async function handleDelete() {
    if (confirm("Bu müşteriyi silmek istediğinizden emin misiniz?")) {
      const result = await deleteMusteri(musteri.id)
      if (result.error) {
        // TODO: Hata gösterimi ekle
        console.error(result.error)
        return
      }
      router.push("/musteriler")
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {musteri.musteriTipi === "BIREYSEL" ? (
            <>
              {musteri.ad} {musteri.soyad}
            </>
          ) : (
            musteri.firmaAdi
          )}
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
        <MusteriForm 
          initialData={{ ...musteri, id: musteri.id }} 
          currentUser={{ id: user.id, rolId: user.rolId }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Müşteri Tipi</h2>
              <p className="mt-1">{musteri.musteriTipi === "BIREYSEL" ? "Bireysel" : "Kurumsal"}</p>
            </div>
            {musteri.musteriTipi === "BIREYSEL" ? (
              <>
                <div>
                  <h2 className="text-sm font-medium text-gray-500">TC Kimlik</h2>
                  <p className="mt-1">{musteri.tcKimlik || "-"}</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Vergi Dairesi</h2>
                  <p className="mt-1">{musteri.vergiDairesi || "-"}</p>
                </div>
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Vergi No</h2>
                  <p className="mt-1">{musteri.vergiNo || "-"}</p>
                </div>
              </>
            )}
            <div>
              <h2 className="text-sm font-medium text-gray-500">Telefon</h2>
              <p className="mt-1">{musteri.telefon || "-"}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">E-posta</h2>
              <p className="mt-1">{musteri.email || "-"}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Adres</h2>
              <p className="mt-1">{musteri.adres || "-"}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">İlgili Kişiler</h2>
          <Button onClick={() => setShowIlgiliKisiForm(!showIlgiliKisiForm)}>
            {showIlgiliKisiForm ? "İptal" : "Yeni İlgili Kişi"}
          </Button>
        </div>

        {showIlgiliKisiForm && (
          <div className="mb-8">
            <IlgiliKisiForm musteriId={musteri.id} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {musteri.ilgiliKisiler.map((kisi) => (
            <div
              key={kisi.id}
              className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">
                    {kisi.ad} {kisi.soyad}
                  </h3>
                  {kisi.unvan && (
                    <p className="text-sm text-muted-foreground">
                      {kisi.unvan}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1 text-sm">
                {kisi.telefon && (
                  <p className="flex items-center text-muted-foreground">
                    <span className="mr-2">📞</span>
                    {kisi.telefon}
                  </p>
                )}
                {kisi.email && (
                  <p className="flex items-center text-muted-foreground">
                    <span className="mr-2">📧</span>
                    {kisi.email}
                  </p>
                )}
              </div>
            </div>
          ))}

          {musteri.ilgiliKisiler.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500">
              Henüz ilgili kişi bulunmuyor.
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 