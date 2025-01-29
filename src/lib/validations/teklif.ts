import * as z from "zod"

export const teklifKalemiSchema = z.object({
  urunAdi: z.string().min(1, "Ürün adı zorunludur"),
  miktar: z.number().min(1, "Miktar en az 1 olmalıdır"),
  birim: z.string().min(1, "Birim zorunludur"),
  birimFiyat: z.number().min(0, "Birim fiyat 0'dan büyük olmalıdır"),
  kdvOrani: z.number().min(0, "KDV oranı 0'dan büyük olmalıdır"),
  aciklama: z.string().optional(),
})

export const teklifSchema = z.object({
  musteriId: z.number({
    required_error: "Müşteri seçimi zorunludur",
  }),
  ilgiliKisiId: z.number().optional(),
  baslik: z.string().min(1, "Başlık zorunludur"),
  aciklama: z.string().optional(),
  paraBirimi: z.string().min(1, "Para birimi zorunludur"),
  durum: z.string().min(1, "Durum zorunludur"),
  sonGecerlilikTarihi: z.date({
    required_error: "Son geçerlilik tarihi zorunludur",
  }),
  notlar: z.string().optional(),
  teklifKalemleri: z.array(teklifKalemiSchema).min(1, "En az bir kalem eklemelisiniz"),
})

export type TeklifForm = z.infer<typeof teklifSchema>
export type TeklifKalemiForm = z.infer<typeof teklifKalemiSchema>

// Teklif durumları için sabit değerler
export const TEKLIF_DURUMLARI = [
  "Taslak",
  "Hazırlanıyor",
  "Gönderildi",
  "Revize Edildi",
  "Onaylandı",
  "Reddedildi",
  "İptal Edildi",
] as const

// Para birimleri için sabit değerler
export const PARA_BIRIMLERI = [
  "TRY",
  "USD",
  "EUR",
  "GBP",
] as const

// Birimler için sabit değerler
export const BIRIMLER = [
  "Adet",
  "Kg",
  "Lt",
  "Mt",
  "M²",
  "M³",
  "Paket",
  "Kutu",
  "Saat",
  "Gün",
  "Ay",
  "Yıl",
] as const

// KDV oranları için sabit değerler
export const KDV_ORANLARI = [0, 1, 8, 10, 18, 20] as const 