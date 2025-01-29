"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { musteriSchema, type MusteriForm } from "@/lib/validations/musteri"
import { createMusteri, updateMusteri } from "@/lib/actions/musteri"

interface MusteriFormProps {
  initialData?: MusteriForm & { id: number }
}

export function MusteriForm({ initialData }: MusteriFormProps) {
  const router = useRouter()
  const form = useForm<MusteriForm>({
    resolver: zodResolver(musteriSchema),
    defaultValues: initialData || {
      musteriTipi: "",
      ad: "",
      soyad: "",
      vergiNo: "",
      telefon: "",
      email: "",
      adres: "",
    },
  })

  async function onSubmit(data: MusteriForm) {
    try {
      if (initialData) {
        const result = await updateMusteri(initialData.id, data)
        if (result.error) {
          // TODO: Hata gösterimi ekle
          console.error(result.error)
          return
        }
      } else {
        const result = await createMusteri(data)
        if (result.error) {
          // TODO: Hata gösterimi ekle
          console.error(result.error)
          return
        }
      }
      router.push("/musteriler")
    } catch (error) {
      console.error("Form gönderilirken bir hata oluştu:", error)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="musteriTipi">Müşteri Tipi</Label>
          <Select
            defaultValue={form.getValues("musteriTipi")}
            onValueChange={(value) => form.setValue("musteriTipi", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Müşteri tipi seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bireysel">Bireysel</SelectItem>
              <SelectItem value="Kurumsal">Kurumsal</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.musteriTipi && (
            <p className="text-sm text-red-500">
              {form.formState.errors.musteriTipi.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="ad">Ad</Label>
          <Input
            id="ad"
            {...form.register("ad")}
            placeholder="Müşteri adı"
          />
          {form.formState.errors.ad && (
            <p className="text-sm text-red-500">
              {form.formState.errors.ad.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="soyad">Soyad</Label>
          <Input
            id="soyad"
            {...form.register("soyad")}
            placeholder="Müşteri soyadı"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vergiNo">Vergi No</Label>
          <Input
            id="vergiNo"
            {...form.register("vergiNo")}
            placeholder="Vergi numarası"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefon">Telefon</Label>
          <Input
            id="telefon"
            {...form.register("telefon")}
            placeholder="Telefon numarası"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            placeholder="E-posta adresi"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="adres">Adres</Label>
          <Textarea
            id="adres"
            {...form.register("adres")}
            placeholder="Adres bilgileri"
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/musteriler")}
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