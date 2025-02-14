"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { LogOut, Upload } from "lucide-react"
import { signOut } from "@/lib/actions/auth"
import { uploadLogo } from "@/lib/actions/ayarlar"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AyarlarPage() {
  const router = useRouter()
  const { user, isLoading, error: authError } = useAuth()
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-red-500">{authError}</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/sign-in")
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append("logo", file)

      const result = await uploadLogo(formData)
      if (result.error) {
        setError(result.error)
        setSuccess("")
        return
      }
      setSuccess("Logo başarıyla güncellendi")
      setError("")
      
      // Formu sıfırla
      if (formRef.current) {
        formRef.current.reset()
      }

      // Sayfayı yenile
      router.refresh()
    } catch (error) {
      setError("Logo yüklenirken bir hata oluştu")
      setSuccess("")
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Ayarlar</h1>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Tema</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Uygulama temasını değiştirin
          </p>
          <ModeToggle />
        </div>

        {user.rolId === 1 && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Logo</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Şirket logosunu değiştirin
            </p>
            <form ref={formRef} className="flex items-center gap-4">
              <Button type="button" variant="outline" className="relative">
                <input
                  type="file"
                  name="logo"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
                <Upload className="w-4 h-4 mr-2" />
                Logo Yükle
              </Button>
            </form>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Oturum</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Oturumunuzu sonlandırın
          </p>
          <Button variant="destructive" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </div>
    </div>
  )
} 