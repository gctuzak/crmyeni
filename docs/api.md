# API ve Fonksiyonlar

## Kimlik Doğrulama (Authentication)

### Clerk Entegrasyonu
- **Amaç**: Kullanıcı kimlik doğrulama ve yetkilendirme
- **Fonksiyonlar**:
  - `getCurrentUser()`: Oturum açmış kullanıcıyı getirir
  - `getUser()`: Kullanıcı bilgilerini getirir veya hata fırlatır
  - `requireAuth()`: Kimlik doğrulama gerektirir, yoksa hata fırlatır

### Kullanıcı Senkronizasyonu
- **Amaç**: Clerk ve veritabanı kullanıcılarını senkronize eder
- **İşlem**:
  1. Clerk'te oturum açıldığında kullanıcı bilgileri alınır
  2. Veritabanında kullanıcı aranır (clerkId veya email ile)
  3. Kullanıcı yoksa otomatik oluşturulur
  4. Kullanıcı varsa bilgileri güncellenir

## Müşteri İşlemleri

### Müşteri Listeleme
- **Fonksiyon**: `getMusteriler()`
- **Özellikler**:
  - Tüm müşterileri listeler
  - İlgili kişileri dahil eder
  - Müşteri temsilcisi bilgisini dahil eder
  - Kayıt tarihine göre sıralar

### Müşteri Arama
- **Fonksiyon**: `searchMusteriler(query: string)`
- **Özellikler**:
  - Minimum 2 karakter gerektirir
  - Ad, soyad, firma adı, vergi no gibi alanlarda arama yapar
  - İlgili kişilerde de arama yapar
  - Case-insensitive arama
  - En fazla 5 sonuç döndürür

### Müşteri Detay
- **Fonksiyon**: `getMusteri(id: number)`
- **Özellikler**:
  - Müşteri bilgilerini getirir
  - İlgili kişileri dahil eder
  - Müşteri temsilcisi bilgisini dahil eder

### Müşteri Oluşturma
- **Fonksiyon**: `createMusteri(data: MusteriForm)`
- **Validasyonlar**:
  - Müşteri tipi zorunlu
  - Bireysel müşteri için ad ve soyad zorunlu
  - Kurumsal müşteri için firma adı zorunlu
  - E-posta formatı kontrolü

### Müşteri Güncelleme
- **Fonksiyon**: `updateMusteri(id: number, data: MusteriForm)`
- **Özellikler**:
  - Tüm müşteri bilgilerini günceller
  - Müşteri temsilcisi değişikliği için admin yetkisi gerekir
  - Müşteri tipine göre alanları temizler

### İlgili Kişi İşlemleri
- **Fonksiyonlar**:
  - `createIlgiliKisi(musteriId: number, data: IlgiliKisiForm)`
  - `updateIlgiliKisi(id: number, data: IlgiliKisiForm)`
  - `deleteIlgiliKisi(id: number)`

## Teklif İşlemleri

### Teklif Numarası Oluşturma
- **Fonksiyon**: `generateTeklifNo(musteriId: number)`
- **Format**: YYYYAA-XXX
  - YYYY: Yıl
  - AA: Ay
  - XXX: Sıra numarası (her ay sıfırlanır)

### Teklif Listeleme
- **Fonksiyon**: `getTeklifler()`
- **Özellikler**:
  - Tüm teklifleri listeler
  - Müşteri bilgilerini dahil eder
  - Teklif kalemlerini dahil eder
  - Oluşturma tarihine göre sıralar

### Teklif Detay
- **Fonksiyon**: `getTeklif(id: number)`
- **Özellikler**:
  - Teklif bilgilerini getirir
  - Müşteri ve ilgili kişi bilgilerini dahil eder
  - Teklif kalemlerini dahil eder

### Teklif Oluşturma
- **Fonksiyon**: `createTeklif(data: TeklifForm)`
- **Özellikler**:
  - Otomatik teklif numarası oluşturur
  - Toplam tutarı hesaplar
  - KDV dahil tutarı hesaplar
  - Revizyon numarası 1 olarak başlar

### Teklif Güncelleme
- **Fonksiyon**: `updateTeklif(id: number, data: TeklifForm)`
- **Özellikler**:
  - Eski teklifi arşivler
  - Yeni revizyon oluşturur
  - Revizyon numarasını artırır
  - Teklif numarasına -RX ekler

### Teklif Durumu Güncelleme
- **Fonksiyon**: `updateTeklifDurumu(id: number, durum: string)`
- **Durumlar**:
  - Taslak
  - Hazırlanıyor
  - Gönderildi
  - Revize Edildi
  - Onaylandı
  - Reddedildi
  - İptal Edildi

## Validasyonlar

### Müşteri Validasyonları
```typescript
const bireyselMusteriSchema = z.object({
  musteriTipi: z.literal("BIREYSEL"),
  ad: z.string().min(1, "Ad zorunludur"),
  soyad: z.string().min(1, "Soyad zorunludur"),
  tcKimlik: z.string().length(11).optional(),
  // ...
})

const kurumsalMusteriSchema = z.object({
  musteriTipi: z.literal("KURUMSAL"),
  firmaAdi: z.string().min(1, "Firma adı zorunludur"),
  vergiDairesi: z.string().optional(),
  vergiNo: z.string().optional(),
  // ...
})
```

### Teklif Validasyonları
```typescript
const teklifSchema = z.object({
  musteriId: z.number({ required_error: "Müşteri seçimi zorunludur" }),
  ilgiliKisiId: z.number().optional(),
  baslik: z.string().min(1, "Başlık zorunludur"),
  paraBirimi: z.string().min(1, "Para birimi zorunludur"),
  durum: z.string().min(1, "Durum zorunludur"),
  sonGecerlilikTarihi: z.date({ required_error: "Son geçerlilik tarihi zorunludur" }),
  teklifKalemleri: z.array(teklifKalemiSchema).min(1, "En az bir kalem eklemelisiniz"),
  // ...
})
```

## Sabitler

### Para Birimleri
```typescript
export const PARA_BIRIMLERI = [
  "TRY",
  "USD",
  "EUR",
  "GBP",
] as const
```

### Birimler
```typescript
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
```

### KDV Oranları
```typescript
export const KDV_ORANLARI = [0, 1, 8, 10, 18, 20] as const
``` 