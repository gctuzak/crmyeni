"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("Giriş denemesi:", { email })
      
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log("API yanıtı status:", response.status)
      const data = await response.json()
      console.log("API yanıtı:", data)

      if (!response.ok) {
        setError(data.error || "Giriş yapılırken bir hata oluştu")
        return
      }

      if (data.error) {
        setError(data.error)
        return
      }
      
      console.log("Giriş başarılı, yönlendiriliyor...")
      setIsRedirecting(true)
      
      // Sayfayı yenile ve ana sayfaya yönlendir
      window.location.href = "/"
    } catch (error) {
      console.error("Giriş hatası:", error)
      setError("Giriş yapılırken bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  // Eğer kullanıcı zaten giriş yapmışsa ana sayfaya yönlendir
  useEffect(() => {
    let isMounted = true;
    
    async function checkAuth() {
      try {
        // Kullanıcının oturum durumunu kontrol et
        setCheckingAuth(true)
        const response = await fetch("/api/auth/check")
        const data = await response.json()
        
        if (data.authenticated && isMounted && !isRedirecting) {
          console.log("Kullanıcı zaten giriş yapmış, yönlendiriliyor...")
          router.replace("/")
        }
      } catch (error) {
        console.error("Auth kontrolü hatası:", error)
      } finally {
        if (isMounted) {
          setCheckingAuth(false)
        }
      }
    }
    
    checkAuth()
    
    return () => {
      isMounted = false;
    };
  }, [router, isRedirecting])

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-gray-500">Kontrol ediliyor...</p>
        </div>
      </div>
    )
  }

  if (isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Giriş Başarılı</h2>
          <p className="text-gray-500">Yönlendiriliyorsunuz...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Giriş Yap</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Devam etmek için giriş yapın
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signin-email">E-posta</Label>
            <Input
              id="signin-email"
              name="signin-email"
              type="email"
              placeholder="ornek@sirket.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signin-password">Şifre</Label>
            <Input
              id="signin-password"
              name="signin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>
        </form>
      </div>
    </div>
  )
} 