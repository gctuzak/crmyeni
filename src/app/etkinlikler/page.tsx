"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { EtkinlikListesi } from "@/components/etkinlikler/etkinlik-listesi"
import { getEtkinlikler } from "@/lib/actions/etkinlik"
import { useAuth } from "@/hooks/use-auth"
import type { Etkinlikler, Musteriler, Kullanicilar } from "@prisma/client"

interface EtkinlikWithRelations extends Etkinlikler {
  musteri: Musteriler
  kullanici: Pick<Kullanicilar, "id" | "ad" | "soyad" | "email">
}

export default function EtkinliklerPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading, error: authError } = useAuth()
  const [etkinlikler, setEtkinlikler] = useState<EtkinlikWithRelations[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadEtkinlikler() {
      try {
        if (!user) return

        const { etkinlikler, error } = await getEtkinlikler()
        if (error) {
          setError(error)
        } else {
          setEtkinlikler(etkinlikler || [])
        }
      } catch (error) {
        console.error("Etkinlikler yüklenirken hata oluştu:", error)
        setError("Etkinlikler yüklenirken bir hata oluştu.")
      } finally {
        setIsLoading(false)
      }
    }

    if (!isAuthLoading && user) {
      loadEtkinlikler()
    }
  }, [user, isAuthLoading])

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/sign-in")
    }
  }, [user, isAuthLoading, router])

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  if (authError || error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-red-500">{authError || error}</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Aktivite ve Görevler</h1>
          <Button asChild>
            <Link href="/etkinlikler/yeni">Yeni Aktivite/Görev</Link>
          </Button>
        </div>

        <EtkinlikListesi etkinlikler={etkinlikler} />
      </div>
    </div>
  )
} 