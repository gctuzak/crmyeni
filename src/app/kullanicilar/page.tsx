"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { getKullanicilar } from "@/lib/actions/kullanici"

export default function KullanicilarPage() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const [kullanicilar, setKullanicilar] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/sign-in")
    }
  }, [user, isAuthLoading, router])

  useEffect(() => {
    async function loadKullanicilar() {
      try {
        const result = await getKullanicilar()
        if (result.error) {
          setError(result.error)
        } else {
          setKullanicilar(result.kullanicilar)
        }
      } catch (error) {
        console.error("Kullanıcılar yüklenirken hata oluştu:", error)
        setError("Kullanıcılar yüklenirken bir hata oluştu.")
      } finally {
        setIsLoading(false)
      }
    }

    if (!isAuthLoading && user) {
      loadKullanicilar()
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

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kullanıcılar</h1>
        {user.rolId === 1 && (
          <Button onClick={() => router.push("/kullanicilar/yeni")}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Kullanıcı
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>E-posta</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Müşteri Sayısı</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kullanicilar.map((kullanici) => (
                <TableRow key={kullanici.id}>
                  <TableCell>
                    {kullanici.ad} {kullanici.soyad}
                  </TableCell>
                  <TableCell>{kullanici.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{kullanici.rol.ad}</Badge>
                  </TableCell>
                  <TableCell>
                    {kullanici.kayitliMusteriler.length + kullanici.temsilciMusteriler.length}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      onClick={() => router.push(`/kullanicilar/${kullanici.id}`)}
                    >
                      Detay
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 