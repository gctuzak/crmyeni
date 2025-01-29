import * as z from "zod"

export const musteriSchema = z.object({
  musteriTipi: z.string().min(1, "Müşteri tipi zorunludur"),
  ad: z.string().min(1, "Ad zorunludur"),
  soyad: z.string().optional(),
  vergiNo: z.string().optional(),
  telefon: z.string().optional(),
  email: z.string().email("Geçerli bir e-posta adresi giriniz").optional(),
  adres: z.string().optional(),
})

export type MusteriForm = z.infer<typeof musteriSchema>

export const ilgiliKisiSchema = z.object({
  ad: z.string().min(1, "Ad zorunludur"),
  soyad: z.string().optional(),
  unvan: z.string().optional(),
  telefon: z.string().optional(),
  email: z.string().email("Geçerli bir e-posta adresi giriniz").optional(),
})

export type IlgiliKisiForm = z.infer<typeof ilgiliKisiSchema> 