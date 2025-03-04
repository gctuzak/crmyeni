"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { UrunForm } from "@/components/urunler/urun-form"
import { getUrun, getUrunHizmetGruplari } from "@/lib/actions/urun"
import { formatUrunForForm } from "@/lib/utils"
import { toast } from "sonner"

interface Props {
  params: {
    id: string
  }
}

interface Urun {
  id: number
  urunKodu: string
  urunAdi: string
  grupId: number
  birim: string
  birimFiyat: { toString: () => string }
  kdvOrani: number
  aciklama: string | null
  aktif: boolean
}

export default function UrunDuzenlePage({ params }: Props) {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const [urun, setUrun] = useState<Urun | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [gruplar, setGruplar] = useState<any[]>([])

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/sign-in")
    }
  }, [user, isAuthLoading, router])

  useEffect(() => {
    async function loadUrun() {
      try {
        const result = await getUrun(Number(params.id))
        if (result.error) {
          setError(result.error)
        } else if (result.urun) {
          setUrun(result.urun as unknown as Urun)
        }
      } catch (error) {
        console.error("Ürün yüklenirken hata oluştu:", error)
        setError("Ürün yüklenirken bir hata oluştu.")
      } finally {
        setIsLoading(false)
      }
    }

    if (!isAuthLoading && user) {
      loadUrun()
    }
  }, [user, isAuthLoading, params.id])

  useEffect(() => {
    async function loadGruplar() {
      try {
        const result = await getUrunHizmetGruplari()
        if (result.error) {
          setError(result.error)
        } else if (result.gruplar) {
          // Sadece ürün tipindeki grupları filtrele
          const urunGruplari = result.gruplar.filter(grup => grup.grupTipi === "URUN")
          setGruplar(urunGruplari)
        }
      } catch (error) {
        console.error("Gruplar yüklenirken hata oluştu:", error)
        setError("Gruplar yüklenirken bir hata oluştu.")
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

  if (!urun) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-red-500">Ürün bulunamadı.</div>
      </div>
    )
  }

  if (!gruplar) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-red-500">Gruplar bulunamadı.</div>
      </div>
    )
  }

  // Decimal tipini number'a dönüştür
  const formattedUrun = formatUrunForForm(urun)
  
  return (
    <div className="container mx-auto py-10">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Ürün Düzenle</h1>
      </div>
      <UrunForm urun={formattedUrun} gruplar={gruplar} />
    </div>
  )
} 