import { TeklifForm } from "@/components/teklifler/teklif-form"
import { getMusteriler } from "@/lib/actions/musteri"
import { serializable } from "@/lib/utils"

export default async function YeniTeklifPage() {
  try {
    const { musteriler, error } = await getMusteriler()

    if (error) {
      throw new Error(error)
    }

    // Müşteri verilerini serileştirelim
    const serializableMusteriler = serializable(musteriler || [])

    return (
      <div className="container mx-auto py-10">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Yeni Teklif</h1>
        </div>
        <TeklifForm musteriler={serializableMusteriler} />
      </div>
    )
  } catch (error) {
    console.error("Yeni teklif sayfası yüklenirken hata oluştu:", error)
    
    // Hata durumunda da sayfayı gösteriyoruz, ama müşteri listesi olmadan
    return (
      <div className="container mx-auto py-10">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Yeni Teklif</h1>
          {error instanceof Error && (
            <div className="mt-2 text-red-500">Hata: {error.message}</div>
          )}
        </div>
        <TeklifForm />
      </div>
    )
  }
} 