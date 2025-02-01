"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { getDashboardData } from "@/lib/actions/dashboard"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/sign-in")
    }
  }, [user, isAuthLoading, router])

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getDashboardData()
        if (result.error) {
          setError(result.error)
        } else {
          setData(result)
        }
      } catch (error) {
        console.error("Dashboard verileri yüklenirken hata oluştu:", error)
        setError("Dashboard verileri yüklenirken bir hata oluştu.")
      } finally {
        setIsLoading(false)
      }
    }

    if (!isAuthLoading && user) {
      loadData()
    }
  }, [user, isAuthLoading])

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!user || !data) {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid gap-8">
        {/* Özet Kartları */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Müşteri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.musteriSayisi}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen Etkinlik</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.bekleyenEtkinlikSayisi}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tamamlanan Etkinlik</CardTitle>
              <p className="text-xs text-muted-foreground">Son 7 gün</p>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.tamamlananEtkinlikSayisi}</div>
            </CardContent>
          </Card>
        </div>

        {/* Grafikler */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Etkinlik Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.etkinlikDagilimi}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Müşteri Tipi Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.musteriTipiDagilimi}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.musteriTipiDagilimi.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Listeler */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Son Etkinlikler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.sonEtkinlikler.map((etkinlik: any) => (
                  <div
                    key={etkinlik.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{etkinlik.etkinlikTipi.replace(/_/g, " ")}</p>
                      <p className="text-sm text-muted-foreground">
                        {etkinlik.musteri.musteriTipi === "BIREYSEL"
                          ? `${etkinlik.musteri.ad} ${etkinlik.musteri.soyad}`
                          : etkinlik.musteri.firmaAdi}
                      </p>
                      {etkinlik.ilgiliKisi && (
                        <p className="text-sm text-muted-foreground">
                          İlgili Kişi: {etkinlik.ilgiliKisi.ad} {etkinlik.ilgiliKisi.soyad}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{etkinlik.durum}</Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {format(new Date(etkinlik.baslangicTarihi), "Pp", { locale: tr })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="link"
                className="mt-4 w-full"
                onClick={() => router.push("/etkinlikler")}
              >
                Tüm Etkinlikleri Gör
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Son Teklifler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.sonTeklifler.map((teklif: any) => (
                  <div
                    key={teklif.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{teklif.teklifNo}</p>
                      <p className="text-sm text-muted-foreground">
                        {teklif.musteri.musteriTipi === "BIREYSEL"
                          ? `${teklif.musteri.ad} ${teklif.musteri.soyad}`
                          : teklif.musteri.firmaAdi}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{teklif.durum}</Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {format(new Date(teklif.olusturmaTarihi), "Pp", { locale: tr })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="link"
                className="mt-4 w-full"
                onClick={() => router.push("/teklifler")}
              >
                Tüm Teklifleri Gör
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 