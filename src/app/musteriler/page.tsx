import { getMusteriler } from "@/lib/actions/musteri"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function MusterilerPage() {
  const { musteriler, error } = await getMusteriler()

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Müşteriler</h1>
        <Button asChild>
          <Link href="/musteriler/yeni">Yeni Müşteri Ekle</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {musteriler?.map((musteri) => (
          <Link
            key={musteri.id}
            href={`/musteriler/${musteri.id}`}
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{musteri.ad} {musteri.soyad}</h2>
              <span className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-full">
                {musteri.musteriTipi}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              {musteri.email && (
                <p className="flex items-center">
                  <span className="mr-2">📧</span>
                  {musteri.email}
                </p>
              )}
              {musteri.telefon && (
                <p className="flex items-center">
                  <span className="mr-2">📞</span>
                  {musteri.telefon}
                </p>
              )}
              {musteri.ilgiliKisiler.length > 0 && (
                <p className="flex items-center">
                  <span className="mr-2">👥</span>
                  {musteri.ilgiliKisiler.length} İlgili Kişi
                </p>
              )}
            </div>
          </Link>
        ))}

        {musteriler?.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            Henüz müşteri bulunmuyor.
          </div>
        )}
      </div>
    </div>
  )
} 