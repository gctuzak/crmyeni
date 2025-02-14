"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createKullanici } from "@/lib/actions/kullanici"
import { kullaniciSchema, type KullaniciForm } from "@/lib/validations/kullanici"
import { useState } from "react"

const rolIsimleri: { [key: number]: string } = {
  1: "Admin",
  2: "Müşteri Temsilcisi",
}

export function KullaniciForm() {
  const router = useRouter()
  const [error, setError] = useState<string>("")
  
  const form = useForm<KullaniciForm>({
    resolver: zodResolver(kullaniciSchema),
    defaultValues: {
      ad: "",
      soyad: "",
      email: "",
      sifre: "",
      rolId: 2, // Varsayılan olarak Müşteri Temsilcisi
    },
  })

  async function onSubmit(data: KullaniciForm) {
    try {
      const result = await createKullanici(data)
      if (result.error) {
        setError(result.error)
        return
      }
      router.push("/kullanicilar/yonetim")
    } catch (error) {
      setError("Kullanıcı oluşturulurken bir hata oluştu")
    }
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ad">Ad</Label>
            <Input
              id="ad"
              {...form.register("ad")}
              placeholder="Kullanıcının adı"
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
              placeholder="Kullanıcının soyadı"
            />
            {form.formState.errors.soyad && (
              <p className="text-sm text-red-500">
                {form.formState.errors.soyad.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            placeholder="ornek@sirket.com"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sifre">Şifre</Label>
          <Input
            id="sifre"
            type="password"
            {...form.register("sifre")}
            placeholder="••••••••"
          />
          {form.formState.errors.sifre && (
            <p className="text-sm text-red-500">
              {form.formState.errors.sifre.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Rol</Label>
          <Select
            value={form.watch("rolId").toString()}
            onValueChange={(value) => form.setValue("rolId", parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Rol seçin" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(rolIsimleri).map(([id, isim]) => (
                <SelectItem key={id} value={id}>
                  {isim}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.rolId && (
            <p className="text-sm text-red-500">
              {form.formState.errors.rolId.message}
            </p>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/kullanicilar/yonetim")}
          >
            İptal
          </Button>
          <Button type="submit">
            Kaydet
          </Button>
        </div>
      </form>
    </div>
  )
} 