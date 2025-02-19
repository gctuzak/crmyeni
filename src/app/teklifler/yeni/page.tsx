import { TeklifForm } from "@/components/teklifler/teklif-form"
import { getMusteriler } from "@/lib/actions/musteri"

export default async function YeniTeklifPage() {
  const { musteriler, error } = await getMusteriler()

  if (error) {
    throw new Error(error)
  }

  if (!musteriler) {
    throw new Error("Müşteriler bulunamadı.")
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Yeni Teklif</h1>
      </div>
      <TeklifForm musteriler={musteriler} />
    </div>
  )
} 