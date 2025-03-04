import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { getUrunler } from "@/lib/actions/urun"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { decimalToNumber } from "@/lib/utils"

export default async function UrunlerPage() {
  const { data, error } = await getUrunler()

  if (error) {
    throw new Error(error)
  }

  if (!data) {
    throw new Error("Ürünler bulunamadı.")
  }

  // Decimal tipini number tipine dönüştür
  const formattedUrunler = data.map(urun => ({
    ...urun,
    birimFiyat: decimalToNumber(urun.birimFiyat)
  }))

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Ürünler</h1>
        <Link href="/urunler/ekle">
          <Button>Yeni Ürün</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={formattedUrunler} />
    </div>
  )
} 