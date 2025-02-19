import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { getUrunler } from "@/lib/actions/urun"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function UrunlerPage() {
  const { urunler, error } = await getUrunler()

  if (error) {
    throw new Error(error)
  }

  if (!urunler) {
    throw new Error("Ürünler bulunamadı.")
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Ürünler</h1>
        <Link href="/urunler/ekle">
          <Button>Yeni Ürün</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={urunler} />
    </div>
  )
} 