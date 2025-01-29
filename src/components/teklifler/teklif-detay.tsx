"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { TeklifForm } from "./teklif-form"
import { deleteTeklif, updateTeklifDurumu } from "@/lib/actions/teklif"
import { TEKLIF_DURUMLARI } from "@/lib/validations/teklif"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Teklifler, Musteriler, Kullanicilar, TeklifKalemleri } from "@prisma/client"

interface TeklifDetayProps {
  teklif: Teklifler & {
    musteri: Musteriler
    kullanici: Kullanicilar
    teklifKalemleri: TeklifKalemleri[]
  }
}

export function TeklifDetay({ teklif }: TeklifDetayProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)

  async function handleDelete() {
    if (confirm("Bu teklifi silmek istediğinizden emin misiniz?")) {
      const result = await deleteTeklif(teklif.id)
      if (result.error) {
        // TODO: Hata gösterimi ekle
        console.error(result.error)
        return
      }
      router.push("/teklifler")
    }
  }

  async function handleDurumChange(durum: string) {
    const result = await updateTeklifDurumu(teklif.id, durum)
    if (result.error) {
      // TODO: Hata gösterimi ekle
      console.error(result.error)
      return
    }
  }

  // Toplam tutarı hesapla
  const toplamTutarKDVsiz = teklif.teklifKalemleri.reduce((total, kalem) => {
    const birimFiyat = typeof kalem.birimFiyat === 'number' ? kalem.birimFiyat : Number(kalem.birimFiyat)
    return total + (birimFiyat * kalem.miktar)
  }, 0)

  const toplamKDV = teklif.teklifKalemleri.reduce((total, kalem) => {
    const birimFiyat = typeof kalem.birimFiyat === 'number' ? kalem.birimFiyat : Number(kalem.birimFiyat)
    return total + (birimFiyat * kalem.miktar * (kalem.kdvOrani / 100))
  }, 0)

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{teklif.baslik}</h1>
            <span className="px-2 py-1 text-sm font-medium rounded-full bg-gray-100 dark:bg-gray-700">
              {teklif.teklifNo}
            </span>
          </div>
          <p className="text-muted-foreground">
            {teklif.musteri.ad} {teklif.musteri.soyad}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            defaultValue={teklif.durum}
            onValueChange={handleDurumChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Durum seçin" />
            </SelectTrigger>
            <SelectContent>
              {TEKLIF_DURUMLARI.map((durum) => (
                <SelectItem key={durum} value={durum}>
                  {durum}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <TeklifForm
          initialData={{
            musteriId: teklif.musteriId,
            baslik: teklif.baslik,
            aciklama: teklif.aciklama || "",
            paraBirimi: teklif.paraBirimi,
            sonGecerlilikTarihi: format(new Date(teklif.sonGecerlilikTarihi), "yyyy-MM-dd'T'HH:mm"),
            kullaniciId: teklif.kullaniciId,
            notlar: teklif.notlar || "",
            teklifKalemleri: teklif.teklifKalemleri.map(kalem => ({
              urunAdi: kalem.urunAdi,
              miktar: kalem.miktar,
              birim: kalem.birim,
              birimFiyat: typeof kalem.birimFiyat === 'number' ? kalem.birimFiyat : Number(kalem.birimFiyat),
              kdvOrani: kalem.kdvOrani,
              aciklama: kalem.aciklama || "",
            })),
            id: teklif.id,
          }}
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-medium text-gray-500">Oluşturma Tarihi</h2>
                <p className="mt-1">
                  {format(new Date(teklif.olusturmaTarihi), "PPP", { locale: tr })}
                </p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">Son Geçerlilik Tarihi</h2>
                <p className="mt-1">
                  {format(new Date(teklif.sonGecerlilikTarihi), "PPP", { locale: tr })}
                </p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">Sorumlu</h2>
                <p className="mt-1">
                  {teklif.kullanici.ad} {teklif.kullanici.soyad}
                </p>
              </div>
              {teklif.aciklama && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Açıklama</h2>
                  <p className="mt-1 whitespace-pre-wrap">{teklif.aciklama}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-medium text-gray-500">Revizyon</h2>
                <p className="mt-1">{teklif.revizyon}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">Para Birimi</h2>
                <p className="mt-1">{teklif.paraBirimi}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500">Durum</h2>
                <p className="mt-1">
                  <span className={`px-2 py-1 text-sm font-medium rounded-full ${getDurumStyle(teklif.durum)}`}>
                    {teklif.durum}
                  </span>
                </p>
              </div>
              {teklif.notlar && (
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Notlar</h2>
                  <p className="mt-1 whitespace-pre-wrap">{teklif.notlar}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Teklif Kalemleri</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left">Ürün Adı</th>
                    <th className="py-2 px-4 text-right">Miktar</th>
                    <th className="py-2 px-4 text-left">Birim</th>
                    <th className="py-2 px-4 text-right">Birim Fiyat</th>
                    <th className="py-2 px-4 text-right">KDV Oranı</th>
                    <th className="py-2 px-4 text-right">KDV Tutarı</th>
                    <th className="py-2 px-4 text-right">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {teklif.teklifKalemleri.map((kalem, index) => {
                    const birimFiyat = typeof kalem.birimFiyat === 'number' ? kalem.birimFiyat : Number(kalem.birimFiyat)
                    const araToplam = birimFiyat * kalem.miktar
                    const kdvTutari = araToplam * (kalem.kdvOrani / 100)
                    const toplam = araToplam + kdvTutari

                    return (
                      <tr key={kalem.id} className="border-b">
                        <td className="py-2 px-4">
                          <div>
                            <p>{kalem.urunAdi}</p>
                            {kalem.aciklama && (
                              <p className="text-sm text-muted-foreground">{kalem.aciklama}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-4 text-right">{kalem.miktar}</td>
                        <td className="py-2 px-4">{kalem.birim}</td>
                        <td className="py-2 px-4 text-right">
                          {new Intl.NumberFormat("tr-TR", {
                            style: "currency",
                            currency: teklif.paraBirimi,
                          }).format(birimFiyat)}
                        </td>
                        <td className="py-2 px-4 text-right">%{kalem.kdvOrani}</td>
                        <td className="py-2 px-4 text-right">
                          {new Intl.NumberFormat("tr-TR", {
                            style: "currency",
                            currency: teklif.paraBirimi,
                          }).format(kdvTutari)}
                        </td>
                        <td className="py-2 px-4 text-right">
                          {new Intl.NumberFormat("tr-TR", {
                            style: "currency",
                            currency: teklif.paraBirimi,
                          }).format(toplam)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2">
                    <td colSpan={5} className="py-2 px-4 text-right font-medium">
                      Ara Toplam:
                    </td>
                    <td colSpan={2} className="py-2 px-4 text-right font-medium">
                      {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: teklif.paraBirimi,
                      }).format(toplamTutarKDVsiz)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="py-2 px-4 text-right font-medium">
                      Toplam KDV:
                    </td>
                    <td colSpan={2} className="py-2 px-4 text-right font-medium">
                      {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: teklif.paraBirimi,
                      }).format(toplamKDV)}
                    </td>
                  </tr>
                  <tr className="border-t-2">
                    <td colSpan={5} className="py-2 px-4 text-right font-medium">
                      Genel Toplam:
                    </td>
                    <td colSpan={2} className="py-2 px-4 text-right font-medium">
                      {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: teklif.paraBirimi,
                      }).format(Number(teklif.toplamTutar))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
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