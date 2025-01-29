"use client"

import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Teklifler, Firsatlar, Musteriler, Kullanicilar, Asamalar } from "@prisma/client"

interface SatisPerformansRaporuProps {
  data: {
    teklifler: (Teklifler & {
      musteri: Musteriler
      kullanici: Kullanicilar
    })[]
    firsatlar: (Firsatlar & {
      musteri: Musteriler
      asama: Asamalar
    })[]
  }
  grafikTipi: string
}

export function SatisPerformansRaporu({ data, grafikTipi }: SatisPerformansRaporuProps) {
  // İstatistikleri hesapla
  const toplamTeklifSayisi = data.teklifler.length
  const toplamTeklifTutari = data.teklifler.reduce((total, teklif) => total + teklif.toplamTutar.toNumber(), 0)
  const kazanilanFirsatSayisi = data.firsatlar.filter(f => f.asama.asamaAdi === "Kazanıldı").length
  const kaybedilenFirsatSayisi = data.firsatlar.filter(f => f.asama.asamaAdi === "Kaybedildi").length
  const basariOrani = toplamTeklifSayisi > 0 ? (kazanilanFirsatSayisi / toplamTeklifSayisi) * 100 : 0

  return (
    <Tabs defaultValue="ozet">
      <TabsList className="mb-4">
        <TabsTrigger value="ozet">Özet</TabsTrigger>
        <TabsTrigger value="teklifler">Teklifler</TabsTrigger>
        <TabsTrigger value="firsatlar">Fırsatlar</TabsTrigger>
      </TabsList>

      <TabsContent value="ozet">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Toplam Teklif</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{toplamTeklifSayisi}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Toplam Tutar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                }).format(toplamTeklifTutari)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kazanılan/Kaybedilen</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {kazanilanFirsatSayisi}/{kaybedilenFirsatSayisi}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Başarı Oranı</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                %{basariOrani.toFixed(1)}
              </p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="teklifler">
        <Card>
          <CardHeader>
            <CardTitle>Teklif Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.teklifler.map((teklif) => (
                <div
                  key={teklif.id}
                  className="p-4 bg-muted rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{teklif.baslik}</h3>
                      <p className="text-sm text-muted-foreground">
                        {teklif.musteri.ad} {teklif.musteri.soyad}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Intl.NumberFormat("tr-TR", {
                          style: "currency",
                          currency: teklif.paraBirimi,
                        }).format(teklif.toplamTutar.toNumber())}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(teklif.olusturmaTarihi), "PPP", { locale: tr })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {data.teklifler.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Bu tarih aralığında teklif bulunmuyor.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="firsatlar">
        <Card>
          <CardHeader>
            <CardTitle>Fırsat Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.firsatlar.map((firsat) => (
                <div
                  key={firsat.id}
                  className="p-4 bg-muted rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{firsat.baslik}</h3>
                      <p className="text-sm text-muted-foreground">
                        {firsat.musteri.ad} {firsat.musteri.soyad}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {firsat.asama.asamaAdi}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        %{firsat.olasilik.toNumber()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {data.firsatlar.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Bu tarih aralığında fırsat bulunmuyor.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 