"use client"

import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Etkinlikler, Firsatlar, Musteriler, Kullanicilar, Asamalar } from "@prisma/client"

interface MusteriAktiviteRaporuProps {
  data: {
    etkinlikler: (Etkinlikler & {
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

export function MusteriAktiviteRaporu({ data, grafikTipi }: MusteriAktiviteRaporuProps) {
  return (
    <Tabs defaultValue="etkinlikler">
      <TabsList className="mb-4">
        <TabsTrigger value="etkinlikler">Etkinlikler</TabsTrigger>
        <TabsTrigger value="firsatlar">Fırsatlar</TabsTrigger>
      </TabsList>

      <TabsContent value="etkinlikler">
        <Card>
          <CardHeader>
            <CardTitle>Etkinlik Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.etkinlikler.map((etkinlik) => (
                <div
                  key={etkinlik.id}
                  className="p-4 bg-muted rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{etkinlik.etkinlikTipi}</h3>
                      <p className="text-sm text-muted-foreground">
                        {etkinlik.kullanici.ad} {etkinlik.kullanici.soyad}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {format(new Date(etkinlik.baslangicTarihi), "PPP", { locale: tr })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(etkinlik.baslangicTarihi), "HH:mm", { locale: tr })}
                      </p>
                    </div>
                  </div>
                  {etkinlik.aciklama && (
                    <p className="text-sm text-muted-foreground">
                      {etkinlik.aciklama}
                    </p>
                  )}
                </div>
              ))}

              {data.etkinlikler.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Bu tarih aralığında etkinlik bulunmuyor.
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
                        {firsat.asama.asamaAdi}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        %{firsat.olasilik.toNumber()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(firsat.beklenenKapanisTarihi), "PPP", { locale: tr })}
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