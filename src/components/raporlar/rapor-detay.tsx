"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { raporFiltreSchema, type RaporFiltre, GRAFIK_TIPLERI } from "@/lib/validations/rapor"
import { getMusteriAktiviteRaporu, getSatisPerformansRaporu, getFirsatDurumRaporu, getTeklifAnalizRaporu } from "@/lib/actions/rapor"
import { MusteriAktiviteRaporu } from "./musteri-aktivite-raporu"
import { SatisPerformansRaporu } from "./satis-performans-raporu"
import { FirsatDurumRaporu } from "./firsat-durum-raporu"
import { TeklifAnalizRaporu } from "./teklif-analiz-raporu"

interface RaporDetayProps {
  rapor: {
    id: string
    baslik: string
    aciklama: string
  }
}

export function RaporDetay({ rapor }: RaporDetayProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [grafikTipi, setGrafikTipi] = useState(GRAFIK_TIPLERI[0].id)

  const form = useForm<RaporFiltre>({
    resolver: zodResolver(raporFiltreSchema),
    defaultValues: {
      baslangicTarihi: format(new Date().setMonth(new Date().getMonth() - 1), "yyyy-MM-dd'T'HH:mm"),
      bitisTarihi: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  })

  async function onSubmit(filtre: RaporFiltre) {
    try {
      setLoading(true)
      let result

      switch (rapor.id) {
        case "musteri-aktivite":
          result = await getMusteriAktiviteRaporu(filtre)
          break
        case "satis-performans":
          result = await getSatisPerformansRaporu(filtre)
          break
        case "firsat-durum":
          result = await getFirsatDurumRaporu(filtre)
          break
        case "teklif-analiz":
          result = await getTeklifAnalizRaporu(filtre)
          break
      }

      if (result?.error) {
        // TODO: Hata gösterimi ekle
        console.error(result.error)
        return
      }

      setData(result)
    } catch (error) {
      console.error("Rapor oluşturulurken bir hata oluştu:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{rapor.baslik}</h1>
          <p className="text-muted-foreground">{rapor.aciklama}</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label htmlFor="baslangicTarihi">Başlangıç Tarihi</Label>
            <Input
              id="baslangicTarihi"
              type="datetime-local"
              {...form.register("baslangicTarihi")}
            />
            {form.formState.errors.baslangicTarihi && (
              <p className="text-sm text-red-500">
                {form.formState.errors.baslangicTarihi.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bitisTarihi">Bitiş Tarihi</Label>
            <Input
              id="bitisTarihi"
              type="datetime-local"
              {...form.register("bitisTarihi")}
            />
            {form.formState.errors.bitisTarihi && (
              <p className="text-sm text-red-500">
                {form.formState.errors.bitisTarihi.message}
              </p>
            )}
          </div>

          {rapor.id === "musteri-aktivite" && (
            <div className="space-y-2">
              <Label htmlFor="musteriId">Müşteri</Label>
              {/* TODO: Müşteri seçimi için combobox ekle */}
              <Input
                id="musteriId"
                type="number"
                {...form.register("musteriId", { valueAsNumber: true })}
              />
            </div>
          )}

          {rapor.id === "satis-performans" && (
            <div className="space-y-2">
              <Label htmlFor="kullaniciId">Kullanıcı</Label>
              {/* TODO: Kullanıcı seçimi için combobox ekle */}
              <Input
                id="kullaniciId"
                type="number"
                {...form.register("kullaniciId", { valueAsNumber: true })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="grafikTipi">Grafik Tipi</Label>
            <Select
              value={grafikTipi}
              onValueChange={setGrafikTipi}
            >
              <SelectTrigger>
                <SelectValue placeholder="Grafik tipi seçin" />
              </SelectTrigger>
              <SelectContent>
                {GRAFIK_TIPLERI.map((tip) => (
                  <SelectItem key={tip.id} value={tip.id}>
                    {tip.baslik}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Yükleniyor..." : "Raporu Oluştur"}
          </Button>
        </div>
      </form>

      {data && (
        <div className="mt-8">
          {rapor.id === "musteri-aktivite" && (
            <MusteriAktiviteRaporu data={data} grafikTipi={grafikTipi} />
          )}
          {rapor.id === "satis-performans" && (
            <SatisPerformansRaporu data={data} grafikTipi={grafikTipi} />
          )}
          {rapor.id === "firsat-durum" && (
            <FirsatDurumRaporu data={data} grafikTipi={grafikTipi} />
          )}
          {rapor.id === "teklif-analiz" && (
            <TeklifAnalizRaporu data={data} grafikTipi={grafikTipi} />
          )}
        </div>
      )}
    </div>
  )
} 