"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentActivities } from "@/components/dashboard/recent-activities"
import { SalesFunnel } from "@/components/dashboard/sales-funnel"
import { getDashboardData } from "@/lib/actions/dashboard"
import { useAuth } from "@/hooks/use-auth"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DashboardData {
  toplamMusteri: number
  yeniMusteriSayisi: number
  acikFirsatlar: number
  toplamFirsatTutari: number
  bekleyenTeklifler: number
  toplamTeklifTutari: number
  planliEtkinlikler: number
  buHaftakiEtkinlikler: number
  tamamlananEtkinlikler: number
  satisPerformansi: {
    name: string
    total: number
  }[]
  firsatAsamalari: {
    name: string
    value: number
  }[]
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading, error: authError } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        if (!user) return

        const result = await getDashboardData()
        if (result.error) {
          setError(result.error)
        } else if (result.data) {
          setData(result.data)
        }
      } catch (error) {
        console.error("Dashboard verileri yüklenirken hata oluştu:", error)
        setError("Dashboard verileri yüklenirken bir hata oluştu.")
      } finally {
        setIsLoading(false)
      }
    }

    if (!isAuthLoading && user) {
      loadDashboardData()
    } else if (!isAuthLoading && !user) {
      setIsLoading(false)
    }
  }, [user, isAuthLoading])

  useEffect(() => {
    if (!isAuthLoading && !user && !error) {
      console.log("Dashboard: Kullanıcı bulunamadı, giriş sayfasına yönlendiriliyor")
      router.replace("/sign-in")
    }
  }, [user, isAuthLoading, error, router])

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  if (authError || error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-red-500">{authError || error}</div>
        <Button 
          className="mt-4" 
          onClick={() => {
            // Ana sayfaya yönlendir ve sayfayı yenile
            window.location.href = "/"
          }}
        >
          Yeniden Dene
        </Button>
      </div>
    )
  }

  if (!user || !data) {
    return null
  }

  return (
    <div className="space-y-6 mt-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Müşteri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.toplamMusteri}</div>
            <p className="text-xs text-muted-foreground">
              Geçen aydan +{data.yeniMusteriSayisi} artış
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Açık Fırsatlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.acikFirsatlar}</div>
            <p className="text-xs text-muted-foreground">
              Toplam {formatCurrency(data.toplamFirsatTutari)} değerinde
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Teklifler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.bekleyenTeklifler}</div>
            <p className="text-xs text-muted-foreground">
              Toplam {formatCurrency(data.toplamTeklifTutari)} değerinde
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planlı Etkinlikler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.planliEtkinlikler}</div>
            <p className="text-xs text-muted-foreground">
              Bu hafta {data.buHaftakiEtkinlikler} etkinlik var
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Satış Performansı</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={data.satisPerformansi} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Satış Hunisi</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesFunnel data={data.firsatAsamalari} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Son Aktiviteler</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivities />
        </CardContent>
      </Card>
    </div>
  )
} 