"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TeklifAnalizRaporuProps {
  data: {
    durumGruplari: Record<string, {
      durum: string
      teklifler: any[]
      toplamTutar: number
      ortalamaTutar: number
    }>
  }
  grafikTipi: string
}

export function TeklifAnalizRaporu({ data, grafikTipi }: TeklifAnalizRaporuProps) {
  // İstatistikleri hesapla
  const durumlar = Object.values(data.durumGruplari)
  const toplamTeklifSayisi = durumlar.reduce((total, grup) => total + grup.teklifler.length, 0)
  const toplamTutar = durumlar.reduce((total, grup) => total + grup.toplamTutar, 0)
  const ortalamaTutar = toplamTeklifSayisi > 0 ? toplamTutar / toplamTeklifSayisi : 0

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              }).format(toplamTutar)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ortalama Tutar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: "TRY",
              }).format(ortalamaTutar)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Durumlara Göre Dağılım</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {durumlar.map((grup) => (
              <div
                key={grup.durum}
                className="p-4 bg-muted rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{grup.durum}</h3>
                    <p className="text-sm text-muted-foreground">
                      {grup.teklifler.length} teklif
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      }).format(grup.toplamTutar)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {((grup.teklifler.length / toplamTeklifSayisi) * 100).toFixed(1)}% oran
                    </p>
                  </div>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${(grup.teklifler.length / toplamTeklifSayisi) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}

            {durumlar.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                Bu tarih aralığında teklif bulunmuyor.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tutar Dağılımı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {durumlar.map((grup) => (
              <div
                key={grup.durum}
                className="p-4 bg-muted rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{grup.durum}</h3>
                    <p className="text-sm text-muted-foreground">
                      Ortalama: {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      }).format(grup.ortalamaTutar)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Intl.NumberFormat("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      }).format(grup.toplamTutar)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {((grup.toplamTutar / toplamTutar) * 100).toFixed(1)}% oran
                    </p>
                  </div>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${(grup.toplamTutar / toplamTutar) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}

            {durumlar.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                Bu tarih aralığında teklif bulunmuyor.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 