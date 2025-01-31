"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MusteriSecici } from "@/components/teklifler/musteri-secici"
import { IlgiliKisiSecici } from "@/components/teklifler/ilgili-kisi-secici"
import { etkinlikSchema, type EtkinlikForm } from "@/lib/validations/etkinlik"
import { createEtkinlik, updateEtkinlik } from "@/lib/actions/etkinlik"
import { ETKINLIK_TIPLERI, ETKINLIK_DURUMLARI, ETKINLIK_ONCELIKLERI } from "@/lib/validations/etkinlik"
import type { Musteriler, IlgiliKisiler } from "@prisma/client"

interface EtkinlikFormProps {
  initialData?: EtkinlikForm & { id: number }
  currentUser: {
    id: number
    rolId: number
  }
}

export function EtkinlikForm({ initialData, currentUser }: EtkinlikFormProps) {
  const router = useRouter()
  const [selectedMusteri, setSelectedMusteri] = useState<(Musteriler & {
    ilgiliKisiler: IlgiliKisiler[]
  }) | null>(null)

  const form = useForm<EtkinlikForm>({
    resolver: zodResolver(etkinlikSchema),
    defaultValues: initialData || {
      musteriId: undefined,
      ilgiliKisiId: undefined,
      etkinlikTipi: undefined,
      baslangicTarihi: new Date(),
      bitisTarihi: undefined,
      aciklama: "",
      durum: "BEKLIYOR",
      oncelik: "NORMAL",
    },
  })

  async function onSubmit(data: EtkinlikForm) {
    try {
      if (initialData) {
        const result = await updateEtkinlik(initialData.id, data)
        if (result.error) {
          console.error(result.error)
          return
        }
      } else {
        const result = await createEtkinlik(data)
        if (result.error) {
          console.error(result.error)
          return
        }
      }
      router.push("/etkinlikler")
    } catch (error) {
      console.error("Form gönderilirken bir hata oluştu:", error)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Müşteri</Label>
          <MusteriSecici
            value={form.watch("musteriId")}
            onValueChange={(value, musteri) => {
              form.setValue("musteriId", value, { shouldValidate: true })
              form.setValue("ilgiliKisiId", undefined)
              setSelectedMusteri(musteri)
            }}
          />
          {form.formState.errors.musteriId && (
            <p className="text-sm text-red-500">
              {form.formState.errors.musteriId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>İlgili Kişi</Label>
          <IlgiliKisiSecici
            value={form.watch("ilgiliKisiId")}
            onValueChange={(value) => form.setValue("ilgiliKisiId", value)}
            ilgiliKisiler={selectedMusteri?.ilgiliKisiler || []}
            disabled={!selectedMusteri}
          />
        </div>

        <div className="space-y-2">
          <Label>Etkinlik Tipi</Label>
          <Select
            value={form.watch("etkinlikTipi")}
            onValueChange={(value) => form.setValue("etkinlikTipi", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Etkinlik tipi seçin" />
            </SelectTrigger>
            <SelectContent>
              {ETKINLIK_TIPLERI.map((tip) => (
                <SelectItem key={tip} value={tip}>
                  {tip.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.etkinlikTipi && (
            <p className="text-sm text-red-500">
              {form.formState.errors.etkinlikTipi.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="baslangicTarihi">Başlangıç Tarihi</Label>
          <Input
            id="baslangicTarihi"
            type="datetime-local"
            value={form.watch("baslangicTarihi") ? format(form.watch("baslangicTarihi"), "yyyy-MM-dd'T'HH:mm") : ""}
            onChange={(e) => form.setValue("baslangicTarihi", new Date(e.target.value))}
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
            value={form.watch("bitisTarihi") ? format(form.watch("bitisTarihi"), "yyyy-MM-dd'T'HH:mm") : ""}
            onChange={(e) => form.setValue("bitisTarihi", e.target.value ? new Date(e.target.value) : undefined)}
          />
        </div>

        <div className="space-y-2">
          <Label>Durum</Label>
          <Select
            value={form.watch("durum")}
            onValueChange={(value) => form.setValue("durum", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Durum seçin" />
            </SelectTrigger>
            <SelectContent>
              {ETKINLIK_DURUMLARI.map((durum) => (
                <SelectItem key={durum} value={durum}>
                  {durum.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Öncelik</Label>
          <Select
            value={form.watch("oncelik")}
            onValueChange={(value) => form.setValue("oncelik", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Öncelik seçin" />
            </SelectTrigger>
            <SelectContent>
              {ETKINLIK_ONCELIKLERI.map((oncelik) => (
                <SelectItem key={oncelik} value={oncelik}>
                  {oncelik}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="aciklama">Açıklama</Label>
          <Textarea
            id="aciklama"
            {...form.register("aciklama")}
            placeholder="Etkinlik açıklaması"
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/etkinlikler")}
        >
          İptal
        </Button>
        <Button type="submit">
          {initialData ? "Güncelle" : "Oluştur"}
        </Button>
      </div>
    </form>
  )
} 