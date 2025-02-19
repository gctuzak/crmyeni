import { HizmetForm } from "@/components/hizmetler/hizmet-form"
import { getUrunHizmetGruplari } from "@/lib/actions/urun"

export default async function YeniHizmetPage() {
  const { gruplar, error } = await getUrunHizmetGruplari()

  if (error) {
    throw new Error(error)
  }

  if (!gruplar) {
    throw new Error("Gruplar bulunamadı.")
  }

  // Sadece hizmet gruplarını filtrele
  const hizmetGruplari = gruplar.filter(grup => grup.grupTipi === "HIZMET")

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Yeni Hizmet</h1>
      </div>
      <HizmetForm gruplar={hizmetGruplari} />
    </div>
  )
} 