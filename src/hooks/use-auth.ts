"use client"

import { useState, useEffect } from "react"
import { getUser } from "@/lib/auth"

interface Rol {
  id: number
  rolAdi: string
  yetkiler: string | null
}

interface Kullanici {
  id: number
  ad: string
  soyad: string
  email: string
  sifreHash: string
  rolId: number
  rol: Rol
}

interface UseAuthReturn {
  user: Kullanici | null
  isLoading: boolean
  error: string | null
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<Kullanici | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadUser() {
      try {
        const user = await getUser()
        if (isMounted) {
          setUser(user)
          setIsLoading(false)
        }
      } catch (error) {
        if (isMounted) {
          console.error("Kullanıcı bilgileri yüklenirken hata oluştu:", error)
          setError("Kullanıcı bilgileri yüklenirken bir hata oluştu")
          setIsLoading(false)
        }
      }
    }

    loadUser()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    user,
    isLoading,
    error,
  }
} 