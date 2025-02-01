import { notFound } from "next/navigation"
import { RaporDetay } from "@/components/raporlar/rapor-detay"
import { RAPOR_TIPLERI } from "@/lib/validations/rapor"

interface RaporDetayPageProps {
  params: {
    id: string
  }
}

export default function RaporDetayPage({ params }: RaporDetayPageProps) {
  const rapor = RAPOR_TIPLERI.find((r) => r.id === params.id)

  if (!rapor) {
    notFound()
  }

  return <RaporDetay rapor={rapor} />
} 