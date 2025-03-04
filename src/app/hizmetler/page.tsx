import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { getHizmetler } from "@/lib/actions/hizmet"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { decimalToNumber } from "@/lib/utils"

export default async function HizmetlerPage() {
  const { data, error } = await getHizmetler()

  if (error) {
    throw new Error(error)
  }

  if (!data) {
    throw new Error("Hizmetler bulunamadı.")
  }

  // Decimal tipini number tipine dönüştür
  const hizmetler = data.map(hizmet => ({
    ...hizmet,
    birimFiyat: decimalToNumber(hizmet.birimFiyat)
  }))

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Hizmetler</h1>
        <Link href="/hizmetler/ekle">
          <Button>Yeni Hizmet</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={hizmetler} />
    </div>
  )
} 