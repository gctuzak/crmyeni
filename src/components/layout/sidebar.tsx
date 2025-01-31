"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Users, 
  CalendarClock, 
  FileText, 
  Target, 
  BarChart3,
  LayoutDashboard
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
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

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white dark:bg-gray-800 h-screen fixed left-0 top-0 border-r">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">CRM</h1>
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
        </ul>
      </nav>
    </div>
  )
} 