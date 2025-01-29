# Kurulum ve Geliştirme

## Gereksinimler

- Node.js 18.0.0 veya üzeri
- PostgreSQL 15.0 veya üzeri
- pnpm 8.0.0 veya üzeri

## Kurulum

1. Repoyu klonlayın:
```bash
git clone https://github.com/gctuzak/crmyeni.git
cd crmyeni
```

2. Bağımlılıkları yükleyin:
```bash
pnpm install
```

3. Ortam değişkenlerini ayarlayın:
```bash
cp .env.example .env
```

4. `.env` dosyasını düzenleyin:
```env
# Veritabanı
DATABASE_URL="postgresql://user:password@localhost:5432/crmyeni"

# Kimlik Doğrulama
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Uygulama
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Veritabanını oluşturun:
```bash
pnpm prisma db push
pnpm prisma db seed
```

6. Geliştirme sunucusunu başlatın:
```bash
pnpm dev
```

## Geliştirme Ortamı

### VS Code Ayarları

1. Önerilen eklentileri yükleyin:
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense

2. Workspace ayarlarını yapın:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Git Hooks

Proje, Husky ile git hook'ları kullanır:

- **pre-commit**: Lint ve format kontrolü
- **commit-msg**: Conventional Commits kontrolü

### Commit Mesajları

Conventional Commits standardını kullanın:

- `feat`: Yeni özellik
- `fix`: Hata düzeltmesi
- `docs`: Dokümantasyon değişiklikleri
- `style`: Kod formatı değişiklikleri
- `refactor`: Kod yeniden düzenleme
- `test`: Test değişiklikleri
- `chore`: Yapılandırma değişiklikleri

Örnek:
```
feat(musteri): ilgili kişi ekleme özelliği eklendi
```

## Test

### Unit Testler
```bash
pnpm test
```

### E2E Testler
```bash
pnpm test:e2e
```

### Test Kapsamı
```bash
pnpm test:coverage
```

## Derleme

### Geliştirme
```bash
pnpm build
pnpm start
```

### Docker
```bash
docker build -t crmyeni .
docker run -p 3000:3000 crmyeni
```

## Veritabanı

### Migrasyon Oluşturma
```bash
pnpm prisma migrate dev --name <migration-name>
```

### Migrasyon Uygulama
```bash
pnpm prisma migrate deploy
```

### Seed Data
```bash
pnpm prisma db seed
```

### Studio
```bash
pnpm prisma studio
```

## CI/CD

### GitHub Actions

1. Test ve Lint:
- Her PR'da çalışır
- Unit testler
- E2E testler
- Lint kontrolü
- Type kontrolü

2. Deploy:
- `main` branch'e push'ta çalışır
- Docker image oluşturur
- Image'ı registry'e push eder
- Sunucuda deploy eder

### Vercel

1. Preview Deployments:
- Her PR için preview ortamı
- Branch bazlı deployments
- Otomatik SSL

2. Production Deployment:
- `main` branch'ten otomatik deploy
- Zero-downtime deployment
- Automatic rollback

## Monitoring

### Sentry

1. Hata Takibi:
- Runtime hataları
- Performance monitoring
- User feedback

2. Alerts:
- Error threshold alerts
- Performance alerts
- Uptime monitoring

### Vercel Analytics

1. Performance:
- Web vitals
- Page load times
- API response times

2. Usage:
- Page views
- Unique visitors
- Geographic distribution

## Güvenlik

### Clerk

1. Kimlik Doğrulama:
- Email/Password
- Social login
- 2FA

2. Yetkilendirme:
- Role-based access
- Permission-based access
- API key management

### API Güvenliği

1. Rate Limiting:
- IP based
- User based
- Endpoint based

2. Input Validation:
- Zod schema validation
- Sanitization
- XSS prevention

## Performans

### Optimizasyonlar

1. Build:
- Tree shaking
- Code splitting
- Image optimization

2. Runtime:
- React Query caching
- Incremental Static Regeneration
- Edge caching

### Monitoring

1. Metrics:
- TTFB
- LCP
- FID
- CLS

2. Profiling:
- React profiler
- Network waterfall
- Memory usage 