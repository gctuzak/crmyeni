"use client"

import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, UserPlus } from "lucide-react"

const rolRenkleri: { [key: string]: string } = {
  Admin: "bg-red-500 hover:bg-red-600",
  "Müşteri Temsilcisi": "bg-blue-500 hover:bg-blue-600",
}

interface Kullanici {
  id: number
  ad: string
  soyad: string
  email: string
  rol: {
    rolAdi: string
  }
}

interface KullaniciListesiProps {
  kullanicilar: Kullanici[]
}

export function KullaniciListesi({ kullanicilar }: KullaniciListesiProps) {
  const router = useRouter()

  if (!kullanicilar?.length) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-gray-500">Henüz kullanıcı bulunmuyor.</p>
        <Button onClick={() => router.push("/kullanicilar/yonetim/yeni")}>
          <UserPlus className="w-4 h-4 mr-2" />
          Yeni Kullanıcı Ekle
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-white dark:bg-gray-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ad Soyad</TableHead>
            <TableHead>E-posta</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead className="w-[100px]">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {kullanicilar.map((kullanici) => (
            <TableRow key={kullanici.id}>
              <TableCell className="font-medium">
                {kullanici.ad} {kullanici.soyad}
              </TableCell>
              <TableCell>{kullanici.email}</TableCell>
              <TableCell>
                <Badge className={rolRenkleri[kullanici.rol?.rolAdi] || "bg-gray-500"}>
                  {kullanici.rol?.rolAdi || "Bilinmiyor"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/kullanicilar/yonetim/${kullanici.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 