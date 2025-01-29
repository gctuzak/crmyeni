import * as z from "zod"

const musteriTipleri = ["BIREYSEL", "KURUMSAL"] as const

const bireyselMusteriSchema = z.object({
  musteriTipi: z.literal("BIREYSEL"),
  ad: z.string().min(1, "Ad zorunludur"),
  soyad: z.string().min(1, "Soyad zorunludur"),
  tcKimlik: z.string().length(11, "TC Kimlik numarası 11 haneli olmalıdır").optional(),
  telefon: z.string().optional(),
  email: z.string().email("Geçerli bir e-posta adresi giriniz").optional(),
  adres: z.string().optional(),
  temsilciId: z.number().optional(),
})

const kurumsalMusteriSchema = z.object({
  musteriTipi: z.literal("KURUMSAL"),
  firmaAdi: z.string().min(1, "Firma adı zorunludur"),
  vergiDairesi: z.string().optional(),
  vergiNo: z.string().optional(),
  telefon: z.string().optional(),
  email: z.string().email("Geçerli bir e-posta adresi giriniz").optional(),
  adres: z.string().optional(),
  temsilciId: z.number().optional(),
})

export const musteriSchema = z.discriminatedUnion("musteriTipi", [
  bireyselMusteriSchema,
  kurumsalMusteriSchema,
])

export type MusteriForm = z.infer<typeof musteriSchema>

export const ilgiliKisiSchema = z.object({
  ad: z.string().min(1, "Ad zorunludur"),
  soyad: z.string().optional(),
  unvan: z.string().optional(),
  telefon: z.string().optional(),
  email: z.string().email("Geçerli bir e-posta adresi giriniz").optional(),
})

export type IlgiliKisiForm = z.infer<typeof ilgiliKisiSchema> 