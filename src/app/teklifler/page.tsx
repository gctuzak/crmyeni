import { getTeklifler } from "@/lib/actions/teklif"
import { Button } from "@/components/ui/button"
import { TeklifListesi } from "@/components/teklifler/teklif-listesi"
import Link from "next/link"

export default async function TekliflerPage() {
  const { teklifler, error } = await getTeklifler()

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
        <h1 className="text-3xl font-bold">Teklifler</h1>
        <Button asChild>
          <Link href="/teklifler/yeni">Yeni Teklif Ekle</Link>
        </Button>
      </div>

      <TeklifListesi teklifler={teklifler || []} />
    </div>
  )
} 