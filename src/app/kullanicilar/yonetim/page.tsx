"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { KullaniciListesi } from "@/components/kullanicilar/kullanici-listesi"
import { useAuth } from "@/hooks/use-auth"
import { getKullanicilar } from "@/lib/actions/kullanici"
import { UserPlus } from "lucide-react"

export default function KullaniciYonetimiPage() {
  const router = useRouter()
  const { user, isLoading, error: authError } = useAuth()
  const [kullanicilar, setKullanicilar] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in")
    } else if (!isLoading && user && user.rolId !== 1) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    async function loadKullanicilar() {
      try {
        const result = await getKullanicilar()
        if (result.error) {
          setError(result.error)
          return
        }
        setKullanicilar(result.kullanicilar)
      } catch (error) {
        setError("Kullanıcılar yüklenirken bir hata oluştu")
      }
    }

    if (user && user.rolId === 1) {
      loadKullanicilar()
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  if (authError || error) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-red-500">{authError || error}</div>
      </div>
    )
  }

  if (!user || user.rolId !== 1) {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Kullanıcı Yönetimi</h1>
        <Button onClick={() => router.push("/kullanicilar/yonetim/yeni")}>
          <UserPlus className="w-4 h-4 mr-2" />
          Yeni Kullanıcı
        </Button>
      </div>
      <KullaniciListesi kullanicilar={kullanicilar} />
    </div>
  )
} 