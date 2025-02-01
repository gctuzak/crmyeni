"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateLogo } from "@/lib/actions/sirket"

export default function ProfilPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading, error: authError } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/sign-in")
    }
  }, [user, isAuthLoading, router])

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!event.target.files?.[0]) return

      setIsUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append("logo", event.target.files[0])

      const result = await updateLogo(formData)
      if (result.error) {
        setError(result.error)
      } else {
        // Logo başarıyla güncellendi
        router.refresh()
      }
    } catch (error) {
      setError("Logo yüklenirken bir hata oluştu.")
    } finally {
      setIsUploading(false)
    }
  }

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-red-500">{authError}</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.ad + " " + user.soyad)}`

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold">Profil</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Kişisel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} alt={`${user.ad} ${user.soyad}`} />
                  <AvatarFallback>{user.ad[0]}{user.soyad[0]}</AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold">
                    {user.ad} {user.soyad}
                  </h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="mt-8 grid gap-4">
                <div>
                  <h3 className="font-medium mb-2">Rol</h3>
                  <p>{user.rolId === 1 ? "Admin" : "Müşteri Temsilcisi"}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Kayıt Tarihi</h3>
                  <p>{new Date(user.createdAt).toLocaleDateString("tr-TR")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {user.rolId === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Şirket Logosu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="logo">Logo Yükle</Label>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={isUploading}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Maksimum dosya boyutu: 2MB. Desteklenen formatlar: PNG, JPG, GIF
                    </p>
                  </div>

                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}

                  {isUploading && (
                    <p className="text-sm text-muted-foreground">
                      Logo yükleniyor...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 