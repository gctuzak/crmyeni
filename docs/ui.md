# Kullanıcı Arayüzü Bileşenleri

## Sayfa Yapısı

### Layout
- **Dosya**: `src/app/layout.tsx`
- **Özellikler**:
  - Clerk kimlik doğrulama sağlayıcısı
  - Tema sağlayıcısı
  - Navigasyon menüsü
  - Toast bildirimleri

### Navigasyon
- **Dosya**: `src/components/layout/nav.tsx`
- **Özellikler**:
  - Responsive tasarım
  - Mobil menü
  - Aktif sayfa vurgusu
  - Kullanıcı profil menüsü

## Müşteri Bileşenleri

### Müşteri Listesi
- **Dosya**: `src/components/musteriler/musteri-listesi.tsx`
- **Özellikler**:
  - Sayfalama
  - Sıralama
  - Arama
  - Filtreler:
    - Müşteri tipi
    - Durum
    - Müşteri temsilcisi

### Müşteri Formu
- **Dosya**: `src/components/musteriler/musteri-form.tsx`
- **Özellikler**:
  - Müşteri tipi seçimi
  - Dinamik form alanları
  - İlgili kişi ekleme/silme
  - Form validasyonu
  - Otomatik kaydetme

### Müşteri Detay
- **Dosya**: `src/components/musteriler/musteri-detay.tsx`
- **Özellikler**:
  - Müşteri bilgileri
  - İlgili kişiler listesi
  - Teklif geçmişi
  - Düzenleme ve silme işlemleri

## Teklif Bileşenleri

### Teklif Listesi
- **Dosya**: `src/components/teklifler/teklif-listesi.tsx`
- **Özellikler**:
  - Sayfalama
  - Sıralama
  - Arama
  - Filtreler:
    - Durum
    - Tarih aralığı
    - Müşteri
  - Toplu işlemler

### Teklif Formu
- **Dosya**: `src/components/teklifler/teklif-form.tsx`
- **Özellikler**:
  - Müşteri seçimi
  - İlgili kişi seçimi
  - Otomatik teklif numarası
  - Kalem ekleme/silme
  - Toplam hesaplama
  - KDV hesaplama
  - Form validasyonu
  - Taslak kaydetme

### Teklif Detay
- **Dosya**: `src/components/teklifler/teklif-detay.tsx`
- **Özellikler**:
  - Teklif bilgileri
  - Kalem listesi
  - Revizyon geçmişi
  - Durum güncelleme
  - PDF oluşturma

## Ortak Bileşenler

### Form Bileşenleri
- **Dosya**: `src/components/ui/form.tsx`
- **Özellikler**:
  - Input
  - Select
  - Textarea
  - Checkbox
  - Radio
  - Date picker
  - Combobox
  - Form validasyonu

### Tablo Bileşenleri
- **Dosya**: `src/components/ui/table.tsx`
- **Özellikler**:
  - Sıralama
  - Filtreleme
  - Sayfalama
  - Seçim
  - Responsive tasarım

### Dialog Bileşenleri
- **Dosya**: `src/components/ui/dialog.tsx`
- **Özellikler**:
  - Modal
  - Alert
  - Confirm
  - Sheet
  - Drawer

### Bildirim Bileşenleri
- **Dosya**: `src/components/ui/toast.tsx`
- **Özellikler**:
  - Success
  - Error
  - Warning
  - Info
  - Loading
  - Progress

## Tema ve Stil

### Tema Değişkenleri
```typescript
export const themeConfig = {
  colors: {
    primary: {
      DEFAULT: "#0f172a",
      foreground: "#ffffff",
    },
    secondary: {
      DEFAULT: "#64748b",
      foreground: "#ffffff",
    },
    // ...
  },
  borderRadius: {
    sm: "0.125rem",
    DEFAULT: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    full: "9999px",
  },
  // ...
}
```

### Responsive Tasarım
```typescript
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
}
```

### Animasyonlar
```typescript
export const animations = {
  DEFAULT: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  fast: "100ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
}
```

## İkonlar ve Medya

### İkon Bileşenleri
- **Dosya**: `src/components/ui/icons.tsx`
- **Özellikler**:
  - Lucide ikonları
  - Custom SVG ikonlar
  - Boyut varyantları
  - Renk varyantları

### Medya Bileşenleri
- **Dosya**: `src/components/ui/media.tsx`
- **Özellikler**:
  - Resim
  - Avatar
  - Video
  - Dosya önizleme
  - Yükleme göstergesi 