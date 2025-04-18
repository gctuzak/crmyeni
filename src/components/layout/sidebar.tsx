"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Users, 
  CalendarClock, 
  FileText, 
  Target, 
  BarChart3,
  LayoutDashboard,
  UserCog,
  UserPlus,
  Package,
  Wrench
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import { getAyar } from "@/lib/actions/ayarlar"

const menuItems = [
  {
    title: "Anamenü",
    href: "/",
    icon: LayoutDashboard
  },
  {
    title: "Müşteriler",
    href: "/musteriler",
    icon: UserPlus
  },
  {
    title: "Aktivite ve Görevler",
    href: "/etkinlikler",
    icon: CalendarClock
  },
  {
    title: "Teklifler",
    href: "/teklifler",
    icon: FileText
  },
  {
    title: "Fırsatlar",
    href: "/firsatlar",
    icon: Target
  },
  {
    title: "Ürünler",
    href: "/urunler",
    icon: Package
  },
  {
    title: "Hizmetler",
    href: "/hizmetler",
    icon: Wrench
  },
  {
    title: "Raporlar",
    href: "/raporlar",
    icon: BarChart3
  }
]

const adminMenuItems = [
  {
    title: "Kullanıcı Yönetimi",
    href: "/kullanicilar/yonetim",
    icon: UserCog
  }
]

export function Sidebar() {
  const pathname = usePathname()
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
  }, [])

  const isAdmin = user?.rolId === 1

  return (
    <div className="w-64 bg-white dark:bg-gray-800 h-screen fixed left-0 top-0 border-r">
      <div className="p-4 border-b flex items-center justify-center">
        {logo ? (
          <div className="h-10 w-auto relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo}
              alt="Logo"
              className="h-full w-auto object-contain"
            />
          </div>
        ) : (
          <h1 className="text-2xl font-bold">CRM</h1>
        )}
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    isActive ? "bg-gray-100 dark:bg-gray-700" : ""
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              </li>
            )
          })}

          {isAdmin && (
            <>
              <li className="pt-4">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Yönetim
                </div>
              </li>
              {adminMenuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        isActive ? "bg-gray-100 dark:bg-gray-700" : ""
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                )
              })}
            </>
          )}
        </ul>
      </nav>
    </div>
  )
} 