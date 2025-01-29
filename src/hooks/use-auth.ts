"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import type { Kullanicilar } from "@prisma/client"
import { getCurrentUser } from "@/lib/auth"

interface UseAuthReturn {
  user: Kullanicilar | null
  isLoading: boolean
  error: string | null
}

export function useAuth(): UseAuthReturn {
  const { isLoaded: isClerkLoaded, isSignedIn } = useUser()
  const [user, setUser] = useState<Kullanicilar | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadUser() {
      try {
        if (!isSignedIn) {
          setUser(null)
          setIsLoading(false)
          return
        }

        const dbUser = await getCurrentUser()
        if (!dbUser) {
          setError("Kullanıcı bilgileri alınamadı.")
          setIsLoading(false)
          return
        }

        setUser(dbUser)
        setIsLoading(false)
      } catch (error) {
        console.error("Kullanıcı bilgileri yüklenirken hata oluştu:", error)
        setError("Kullanıcı bilgileri yüklenirken bir hata oluştu.")
        setIsLoading(false)
      }
    }

    if (isClerkLoaded) {
      loadUser()
    }
  }, [isClerkLoaded, isSignedIn])

  return {
    user,
    isLoading: !isClerkLoaded || isLoading,
    error,
  }
} 