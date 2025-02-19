"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { deleteUrun } from "@/lib/actions/urun"
import { toast } from "sonner"

type Urun = {
  id: number
  urunKodu: string
  urunAdi: string
  grupId: number
  birim: string
  birimFiyat: number
  kdvOrani: number
  aciklama: string | null
  aktif: boolean
  grup: {
    id: number
    grupKodu: string
    grupAdi: string
  }
}

export const columns: ColumnDef<Urun>[] = [
  {
    accessorKey: "urunKodu",
    header: "Ürün Kodu",
  },
  {
    accessorKey: "urunAdi",
    header: "Ürün Adı",
  },
  {
    accessorKey: "grup.grupAdi",
    header: "Grup",
  },
  {
    accessorKey: "birim",
    header: "Birim",
  },
  {
    accessorKey: "birimFiyat",
    header: "Birim Fiyat",
    cell: ({ row }) => {
      const birimFiyat = parseFloat(row.getValue("birimFiyat"))
      const formatted = new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
      }).format(birimFiyat)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "kdvOrani",
    header: "KDV Oranı",
    cell: ({ row }) => {
      const kdvOrani = parseFloat(row.getValue("kdvOrani"))
      const formatted = new Intl.NumberFormat("tr-TR", {
        style: "percent",
      }).format(kdvOrani / 100)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const urun = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menüyü aç</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
            <Link href={`/urunler/${urun.id}/duzenle`}>
              <DropdownMenuItem>Düzenle</DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              onClick={async () => {
                const { error } = await deleteUrun(urun.id)
                if (error) {
                  toast.error(error)
                  return
                }
                toast.success("Ürün başarıyla silindi.")
              }}
              className="text-red-600"
            >
              Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 