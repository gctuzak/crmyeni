"use client"

import { useState } from "react"
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
import { MusteriDetayModal } from "./musteri-detay-modal"
import type { Musteriler, IlgiliKisiler, Kullanicilar } from "@prisma/client"

interface MusteriListesiProps {
  musteriler: (Musteriler & {
    ilgiliKisiler: IlgiliKisiler[]
    temsilci?: Kullanicilar
    kullanici: Kullanicilar
  })[]
}

export function MusteriListesi({ musteriler }: MusteriListesiProps) {
  const [selectedMusteri, setSelectedMusteri] = useState<(Musteriler & {
    ilgiliKisiler: IlgiliKisiler[]
    temsilci?: Kullanicilar
    kullanici: Kullanicilar
  }) | null>(null)

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Müşteri Tipi</TableHead>
              <TableHead>Ad/Firma</TableHead>
              <TableHead>İlgili Kişiler</TableHead>
              <TableHead>İletişim</TableHead>
              <TableHead>Vergi/TC No</TableHead>
              <TableHead>Müşteri Temsilcisi</TableHead>
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
                  <button
                    onClick={() => setSelectedMusteri(musteri)}
                    className="hover:underline focus:outline-none"
                  >
                    {musteri.musteriTipi === "BIREYSEL" ? (
                      <>
                        {musteri.ad} {musteri.soyad}
                      </>
                    ) : (
                      musteri.firmaAdi
                    )}
                  </button>
                </TableCell>
                <TableCell>
                  {musteri.ilgiliKisiler.length > 0 ? (
                    <div className="space-y-1">
                      {musteri.ilgiliKisiler.map((kisi) => (
                        <button
                          key={kisi.id}
                          onClick={() => setSelectedMusteri(musteri)}
                          className="block w-full text-left hover:bg-gray-50 rounded p-1 -m-1"
                        >
                          <div className="text-sm">
                            <span className="font-medium hover:underline">
                              {kisi.ad} {kisi.soyad}
                            </span>
                            {kisi.unvan && (
                              <span className="text-gray-500"> - {kisi.unvan}</span>
                            )}
                            {kisi.telefon && (
                              <div className="text-xs text-gray-500">
                                Tel: {kisi.telefon}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">İlgili kişi yok</span>
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
                  {musteri.temsilci ? (
                    <div>
                      {musteri.temsilci.ad} {musteri.temsilci.soyad}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Atanmamış</div>
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
                <TableCell colSpan={8} className="h-24 text-center">
                  Henüz müşteri bulunmuyor.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedMusteri && (
        <MusteriDetayModal
          musteri={selectedMusteri}
          open={!!selectedMusteri}
          onOpenChange={(open) => !open && setSelectedMusteri(null)}
        />
      )}
    </>
  )
} 