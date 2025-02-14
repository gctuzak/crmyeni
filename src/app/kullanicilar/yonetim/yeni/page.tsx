"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { KullaniciForm } from "@/components/kullanicilar/kullanici-form"
import { useAuth } from "@/hooks/use-auth"

export default function YeniKullaniciPage() {
  const router = useRouter()
  const { user, isLoading, error } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in")
    } else if (!isLoading && user && user.rolId !== 1) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
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

  if (!user || user.rolId !== 1) {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-8">Yeni Kullanıcı Ekle</h1>
      <KullaniciForm />
    </div>
  )
} 