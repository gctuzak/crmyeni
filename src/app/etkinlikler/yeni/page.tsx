"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { EtkinlikForm } from "@/components/etkinlikler/etkinlik-form"
import { useAuth } from "@/hooks/use-auth"

export default function YeniEtkinlikPage() {
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
      <h1 className="text-3xl font-bold mb-8">Yeni Aktivite/Görev Ekle</h1>
      <EtkinlikForm currentUser={{ id: user.id, rolId: user.rolId }} />
    </div>
  )
} 