"use client"

import { useState, useEffect } from "react"
import { getCurrentUser } from "@/lib/auth"

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
  rolId: number
  rol: Rol
}

interface UseAuthReturn {
  user: Kullanici | null
  isLoading: boolean
  error: string | null
  refreshUser: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<Kullanici | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now())

  const loadUser = async () => {
    try {
      console.log("Kullanıcı bilgileri yükleniyor...")
      setIsLoading(true)
      setError(null)
      
      const user = await getCurrentUser()
      
      if (user) {
        console.log("Kullanıcı yüklendi:", user.email, "ID:", user.id)
        setUser(user)
      } else {
        console.error("Kullanıcı bulunamadı veya oturum açılmamış")
        setUser(null)
        
        // Eğer daha önce kullanıcı varsa, tutarsızlık olduğunu bildirelim
        if (user) {
          console.error("Tutarsız kullanıcı durumu: Önceki kullanıcı vardı, şimdi bulunamadı")
          setError("Oturum bilgilerinde tutarsızlık tespit edildi")
        } else {
          setError("Oturum açmış kullanıcı bulunamadı")
        }
      }
    } catch (error) {
      console.error("Kullanıcı bilgileri yüklenirken hata oluştu:", error)
      setError("Kullanıcı bilgileri yüklenirken bir hata oluştu")
      setUser(null)
    } finally {
      setIsLoading(false)
      setLastRefresh(Date.now())
    }
  }

  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      try {
        await loadUser()
      } catch (error) {
        if (isMounted) {
          console.error("Auth init hatası:", error)
          setError("Kimlik doğrulama başlatılamadı")
          setIsLoading(false)
        }
      }
    }

    initAuth()

    // Her 5 dakikada bir otomatik yenileme
    const intervalId = setInterval(() => {
      if (isMounted) {
        console.log("Kullanıcı bilgileri periyodik olarak yenileniyor...")
        loadUser()
      }
    }, 5 * 60 * 1000) // 5 dakika

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [])

  return {
    user,
    isLoading,
    error,
    refreshUser: loadUser
  }
} 