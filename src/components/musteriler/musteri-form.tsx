"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
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
import { musteriSchema, type MusteriForm } from "@/lib/validations/musteri"
import { createMusteri, updateMusteri, getKullanicilar } from "@/lib/actions/musteri"
import type { Kullanicilar } from "@prisma/client"

interface MusteriFormProps {
  initialData?: MusteriForm & { id: number }
  currentUser: {
    id: number
    rolId: number
  }
}

export function MusteriForm({ initialData, currentUser }: MusteriFormProps) {
  const router = useRouter()
  const [kullanicilar, setKullanicilar] = useState<Kullanicilar[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isManager, setIsManager] = useState(false)

  const form = useForm<MusteriForm>({
    resolver: zodResolver(musteriSchema),
    defaultValues: initialData || {
      musteriTipi: "BIREYSEL",
      temsilciId: currentUser.id, // Varsayılan olarak kendisi
    },
  })

  const musteriTipi = form.watch("musteriTipi")

  // Kullanıcı rollerini kontrol et
  useEffect(() => {
    if (currentUser?.rolId === 1) {
      setIsAdmin(true)
    } else if (currentUser?.rolId === 2) {
      setIsManager(true)
    }

    // Admin veya yönetici ise kullanıcıları getir
    if (currentUser?.rolId === 1 || currentUser?.rolId === 2) {
      getKullanicilar().then((result) => {
        if (result.kullanicilar) {
          setKullanicilar(result.kullanicilar)
        }
      })
    }
  }, [currentUser])

  async function onSubmit(data: MusteriForm) {
    try {
      // Admin veya yönetici değilse kendisi temsilci olur
      if (!isAdmin && !isManager) {
        data.temsilciId = currentUser.id
      }

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
      <div className="space-y-2">
        <Label htmlFor="musteriTipi">Müşteri Tipi</Label>
        <Select
          defaultValue={form.getValues("musteriTipi")}
          onValueChange={(value) => form.setValue("musteriTipi", value as "BIREYSEL" | "KURUMSAL")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Müşteri tipi seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BIREYSEL">Bireysel</SelectItem>
            <SelectItem value="KURUMSAL">Kurumsal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {musteriTipi === "BIREYSEL" ? (
          <>
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
              {form.formState.errors.soyad && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.soyad.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tcKimlik">TC Kimlik No</Label>
              <Input
                id="tcKimlik"
                {...form.register("tcKimlik")}
                placeholder="TC Kimlik numarası"
              />
              {form.formState.errors.tcKimlik && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.tcKimlik.message}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="firmaAdi">Firma Adı</Label>
              <Input
                id="firmaAdi"
                {...form.register("firmaAdi")}
                placeholder="Firma adı"
              />
              {form.formState.errors.firmaAdi && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.firmaAdi.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vergiDairesi">Vergi Dairesi</Label>
              <Input
                id="vergiDairesi"
                {...form.register("vergiDairesi")}
                placeholder="Vergi dairesi"
              />
              {form.formState.errors.vergiDairesi && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.vergiDairesi.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vergiNo">Vergi No</Label>
              <Input
                id="vergiNo"
                {...form.register("vergiNo")}
                placeholder="Vergi numarası"
              />
              {form.formState.errors.vergiNo && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.vergiNo.message}
                </p>
              )}
            </div>
          </>
        )}

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

        {/* Müşteri temsilcisi alanı */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="temsilciId">Müşteri Temsilcisi</Label>
          {(isAdmin || isManager) ? (
            <Select
              defaultValue={form.getValues("temsilciId")?.toString()}
              onValueChange={(value) => form.setValue("temsilciId", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Müşteri temsilcisi seçin" />
              </SelectTrigger>
              <SelectContent>
                {kullanicilar.map((kullanici) => (
                  <SelectItem key={kullanici.id} value={kullanici.id.toString()}>
                    {kullanici.ad} {kullanici.soyad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="temsilciId"
              value={currentUser?.id?.toString() || ""}
              disabled
              className="bg-gray-100"
            />
          )}
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