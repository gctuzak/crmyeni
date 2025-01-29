import { getTeklif } from "@/lib/actions/teklif"
import { TeklifDetay } from "@/components/teklifler/teklif-detay"
import { notFound } from "next/navigation"

interface TeklifDetayPageProps {
  params: {
    id: string
  }
}

export default async function TeklifDetayPage({ params }: TeklifDetayPageProps) {
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

  return <TeklifDetay teklif={teklif} />
} 