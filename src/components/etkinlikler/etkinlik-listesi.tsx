"use client"

import Link from "next/link"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Etkinlikler, Musteriler, IlgiliKisiler, Kullanicilar } from "@prisma/client"

interface EtkinlikListesiProps {
  etkinlikler: (Etkinlikler & {
    musteri: Musteriler
    ilgiliKisi: Pick<IlgiliKisiler, "id" | "ad" | "soyad" | "unvan"> | null
    kullanici: Pick<Kullanicilar, "id" | "ad" | "soyad" | "email">
  })[]
}

const durumRenkleri: { [key: string]: string } = {
  BEKLIYOR: "bg-yellow-100 text-yellow-800",
  DEVAM_EDIYOR: "bg-blue-100 text-blue-800",
  TAMAMLANDI: "bg-green-100 text-green-800",
  IPTAL_EDILDI: "bg-red-100 text-red-800",
}

const oncelikRenkleri: { [key: string]: string } = {
  DUSUK: "bg-gray-100 text-gray-800",
  NORMAL: "bg-blue-100 text-blue-800",
  YUKSEK: "bg-orange-100 text-orange-800",
  KRITIK: "bg-red-100 text-red-800",
}

export function EtkinlikListesi({ etkinlikler }: EtkinlikListesiProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Etkinlik Tipi</TableHead>
            <TableHead>Müşteri</TableHead>
            <TableHead>İlgili Kişi</TableHead>
            <TableHead>Başlangıç</TableHead>
            <TableHead>Bitiş</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Öncelik</TableHead>
            <TableHead>Sorumlu</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {etkinlikler.map((etkinlik) => (
            <TableRow key={etkinlik.id}>
              <TableCell>
                {etkinlik.etkinlikTipi.replace(/_/g, " ")}
              </TableCell>
              <TableCell>
                <Link
                  href={`/musteriler/${etkinlik.musteriId}`}
                  className="hover:underline"
                >
                  {etkinlik.musteri.musteriTipi === "BIREYSEL"
                    ? `${etkinlik.musteri.ad} ${etkinlik.musteri.soyad}`
                    : etkinlik.musteri.firmaAdi}
                </Link>
              </TableCell>
              <TableCell>
                {etkinlik.ilgiliKisi ? (
                  <div>
                    <div className="font-medium">
                      {etkinlik.ilgiliKisi.ad} {etkinlik.ilgiliKisi.soyad}
                    </div>
                    {etkinlik.ilgiliKisi.unvan && (
                      <div className="text-sm text-gray-500">
                        {etkinlik.ilgiliKisi.unvan}
                      </div>
                    )}
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                {format(new Date(etkinlik.baslangicTarihi), "Pp", { locale: tr })}
              </TableCell>
              <TableCell>
                {etkinlik.bitisTarihi
                  ? format(new Date(etkinlik.bitisTarihi), "Pp", { locale: tr })
                  : "-"}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={durumRenkleri[etkinlik.durum]}
                >
                  {etkinlik.durum.replace(/_/g, " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={oncelikRenkleri[etkinlik.oncelik]}
                >
                  {etkinlik.oncelik}
                </Badge>
              </TableCell>
              <TableCell>
                {etkinlik.kullanici.ad} {etkinlik.kullanici.soyad}
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/etkinlikler/${etkinlik.id}`}>
                    Detay
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {etkinlikler.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                Henüz etkinlik bulunmuyor.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
} 