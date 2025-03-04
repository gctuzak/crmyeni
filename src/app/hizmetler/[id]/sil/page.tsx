import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getHizmet, deleteHizmet } from "@/lib/actions/hizmet"
import { redirect } from "next/navigation"
import { formatHizmetForForm } from "@/lib/utils"

interface Props {
  params: {
    id: string
  }
}

export default async function HizmetSilPage({ params }: Props) {
  const { hizmet, error } = await getHizmet(Number(params.id))

  if (error) {
    throw new Error(error)
  }

  if (!hizmet) {
    throw new Error("Hizmet bulunamadı.")
  }

  // Decimal tipini number'a dönüştür
  const formattedHizmet = formatHizmetForForm(hizmet)

  async function handleDelete() {
    "use server"
    
    const { error } = await deleteHizmet(Number(params.id))
    if (error) {
      throw new Error(error)
    }
    redirect("/hizmetler")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hizmet Sil</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hizmet Silme Onayı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              <strong>{formattedHizmet.hizmetAdi}</strong> ({formattedHizmet.hizmetKodu}) hizmetini silmek
              istediğinize emin misiniz?
            </p>
            <p className="text-sm text-muted-foreground">
              Bu işlem geri alınamaz ve hizmetle ilgili tüm veriler silinecektir.
            </p>

            <form action={handleDelete}>
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                >
                  Sil
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 