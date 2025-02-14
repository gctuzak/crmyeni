import * as z from "zod"

export const kullaniciSchema = z.object({
  ad: z.string().min(1, "Ad zorunludur"),
  soyad: z.string().min(1, "Soyad zorunludur"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  sifre: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  rolId: z.number().min(1, "Rol seçimi zorunludur"),
})

export type KullaniciForm = z.infer<typeof kullaniciSchema> 