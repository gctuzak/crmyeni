"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { UrunHizmetGruplari } from "@prisma/client"
import { getUrunHizmetGruplari } from "@/lib/actions/urun"

export default function UrunHizmetGruplariPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const [data, setData] = useState<UrunHizmetGruplari[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/sign-in")
    }
  }, [user, isAuthLoading, router])

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getUrunHizmetGruplari()
        if (result.error) {
          setError(result.error)
        } else if (result.gruplar) {
          setData(result.gruplar)
        }
      } catch (error) {
        console.error("Gruplar yüklenirken hata oluştu:", error)
        setError("Gruplar yüklenirken bir hata oluştu.")
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
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ürün ve Hizmet Grupları</h1>
        <Button onClick={() => router.push("/urunler/gruplar/yeni")}>
          Yeni Grup Ekle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Gruplar</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={data} />
        </CardContent>
      </Card>
    </div>
  )
} 