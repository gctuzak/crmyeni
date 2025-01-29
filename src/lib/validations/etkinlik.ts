import * as z from "zod"

export const etkinlikSchema = z.object({
  musteriId: z.number({
    required_error: "Müşteri seçimi zorunludur",
  }),
  etkinlikTipi: z.string().min(1, "Etkinlik tipi zorunludur"),
  baslangicTarihi: z.string().min(1, "Başlangıç tarihi zorunludur"),
  bitisTarihi: z.string().optional(),
  aciklama: z.string().optional(),
  kullaniciId: z.number({
    required_error: "Kullanıcı seçimi zorunludur",
  }),
})

export type EtkinlikForm = z.infer<typeof etkinlikSchema>

// Etkinlik tipleri için sabit değerler
export const ETKINLIK_TIPLERI = [
  "Görüşme",
  "Telefon",
  "E-posta",
  "Toplantı",
  "Sunum",
  "Demo",
  "Teklif Hazırlama",
  "Sözleşme",
  "Diğer",
] as const

// Etkinlik durumları için sabit değerler
export const ETKINLIK_DURUMLARI = [
  "Planlandı",
  "Devam Ediyor",
  "Tamamlandı",
  "İptal Edildi",
  "Ertelendi",
] as const 