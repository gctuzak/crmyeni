"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Musteriler, IlgiliKisiler, Kullanicilar } from "@prisma/client"

interface MusteriDetayModalProps {
  musteri: Musteriler & {
    ilgiliKisiler: IlgiliKisiler[]
    temsilci?: Kullanicilar
    kullanici: Kullanicilar
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MusteriDetayModal({ musteri, open, onOpenChange }: MusteriDetayModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {musteri.musteriTipi === "BIREYSEL"
              ? `${musteri.ad} ${musteri.soyad}`
              : musteri.firmaAdi}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Müşteri Bilgileri</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Müşteri Tipi:</span>{" "}
                {musteri.musteriTipi === "BIREYSEL" ? "Bireysel" : "Kurumsal"}
              </div>
              {musteri.musteriTipi === "BIREYSEL" ? (
                <>
                  <div>
                    <span className="text-gray-500">TC Kimlik:</span> {musteri.tcKimlik}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-gray-500">Vergi Dairesi:</span>{" "}
                    {musteri.vergiDairesi}
                  </div>
                  <div>
                    <span className="text-gray-500">Vergi No:</span> {musteri.vergiNo}
                  </div>
                </>
              )}
              {musteri.telefon && (
                <div>
                  <span className="text-gray-500">Telefon:</span> {musteri.telefon}
                </div>
              )}
              {musteri.email && (
                <div>
                  <span className="text-gray-500">E-posta:</span> {musteri.email}
                </div>
              )}
              {musteri.adres && (
                <div>
                  <span className="text-gray-500">Adres:</span> {musteri.adres}
                </div>
              )}
              <div>
                <span className="text-gray-500">Kayıt Tarihi:</span>{" "}
                {new Date(musteri.kayitTarihi).toLocaleDateString("tr-TR")}
              </div>
              <div>
                <span className="text-gray-500">Müşteri Temsilcisi:</span>{" "}
                {musteri.temsilci ? (
                  <>
                    {musteri.temsilci.ad} {musteri.temsilci.soyad}
                  </>
                ) : (
                  "Atanmamış"
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">İlgili Kişiler</h3>
            {musteri.ilgiliKisiler.length > 0 ? (
              <div className="space-y-4">
                {musteri.ilgiliKisiler.map((kisi) => (
                  <div key={kisi.id} className="p-3 rounded-lg border bg-gray-50">
                    <div className="font-medium">
                      {kisi.ad} {kisi.soyad}
                    </div>
                    {kisi.unvan && (
                      <div className="text-sm text-gray-500">{kisi.unvan}</div>
                    )}
                    {kisi.telefon && (
                      <div className="text-sm text-gray-500">
                        Tel: {kisi.telefon}
                      </div>
                    )}
                    {kisi.email && (
                      <div className="text-sm text-gray-500">
                        E-posta: {kisi.email}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">İlgili kişi bulunmuyor.</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 