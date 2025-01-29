import { EtkinlikForm } from "@/components/etkinlikler/etkinlik-form"

export default function YeniEtkinlikPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Yeni Etkinlik Ekle</h1>
      <EtkinlikForm />
    </div>
  )
} 