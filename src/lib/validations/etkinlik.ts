import * as z from "zod"

export const ETKINLIK_TIPLERI = [
  "CARI_HESAP_BILGILERI",
  "FATURA_KESILECEK",
  "GELEN_EPOSTA",
  "GIDEN_EPOSTA",
  "IMALAT",
  "ISEMRI_OLUSTURULACAK",
  "KESIF",
  "MONTAJ",
  "MUSTERI_ZIYARET",
  "NUMUNE_GONDERIMI",
  "PRIM_HAKEDISI",
  "PROJE_CIZIM",
  "PROJE_INCELEME",
  "SEVKIYAT",
  "SIKAYET_ARIZA_SERVIS",
  "TAHSILAT_TAKIBI",
  "TEKLIF_DURUM_TAKIBI",
  "TEKLIF_GONDERIM_ONAYI",
  "TEKLIF_ONAY_TALEBI",
  "TEKLIF_VERILECEK",
  "TEKNIK_SERVIS",
  "TELEFON_GORUSMESI",
  "TOPLANTI",
  "TOPLU_EPOSTA",
] as const

export const ETKINLIK_DURUMLARI = [
  "BEKLIYOR",
  "DEVAM_EDIYOR",
  "TAMAMLANDI",
  "IPTAL_EDILDI",
] as const

export const ETKINLIK_ONCELIKLERI = [
  "DUSUK",
  "NORMAL",
  "YUKSEK",
  "KRITIK",
] as const

export const etkinlikSchema = z.object({
  musteriId: z.number({
    required_error: "Müşteri seçimi zorunludur",
  }),
  ilgiliKisiId: z.number().optional(),
  etkinlikTipi: z.enum(ETKINLIK_TIPLERI, {
    required_error: "Etkinlik tipi seçimi zorunludur",
  }),
  baslangicTarihi: z.string({
    required_error: "Başlangıç tarihi zorunludur",
  }),
  bitisTarihi: z.string().optional(),
  aciklama: z.string().optional(),
  durum: z.enum(ETKINLIK_DURUMLARI).default("BEKLIYOR"),
  oncelik: z.enum(ETKINLIK_ONCELIKLERI).default("NORMAL"),
})

export type EtkinlikForm = z.infer<typeof etkinlikSchema> 