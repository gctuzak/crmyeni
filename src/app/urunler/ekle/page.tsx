import { UrunForm } from "@/components/urunler/urun-form"
import { getUrunHizmetGruplari } from "@/lib/actions/urun"

export default async function UrunEklePage() {
  const { gruplar, error } = await getUrunHizmetGruplari()

  if (error) {
    throw new Error(error)
  }

  if (!gruplar) {
    throw new Error("Gruplar bulunamadı.")
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Yeni Ürün</h1>
      </div>
      <UrunForm gruplar={gruplar} />
    </div>
  )
} 