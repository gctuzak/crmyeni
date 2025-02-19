"use client"

import { ColumnDef } from "@tanstack/react-table"
import { UrunHizmetGruplari } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export const columns: ColumnDef<UrunHizmetGruplari>[] = [
  {
    accessorKey: "kod",
    header: "Kod",
  },
  {
    accessorKey: "ad",
    header: "Ad",
  },
  {
    accessorKey: "grupTipi",
    header: "Tip",
    cell: ({ row }) => {
      const tip = row.getValue("grupTipi") as string
      return (
        <Badge variant={tip === "URUN" ? "default" : "secondary"}>
          {tip === "URUN" ? "Ürün" : "Hizmet"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "aktif",
    header: "Durum",
    cell: ({ row }) => {
      const aktif = row.getValue("aktif") as boolean
      return (
        <Badge variant={aktif ? "success" : "destructive"}>
          {aktif ? "Aktif" : "Pasif"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "siraNo",
    header: "Sıra No",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const grup = row.original
      const router = useRouter()

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
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(`/urunler/gruplar/${grup.id}/duzenle`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Düzenle
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/urunler/gruplar/${grup.id}/sil`)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 