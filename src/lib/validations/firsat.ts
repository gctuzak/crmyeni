import * as z from "zod"

export const firsatSchema = z.object({
  musteriId: z.number({
    required_error: "Müşteri seçimi zorunludur",
  }),
  baslik: z.string().min(1, "Başlık zorunludur"),
  beklenenKapanisTarihi: z.string().min(1, "Beklenen kapanış tarihi zorunludur"),
  asamaId: z.number({
    required_error: "Aşama seçimi zorunludur",
  }),
  olasilik: z.number()
    .min(0, "Olasılık 0'dan küçük olamaz")
    .max(100, "Olasılık 100'den büyük olamaz"),
})

export type FirsatForm = z.infer<typeof firsatSchema>

// Fırsat aşamaları için sabit değerler
export const FIRSAT_ASAMALARI = [
  {
    id: 1,
    asamaAdi: "İlk Görüşme",
    sira: 1,
  },
  {
    id: 2,
    asamaAdi: "İhtiyaç Analizi",
    sira: 2,
  },
  {
    id: 3,
    asamaAdi: "Teklif Hazırlama",
    sira: 3,
  },
  {
    id: 4,
    asamaAdi: "Teklif Sunumu",
    sira: 4,
  },
  {
    id: 5,
    asamaAdi: "Müzakere",
    sira: 5,
  },
  {
    id: 6,
    asamaAdi: "Sözleşme",
    sira: 6,
  },
  {
    id: 7,
    asamaAdi: "Kazanıldı",
    sira: 7,
  },
  {
    id: 8,
    asamaAdi: "Kaybedildi",
    sira: 8,
  },
] as const

// Olasılık değerleri için sabit değerler
export const OLASILIK_DEGERLERI = [
  { deger: 10, etiket: "%10" },
  { deger: 25, etiket: "%25" },
  { deger: 50, etiket: "%50" },
  { deger: 75, etiket: "%75" },
  { deger: 90, etiket: "%90" },
  { deger: 100, etiket: "%100" },
] as const 