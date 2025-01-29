"use client"

import { usePathname } from "next/navigation"
import { ModeToggle } from "@/components/mode-toggle"
import { UserNav } from "@/components/user-nav"

const pageTitles: { [key: string]: string } = {
  "/": "Dashboard",
  "/musteriler": "Müşteriler",
  "/etkinlikler": "Etkinlikler",
  "/teklifler": "Teklifler",
  "/firsatlar": "Fırsatlar",
  "/raporlar": "Raporlar"
}

export function Topbar() {
  const pathname = usePathname()
  const title = pageTitles[pathname] || "CRM"

  return (
    <div className="h-16 fixed top-0 left-64 right-0 bg-white dark:bg-gray-800 border-b z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </div>
  )
} 