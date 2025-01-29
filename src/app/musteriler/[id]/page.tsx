import { getMusteri } from "@/lib/actions/musteri"
import { MusteriDetay } from "@/components/musteriler/musteri-detay"
import { notFound } from "next/navigation"

interface MusteriDetayPageProps {
  params: {
    id: string
  }
}

export default async function MusteriDetayPage({ params }: MusteriDetayPageProps) {
  const { musteri, error } = await getMusteri(parseInt(params.id))

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!musteri) {
    notFound()
  }

  return <MusteriDetay musteri={musteri} />
} 