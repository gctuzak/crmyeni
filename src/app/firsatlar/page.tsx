import { getFirsatlar } from "@/lib/actions/firsat"
import { Button } from "@/components/ui/button"
import { FirsatListesi } from "@/components/firsatlar/firsat-listesi"
import Link from "next/link"

export default async function FirsatlarPage() {
  const { firsatlar, error } = await getFirsatlar()

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
        <h1 className="text-3xl font-bold">Fırsatlar</h1>
        <Button asChild>
          <Link href="/firsatlar/yeni">Yeni Fırsat Ekle</Link>
        </Button>
      </div>

      <FirsatListesi firsatlar={firsatlar || []} />
    </div>
  )
} 