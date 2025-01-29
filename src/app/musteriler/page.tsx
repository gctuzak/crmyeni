"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MusteriListesi } from "@/components/musteriler/musteri-listesi"
import { MusteriArama } from "@/components/musteriler/musteri-arama"
import { getMusteriler } from "@/lib/actions/musteri"
import { useAuth } from "@/hooks/use-auth"
import type { Musteriler, IlgiliKisiler, Kullanicilar } from "@prisma/client"

interface MusteriWithRelations extends Musteriler {
  ilgiliKisiler: IlgiliKisiler[]
  temsilci?: Kullanicilar
  kullanici: Kullanicilar
}

export default function MusterilerPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading, error: authError } = useAuth()
  const [musteriler, setMusteriler] = useState<MusteriWithRelations[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadMusteriler() {
      try {
        if (!user) return

        const { musteriler, error } = await getMusteriler()
        if (error) {
          setError(error)
        } else {
          setMusteriler(musteriler || [])
        }
      } catch (error) {
        console.error("Müşteriler yüklenirken hata oluştu:", error)
        setError("Müşteriler yüklenirken bir hata oluştu.")
      } finally {
        setIsLoading(false)
      }
    }

    if (!isAuthLoading && user) {
      loadMusteriler()
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
          <h1 className="text-3xl font-bold">Müşteriler</h1>
          <Button asChild>
            <Link href="/musteriler/yeni">Yeni Müşteri Ekle</Link>
          </Button>
        </div>

        <div className="flex justify-center">
          <MusteriArama
            onSelect={(musteri) => {
              router.push(`/musteriler/${musteri.id}`)
            }}
          />
        </div>

        <MusteriListesi musteriler={musteriler} />
      </div>
    </div>
  )
} 