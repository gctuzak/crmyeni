"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const rolRenkleri: { [key: number]: string } = {
  1: "bg-red-100 text-red-800", // Admin
  2: "bg-blue-100 text-blue-800", // Müşteri Temsilcisi
}

const rolIsimleri: { [key: number]: string } = {
  1: "Admin",
  2: "Müşteri Temsilcisi",
}

export default function ProfilPage() {
  const router = useRouter()
  const { user, isLoading, error } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold">Profil</h1>

        <Card>
          <CardHeader>
            <CardTitle>Kullanıcı Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">
                  {user.ad[0]}{user.soyad[0]}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-semibold">
                    {user.ad} {user.soyad}
                  </div>
                  <div className="text-gray-500">{user.email}</div>
                </div>

                <Badge
                  variant="secondary"
                  className={rolRenkleri[user.rolId]}
                >
                  {rolIsimleri[user.rolId]}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 