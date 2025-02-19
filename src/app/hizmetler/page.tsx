import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { getHizmetler } from "@/lib/actions/hizmet"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function HizmetlerPage() {
  const { hizmetler, error } = await getHizmetler()

  if (error) {
    throw new Error(error)
  }

  if (!hizmetler) {
    throw new Error("Hizmetler bulunamadı.")
  }

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