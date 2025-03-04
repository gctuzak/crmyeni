"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { UrunForm } from "@/components/urunler/urun-form"
import { getUrunHizmetGruplari } from "@/lib/actions/urun"
import { toast } from "sonner"

export default function YeniUrunPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const [gruplar, setGruplar] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/sign-in")
    }
  }, [user, isAuthLoading, router])

  useEffect(() => {
    async function loadGruplar() {
      try {
        setIsLoading(true)
        const result = await getUrunHizmetGruplari()
        if (result.error) {
          setError(result.error)
          toast.error(result.error)
        } else if (result.gruplar) {
          // Sadece ürün tipindeki grupları filtrele
          const urunGruplari = result.gruplar.filter(grup => grup.grupTipi === "URUN")
          setGruplar(urunGruplari)
        }
      } catch (error) {
        console.error("Gruplar yüklenirken hata oluştu:", error)
        setError("Gruplar yüklenirken bir hata oluştu.")
        toast.error("Gruplar yüklenirken bir hata oluştu.")
      } finally {
        setIsLoading(false)
      }
    }

    if (!isAuthLoading && user) {
      loadGruplar()
    }
  }, [user, isAuthLoading])

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Yeni Ürün</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ürün Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <UrunForm gruplar={gruplar} />
        </CardContent>
      </Card>
    </div>
  )
} 