"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ilgiliKisiSchema, type IlgiliKisiForm } from "@/lib/validations/musteri"
import { createIlgiliKisi } from "@/lib/actions/musteri"

interface IlgiliKisiFormProps {
  musteriId: number
}

export function IlgiliKisiForm({ musteriId }: IlgiliKisiFormProps) {
  const form = useForm<IlgiliKisiForm>({
    resolver: zodResolver(ilgiliKisiSchema),
    defaultValues: {
      ad: "",
      soyad: "",
      unvan: "",
      telefon: "",
      email: "",
    },
  })

  async function onSubmit(data: IlgiliKisiForm) {
    try {
      const result = await createIlgiliKisi(musteriId, data)
      if (result.error) {
        // TODO: Hata gösterimi ekle
        console.error(result.error)
        return
      }
      form.reset()
    } catch (error) {
      console.error("Form gönderilirken bir hata oluştu:", error)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="ad">Ad</Label>
          <Input
            id="ad"
            {...form.register("ad")}
            placeholder="İlgili kişi adı"
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
            placeholder="İlgili kişi soyadı"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unvan">Ünvan</Label>
          <Input
            id="unvan"
            {...form.register("unvan")}
            placeholder="İlgili kişi ünvanı"
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

        <div className="space-y-2 md:col-span-2">
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
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          Kaydet
        </Button>
      </div>
    </form>
  )
} 