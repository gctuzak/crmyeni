"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Musteriler } from "@prisma/client"

interface MusteriListesiProps {
  musteriler: Musteriler[]
}

export function MusteriListesi({ musteriler }: MusteriListesiProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Müşteri Tipi</TableHead>
            <TableHead>Ad/Firma</TableHead>
            <TableHead>İletişim</TableHead>
            <TableHead>Vergi/TC No</TableHead>
            <TableHead>Kayıt Tarihi</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {musteriler.map((musteri) => (
            <TableRow key={musteri.id}>
              <TableCell>
                {musteri.musteriTipi === "BIREYSEL" ? "Bireysel" : "Kurumsal"}
              </TableCell>
              <TableCell>
                {musteri.musteriTipi === "BIREYSEL" ? (
                  <>
                    {musteri.ad} {musteri.soyad}
                  </>
                ) : (
                  musteri.firmaAdi
                )}
              </TableCell>
              <TableCell>
                {musteri.telefon && (
                  <div className="text-sm text-gray-500">
                    Tel: {musteri.telefon}
                  </div>
                )}
                {musteri.email && (
                  <div className="text-sm text-gray-500">
                    E-posta: {musteri.email}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {musteri.musteriTipi === "BIREYSEL" ? (
                  musteri.tcKimlik
                ) : (
                  <div>
                    {musteri.vergiDairesi && (
                      <div className="text-sm text-gray-500">
                        {musteri.vergiDairesi}
                      </div>
                    )}
                    {musteri.vergiNo}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {new Date(musteri.kayitTarihi).toLocaleDateString("tr-TR")}
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/musteriler/${musteri.id}`}>
                    Detay
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {musteriler.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Henüz müşteri bulunmuyor.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
} 