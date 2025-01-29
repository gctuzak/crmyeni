# CRM Yeni

Modern ve kullanıcı dostu bir CRM uygulaması.

## Özellikler

- 👥 Müşteri yönetimi
  - Bireysel ve kurumsal müşteriler
  - İlgili kişi yönetimi
  - Müşteri temsilcisi atama
  - Detaylı müşteri profili

- 📝 Teklif yönetimi
  - Otomatik teklif numarası
  - Çoklu kalem desteği
  - KDV hesaplama
  - Revizyon takibi
  - PDF çıktı

- 🔒 Güvenlik
  - Clerk ile kimlik doğrulama
  - Rol tabanlı yetkilendirme
  - API güvenliği
  - Input validasyonu

- 🎨 Modern UI/UX
  - Responsive tasarım
  - Dark/Light tema
  - Kolay kullanım
  - Hızlı yükleme

## Teknolojiler

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes, Prisma
- **Veritabanı**: PostgreSQL
- **Kimlik Doğrulama**: Clerk
- **UI**: Tailwind CSS, shadcn/ui
- **Form**: React Hook Form, Zod
- **State**: Zustand
- **API**: tRPC
- **Deploy**: Vercel

## Başlangıç

Detaylı kurulum ve geliştirme talimatları için [Kurulum ve Geliştirme](docs/development.md) dokümanına bakın.

Hızlı başlangıç:

```bash
# Repoyu klonlayın
git clone https://github.com/gctuzak/crmyeni.git

# Dizine girin
cd crmyeni

# Bağımlılıkları yükleyin
pnpm install

# Geliştirme sunucusunu başlatın
pnpm dev
```

## Dokümantasyon

- [Veritabanı Yapısı](docs/database.md)
- [API ve Fonksiyonlar](docs/api.md)
- [Kullanıcı Arayüzü](docs/ui.md)
- [Kurulum ve Geliştirme](docs/development.md)

## Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim

Gökhan Can TÜZAK - [@gctuzak](https://twitter.com/gctuzak)

Proje Linki: [https://github.com/gctuzak/crmyeni](https://github.com/gctuzak/crmyeni) 