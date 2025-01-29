"use client"

import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { CalendarClock, FileText, Target, Users } from "lucide-react"

const activities = [
  {
    type: "etkinlik",
    title: "ABC Şirketi ile Toplantı",
    description: "Proje başlangıç toplantısı",
    date: new Date("2024-01-15T10:00:00"),
    icon: CalendarClock
  },
  {
    type: "teklif",
    title: "XYZ Ltd. için Teklif Hazırlandı",
    description: "ERP Yazılımı Geliştirme Teklifi",
    date: new Date("2024-01-14T15:30:00"),
    icon: FileText
  },
  {
    type: "firsat",
    title: "Yeni Fırsat Oluşturuldu",
    description: "DEF A.Ş. - Danışmanlık Hizmeti",
    date: new Date("2024-01-14T11:00:00"),
    icon: Target
  },
  {
    type: "musteri",
    title: "Yeni Müşteri Eklendi",
    description: "GHI Teknoloji Ltd. Şti.",
    date: new Date("2024-01-13T16:45:00"),
    icon: Users
  }
]

export function RecentActivities() {
  return (
    <div className="space-y-8">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start gap-4">
          <div className="mt-1">
            <activity.icon className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">{activity.title}</p>
            <p className="text-sm text-muted-foreground">
              {activity.description}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(activity.date, "d MMMM yyyy HH:mm", { locale: tr })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
} 