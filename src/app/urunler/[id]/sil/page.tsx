"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { deleteUrun, getUrun } from "@/lib/actions/urun"
import { Urunler } from "@prisma/client"
import { toast } from "sonner"

interface Props {
  params: {
    id: string
  }
}

export default function UrunSilPage({ params }: Props) {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  const [urun, setUrun] = useState<Urunler | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/sign-in")
    }
  }, [user, isAuthLoading, router])

  useEffect(() => {
    async function loadUrun() {
      try {
        const result = await getUrun(Number(params.id))
        if (result.error) {
          setError(result.error)
        } else if (result.urun) {
          setUrun(result.urun)
        }
      } catch (error) {
        console.error("Ürün yüklenirken hata oluştu:", error)
        setError("Ürün yüklenirken bir hata oluştu.")
      } finally {
        setIsLoading(false)
      }
    }

    if (!isAuthLoading && user) {
      loadUrun()
    }
  }, [user, isAuthLoading, params.id])

  const handleDelete = async () => {
    try {
      const result = await deleteUrun(Number(params.id))
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Ürün başarıyla silindi")
        router.push("/urunler")
        router.refresh()
      }
    } catch (error) {
      toast.error("Ürün silinirken bir hata oluştu")
    }
  }

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

  if (!urun) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-red-500">Ürün bulunamadı.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ürün Sil</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ürün Silme Onayı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              <strong>{urun.urunAdi}</strong> ({urun.urunKodu}) ürününü silmek
              istediğinize emin misiniz?
            </p>
            <p className="text-sm text-muted-foreground">
              Bu işlem geri alınamaz ve ürünle ilgili tüm veriler silinecektir.
            </p>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/urunler")}
              >
                İptal
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                Sil
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 