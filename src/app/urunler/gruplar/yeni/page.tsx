"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { UrunHizmetGrubuForm } from "@/components/urunler/urun-hizmet-grubu-form"

export default function YeniUrunHizmetGrubuPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/sign-in")
    }
  }, [user, isAuthLoading, router])

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Yeni Ürün/Hizmet Grubu</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grup Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <UrunHizmetGrubuForm />
        </CardContent>
      </Card>
    </div>
  )
} 