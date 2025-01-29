import * as z from "zod"

export const raporFiltreSchema = z.object({
  baslangicTarihi: z.string().min(1, "Başlangıç tarihi zorunludur"),
  bitisTarihi: z.string().min(1, "Bitiş tarihi zorunludur"),
  musteriId: z.number().optional(),
  kullaniciId: z.number().optional(),
})

export type RaporFiltre = z.infer<typeof raporFiltreSchema>

// Rapor tipleri için sabit değerler
export const RAPOR_TIPLERI = [
  {
    id: "musteri-aktivite",
    baslik: "Müşteri Aktivite Raporu",
    aciklama: "Müşteri bazlı aktivite ve fırsat takibi"
  },
  {
    id: "satis-performans",
    baslik: "Satış Performans Raporu",
    aciklama: "Kullanıcı bazlı satış performansı analizi"
  },
  {
    id: "firsat-durum",
    baslik: "Fırsat Durum Raporu",
    aciklama: "Fırsatların aşamalara göre dağılımı"
  },
  {
    id: "teklif-analiz",
    baslik: "Teklif Analiz Raporu",
    aciklama: "Tekliflerin durum ve tutar analizi"
  }
] as const

// Grafik tipleri için sabit değerler
export const GRAFIK_TIPLERI = [
  {
    id: "cizgi",
    baslik: "Çizgi Grafik",
    aciklama: "Zaman bazlı trend analizi için",
  },
  {
    id: "sutun",
    baslik: "Sütun Grafik",
    aciklama: "Kategorik karşılaştırmalar için",
  },
  {
    id: "pasta",
    baslik: "Pasta Grafik",
    aciklama: "Yüzdesel dağılımlar için",
  },
  {
    id: "halka",
    baslik: "Halka Grafik",
    aciklama: "İç içe dağılımlar için",
  },
  {
    id: "alan",
    baslik: "Alan Grafik",
    aciklama: "Kümülatif değerler için",
  },
] as const 