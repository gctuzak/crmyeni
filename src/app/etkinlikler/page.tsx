import { getEtkinlikler } from "@/lib/actions/etkinlik"
import { Button } from "@/components/ui/button"
import { EtkinlikListesi } from "@/components/etkinlikler/etkinlik-listesi"
import Link from "next/link"

export default async function EtkinliklerPage() {
  const { etkinlikler, error } = await getEtkinlikler()

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
        <h1 className="text-3xl font-bold">Etkinlikler</h1>
        <Button asChild>
          <Link href="/etkinlikler/yeni">Yeni Etkinlik Ekle</Link>
        </Button>
      </div>

      <EtkinlikListesi etkinlikler={etkinlikler || []} />
    </div>
  )
} 