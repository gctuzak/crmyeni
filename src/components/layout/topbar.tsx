"use client"

import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/lib/auth"
import { useEffect, useState } from "react"
import { getAyar } from "@/lib/actions/ayarlar"
import Image from "next/image"

const pageTitles: { [key: string]: string } = {
  "/": "Anamenü",
  "/musteriler": "Müşteriler",
  "/etkinlikler": "Aktivite ve Görevler",
  "/teklifler": "Teklifler",
  "/firsatlar": "Fırsatlar",
  "/raporlar": "Raporlar",
  "/kullanicilar/yonetim": "Kullanıcı Yönetimi",
  "/profil": "Profil",
  "/ayarlar": "Ayarlar",
}

export function Topbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [logo, setLogo] = useState<string>("")

  useEffect(() => {
    async function loadLogo() {
      try {
        const result = await getAyar("logo")
        if (result.deger) {
          setLogo(result.deger)
        }
      } catch (error) {
        console.error("Logo yüklenirken hata oluştu:", error)
      }
    }
    loadLogo()
  }, [pathname])

  const handleSignOut = async () => {
    await signOut()
    router.push("/sign-in")
  }

  return (
    <div className="h-16 fixed top-0 left-64 right-0 bg-white dark:bg-gray-800 border-b z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {logo ? (
            <div className="h-8 w-auto relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo}
                alt="Logo"
                className="h-full w-auto object-contain"
              />
            </div>
          ) : (
            <h1 className="text-2xl font-semibold">CRM</h1>
          )}
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
          <h2 className="text-lg font-medium">
            {pageTitles[pathname] || "CRM"}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {user.ad[0]}{user.soyad[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {user.ad} {user.soyad}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuItem onClick={() => router.push("/profil")}>
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/ayarlar")}>
                  Ayarlar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  )
} 