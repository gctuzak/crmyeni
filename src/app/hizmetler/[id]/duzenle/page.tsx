import { HizmetForm } from "@/components/hizmetler/hizmet-form"
import { getHizmet } from "@/lib/actions/hizmet"
import { getUrunHizmetGruplari } from "@/lib/actions/urun"

interface Props {
  params: {
    id: string
  }
}

export default async function HizmetDuzenlePage({ params }: Props) {
  const [{ hizmet, error: hizmetError }, { gruplar, error: gruplarError }] = await Promise.all([
    getHizmet(Number(params.id)),
    getUrunHizmetGruplari(),
  ])

  if (hizmetError) {
    throw new Error(hizmetError)
  }

  if (gruplarError) {
    throw new Error(gruplarError)
  }

  if (!hizmet) {
    throw new Error("Hizmet bulunamadı.")
  }

  if (!gruplar) {
    throw new Error("Gruplar bulunamadı.")
  }

  // Sadece hizmet gruplarını filtrele
  const hizmetGruplari = gruplar.filter(grup => grup.grupTipi === "HIZMET")

  // Decimal tipini number'a dönüştür
  const formattedHizmet = {
    id: hizmet.id,
    hizmetKodu: hizmet.hizmetKodu,
    hizmetAdi: hizmet.hizmetAdi,
    grupId: hizmet.grupId,
    birim: hizmet.birim,
    birimFiyat: Number(hizmet.birimFiyat),
    kdvOrani: hizmet.kdvOrani,
    aciklama: hizmet.aciklama,
    aktif: hizmet.aktif,
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Hizmet Düzenle</h1>
      </div>
      <HizmetForm hizmet={formattedHizmet} gruplar={hizmetGruplari} />
    </div>
  )
} 