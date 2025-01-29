import { getEtkinlik } from "@/lib/actions/etkinlik"
import { EtkinlikDetay } from "@/components/etkinlikler/etkinlik-detay"
import { notFound } from "next/navigation"

interface EtkinlikDetayPageProps {
  params: {
    id: string
  }
}

export default async function EtkinlikDetayPage({ params }: EtkinlikDetayPageProps) {
  const { etkinlik, error } = await getEtkinlik(parseInt(params.id))

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!etkinlik) {
    notFound()
  }

  return <EtkinlikDetay etkinlik={etkinlik} />
} 