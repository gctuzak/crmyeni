"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
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
import { updateKullanici, deleteKullanici, getKullanici } from "@/lib/actions/kullanici"
import { kullaniciSchema, type KullaniciForm } from "@/lib/validations/kullanici"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const rolIsimleri: { [key: number]: string } = {
  1: "Admin",
  2: "Müşteri Temsilcisi",
}

interface Props {
  params: {
    id: string
  }
}

export default function KullaniciDuzenlemePage({ params }: Props) {
  const router = useRouter()
  const { user, isLoading, error: authError } = useAuth()
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [loading, setLoading] = useState(true)

  const form = useForm<KullaniciForm>({
    resolver: zodResolver(kullaniciSchema),
    defaultValues: {
      ad: "",
      soyad: "",
      email: "",
      sifre: "",
      rolId: 2,
    },
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in")
    } else if (!isLoading && user && user.rolId !== 1) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    async function loadKullanici() {
      try {
        const result = await getKullanici(parseInt(params.id))
        if (result.error) {
          setError(result.error)
          return
        }
        
        const { kullanici } = result
        form.reset({
          ad: kullanici.ad,
          soyad: kullanici.soyad,
          email: kullanici.email,
          sifre: "",
          rolId: kullanici.rolId,
        })
      } catch (error) {
        setError("Kullanıcı bilgileri yüklenirken bir hata oluştu")
      } finally {
        setLoading(false)
      }
    }

    if (user && user.rolId === 1) {
      loadKullanici()
    }
  }, [params.id, user, form])

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-red-500">{authError}</div>
      </div>
    )
  }

  if (!user || user.rolId !== 1) {
    return null
  }

  async function onSubmit(data: KullaniciForm) {
    try {
      const result = await updateKullanici(parseInt(params.id), data)
      if (result.error) {
        setError(result.error)
        setSuccess("")
        return
      }
      setSuccess("Kullanıcı başarıyla güncellendi")
      setError("")
      router.push("/kullanicilar/yonetim")
    } catch (error) {
      setError("Kullanıcı güncellenirken bir hata oluştu")
      setSuccess("")
    }
  }

  async function handleDelete() {
    if (!confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) {
      return
    }

    try {
      const result = await deleteKullanici(parseInt(params.id))
      if (result.error) {
        setError(result.error)
        return
      }
      router.push("/kullanicilar/yonetim")
    } catch (error) {
      setError("Kullanıcı silinirken bir hata oluştu")
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Kullanıcı Düzenle</h1>
        <Button variant="destructive" onClick={handleDelete}>
          Kullanıcıyı Sil
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
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
          <p className="text-sm text-gray-500">
            Boş bırakırsanız şifre değişmeyecektir
          </p>
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

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
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