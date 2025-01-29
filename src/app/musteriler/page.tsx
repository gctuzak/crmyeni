import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MusteriListesi } from "@/components/musteriler/musteri-listesi"
import { getMusteriler } from "@/lib/actions/musteri"

export default async function MusterilerPage() {
  const { musteriler, error } = await getMusteriler()

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Müşteriler</h1>
        <Button asChild>
          <Link href="/musteriler/yeni">Yeni Müşteri Ekle</Link>
        </Button>
      </div>

      <MusteriListesi musteriler={musteriler || []} />
    </div>
  )
} 