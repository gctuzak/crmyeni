import { getTeklif } from "@/lib/actions/teklif"
import { getMusteriler } from "@/lib/actions/musteri"
import { TeklifDetay } from "@/components/teklifler/teklif-detay"
import { notFound } from "next/navigation"
import { serializable } from "@/lib/utils"

interface TeklifDetayPageProps {
  params: {
    id: string
  }
}

export default async function TeklifDetayPage({ params }: TeklifDetayPageProps) {
  // Önce tüm müşterileri al (Teklif formu için gerekli)
  const { musteriler: allMusteriler } = await getMusteriler()
  
  const { teklif, error } = await getTeklif(parseInt(params.id))

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!teklif) {
    notFound()
  }

  // Decimal objelerini düzenle
  const serializableTeklif = serializable(teklif)
  const serializableMusteriler = serializable(allMusteriler || [])

  return <TeklifDetay teklif={serializableTeklif} allMusteriler={serializableMusteriler} />
} 