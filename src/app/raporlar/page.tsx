import { RaporListesi } from "@/components/raporlar/rapor-listesi"
import { RAPOR_TIPLERI } from "@/lib/validations/rapor"

export default function RaporlarPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Raporlar</h1>
      </div>

      <RaporListesi raporlar={RAPOR_TIPLERI} />
    </div>
  )
} 