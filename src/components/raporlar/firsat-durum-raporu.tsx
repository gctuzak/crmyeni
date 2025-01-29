"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Asamalar } from "@prisma/client"

interface FirsatDurumRaporuProps {
  data: {
    asamaGruplari: (Asamalar & {
      firsatlar: any[]
      toplamDeger: number
    })[]
  }
  grafikTipi: string
}

export function FirsatDurumRaporu({ data, grafikTipi }: FirsatDurumRaporuProps) {
  // İstatistikleri hesapla
  const toplamFirsatSayisi = data.asamaGruplari.reduce((total, grup) => total + grup.firsatlar.length, 0)
  const toplamDeger = data.asamaGruplari.reduce((total, grup) => total + grup.toplamDeger, 0)

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Toplam Fırsat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{toplamFirsatSayisi}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Toplam Değer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              %{toplamDeger.toFixed(1)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aşamalara Göre Dağılım</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.asamaGruplari.map((grup) => (
              <div
                key={grup.id}
                className="p-4 bg-muted rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{grup.asamaAdi}</h3>
                    <p className="text-sm text-muted-foreground">
                      {grup.firsatlar.length} fırsat
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      %{grup.toplamDeger.toFixed(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {((grup.firsatlar.length / toplamFirsatSayisi) * 100).toFixed(1)}% oran
                    </p>
                  </div>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${(grup.firsatlar.length / toplamFirsatSayisi) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}

            {data.asamaGruplari.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                Bu tarih aralığında fırsat bulunmuyor.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 