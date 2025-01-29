import { MusteriForm } from "@/components/musteriler/musteri-form"
import { getMusteri } from "@/lib/actions/musteri"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

interface MusteriDuzenleSayfasiProps {
  params: {
    id: string
  }
}

export default async function MusteriDuzenleSayfasi({ params }: MusteriDuzenleSayfasiProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/sign-in")
  }

  const { musteri, error } = await getMusteri(parseInt(params.id))

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!musteri) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-red-500">Müşteri bulunamadı.</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Müşteri Düzenle</h1>
      <MusteriForm
        initialData={{
          ...musteri,
          temsilciId: musteri.temsilciId || undefined,
        }}
        currentUser={{ id: user.id, rolId: user.rolId }}
      />
    </div>
  )
} 