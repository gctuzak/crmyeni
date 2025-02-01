"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { 
  Users, 
  CalendarClock, 
  FileText, 
  Target, 
  BarChart3,
  LayoutDashboard,
  UserCog
} from "lucide-react"
import { getSirketAyarlari } from "@/lib/actions/sirket"
import { useAuth } from "@/hooks/use-auth"

const menuItems = [
  {
    title: "Anasayfa",
    href: "/",
    icon: LayoutDashboard
  },
  {
    title: "Müşteriler",
    href: "/musteriler",
    icon: Users
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
    title: "Raporlar",
    href: "/raporlar",
    icon: BarChart3
  }
]

const adminMenuItems = [
  {
    title: "Kullanıcı Yönetimi",
    href: "/kullanicilar",
    icon: UserCog
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [logo, setLogo] = useState<string | null>(null)

  useEffect(() => {
    async function loadLogo() {
      const { ayarlar } = await getSirketAyarlari()
      if (ayarlar?.logo) {
        setLogo(ayarlar.logo)
      }
    }
    loadLogo()
  }, [])

  // Menü öğelerini birleştir
  const allMenuItems = [...menuItems, ...(user?.rolId === 1 ? adminMenuItems : [])]

  return (
    <div className="w-64 bg-white dark:bg-gray-800 h-screen fixed left-0 top-0 border-r">
      <div className="p-4 border-b">
        {logo ? (
          <div className="h-8 relative">
            <Image
              src={logo}
              alt="Şirket Logosu"
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <h1 className="text-2xl font-bold">CRM</h1>
        )}
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {allMenuItems.map((item) => {
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
        </ul>
      </nav>
    </div>
  )
} 