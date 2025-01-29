"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { etkinlikSchema, type EtkinlikForm as EtkinlikFormType, ETKINLIK_TIPLERI } from "@/lib/validations/etkinlik"
import { createEtkinlik, updateEtkinlik } from "@/lib/actions/etkinlik"

interface EtkinlikFormProps {
  initialData?: EtkinlikFormType & { id: number }
}

export function EtkinlikForm({ initialData }: EtkinlikFormProps) {
  const router = useRouter()
  const form = useForm<EtkinlikFormType>({
    resolver: zodResolver(etkinlikSchema),
    defaultValues: initialData || {
      musteriId: undefined,
      etkinlikTipi: "",
      baslangicTarihi: "",
      bitisTarihi: "",
      aciklama: "",
      kullaniciId: 1, // TODO: Gerçek kullanıcı ID'sini kullan
    },
  })

  async function onSubmit(data: EtkinlikFormType) {
    try {
      if (initialData) {
        const result = await updateEtkinlik(initialData.id, data)
        if (result.error) {
          // TODO: Hata gösterimi ekle
          console.error(result.error)
          return
        }
      } else {
        const result = await createEtkinlik(data)
        if (result.error) {
          // TODO: Hata gösterimi ekle
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="musteriId">Müşteri</Label>
          {/* TODO: Müşteri seçimi için combobox ekle */}
          <Input
            id="musteriId"
            type="number"
            {...form.register("musteriId", { valueAsNumber: true })}
          />
          {form.formState.errors.musteriId && (
            <p className="text-sm text-red-500">
              {form.formState.errors.musteriId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="etkinlikTipi">Etkinlik Tipi</Label>
          <Select
            defaultValue={form.getValues("etkinlikTipi")}
            onValueChange={(value) => form.setValue("etkinlikTipi", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Etkinlik tipi seçin" />
            </SelectTrigger>
            <SelectContent>
              {ETKINLIK_TIPLERI.map((tip) => (
                <SelectItem key={tip} value={tip}>
                  {tip}
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
          {initialData ? "Güncelle" : "Kaydet"}
        </Button>
      </div>
    </form>
  )
} 