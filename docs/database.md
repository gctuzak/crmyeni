# Veritabanı Yapısı ve İlişkileri

## Tablolar ve İlişkiler

### Kullanıcılar (Kullanicilar)
- **Amaç**: Sistem kullanıcılarını ve yetkilerini yönetir
- **Alanlar**:
  - `id`: Benzersiz tanımlayıcı (PK)
  - `ad`: Kullanıcı adı
  - `soyad`: Kullanıcı soyadı
  - `email`: E-posta adresi (unique)
  - `sifreHash`: Şifre hash'i
  - `clerkId`: Clerk kimlik doğrulama ID'si (unique)
  - `rolId`: Kullanıcı rolü (FK -> Roller)
- **İlişkiler**:
  - `rol`: Kullanıcının rolü (1:1)
  - `kayitliMusteriler`: Kullanıcının kaydettiği müşteriler (1:N)
  - `temsilciMusteriler`: Kullanıcının temsilcisi olduğu müşteriler (1:N)
  - `etkinlikler`: Kullanıcının etkinlikleri (1:N)
  - `teklifler`: Kullanıcının teklifleri (1:N)
  - `islemGecmisi`: Kullanıcının işlem geçmişi (1:N)

### Roller (Roller)
- **Amaç**: Kullanıcı rollerini ve yetkilerini tanımlar
- **Alanlar**:
  - `id`: Benzersiz tanımlayıcı (PK)
  - `rolAdi`: Rol adı (unique)
  - `yetkiler`: Rol yetkileri (JSON)
- **İlişkiler**:
  - `kullanicilar`: Role sahip kullanıcılar (1:N)

### Müşteriler (Musteriler)
- **Amaç**: Müşteri bilgilerini ve ilişkilerini yönetir
- **Alanlar**:
  - `id`: Benzersiz tanımlayıcı (PK)
  - `musteriTipi`: "BIREYSEL" veya "KURUMSAL"
  - Bireysel müşteri alanları:
    - `ad`: Müşteri adı
    - `soyad`: Müşteri soyadı
    - `tcKimlik`: TC Kimlik numarası
  - Kurumsal müşteri alanları:
    - `firmaAdi`: Firma adı
    - `vergiDairesi`: Vergi dairesi
    - `vergiNo`: Vergi numarası
  - Ortak alanlar:
    - `telefon`: Telefon numarası
    - `email`: E-posta adresi
    - `adres`: Adres bilgisi
    - `kayitTarihi`: Kayıt tarihi
    - `kullaniciId`: Kaydı oluşturan kullanıcı (FK)
    - `temsilciId`: Müşteri temsilcisi (FK)
- **İlişkiler**:
  - `kullanici`: Kaydı oluşturan kullanıcı (N:1)
  - `temsilci`: Müşteri temsilcisi (N:1)
  - `ilgiliKisiler`: Müşterinin ilgili kişileri (1:N)
  - `teklifler`: Müşteriye ait teklifler (1:N)
  - `etkinlikler`: Müşteriye ait etkinlikler (1:N)
  - `firsatlar`: Müşteriye ait fırsatlar (1:N)

### İlgili Kişiler (IlgiliKisiler)
- **Amaç**: Müşterilerin ilgili kişilerini yönetir
- **Alanlar**:
  - `id`: Benzersiz tanımlayıcı (PK)
  - `musteriId`: Bağlı olduğu müşteri (FK)
  - `ad`: İlgili kişi adı
  - `soyad`: İlgili kişi soyadı
  - `unvan`: İlgili kişi ünvanı
  - `telefon`: Telefon numarası
  - `email`: E-posta adresi
- **İlişkiler**:
  - `musteri`: Bağlı olduğu müşteri (N:1)

### Teklifler (Teklifler)
- **Amaç**: Müşterilere verilen teklifleri yönetir
- **Alanlar**:
  - `id`: Benzersiz tanımlayıcı (PK)
  - `musteriId`: Müşteri ID (FK)
  - `teklifNo`: Benzersiz teklif numarası (YYYYAA-XXX)
  - `baslik`: Teklif başlığı
  - `aciklama`: Teklif açıklaması
  - `toplamTutar`: Toplam tutar
  - `paraBirimi`: Para birimi
  - `durum`: Teklif durumu
  - `olusturmaTarihi`: Oluşturma tarihi
  - `sonGecerlilikTarihi`: Son geçerlilik tarihi
  - `kullaniciId`: Teklifi oluşturan kullanıcı (FK)
  - `revizyon`: Revizyon numarası
  - `notlar`: Özel notlar
- **İlişkiler**:
  - `musteri`: Teklif verilen müşteri (N:1)
  - `kullanici`: Teklifi oluşturan kullanıcı (N:1)
  - `teklifKalemleri`: Teklif kalemleri (1:N)
  - `teklifDosyalari`: Teklif dosyaları (1:N)

### Teklif Kalemleri (TeklifKalemleri)
- **Amaç**: Teklif içindeki ürün/hizmet kalemlerini yönetir
- **Alanlar**:
  - `id`: Benzersiz tanımlayıcı (PK)
  - `teklifId`: Bağlı olduğu teklif (FK)
  - `urunAdi`: Ürün/hizmet adı
  - `miktar`: Miktar
  - `birim`: Birim (Adet, Kg, Lt vb.)
  - `birimFiyat`: Birim fiyat
  - `kdvOrani`: KDV oranı
  - `aciklama`: Kalem açıklaması
- **İlişkiler**:
  - `teklif`: Bağlı olduğu teklif (N:1)

### Teklif Dosyaları (TeklifDosyalari)
- **Amaç**: Tekliflerle ilgili dosyaları yönetir
- **Alanlar**:
  - `id`: Benzersiz tanımlayıcı (PK)
  - `teklifId`: Bağlı olduğu teklif (FK)
  - `dosyaAdi`: Dosya adı
  - `dosyaYolu`: Dosya yolu
  - `yuklemeTarihi`: Yükleme tarihi
- **İlişkiler**:
  - `teklif`: Bağlı olduğu teklif (N:1)

### İşlem Geçmişi (IslemGecmisi)
- **Amaç**: Sistemdeki tüm değişiklikleri loglar
- **Alanlar**:
  - `id`: Benzersiz tanımlayıcı (PK)
  - `tabloAdi`: İşlem yapılan tablo
  - `kayitId`: İşlem yapılan kayıt ID
  - `degisiklikDetayi`: Değişiklik detayları (JSON)
  - `tarih`: İşlem tarihi
  - `kullaniciId`: İşlemi yapan kullanıcı (FK)
- **İlişkiler**:
  - `kullanici`: İşlemi yapan kullanıcı (N:1)

### Etkinlikler (Etkinlikler)
- **Amaç**: Müşterilerle ilgili aktivite ve görevleri yönetir
- **Alanlar**:
  - `id`: Benzersiz tanımlayıcı (PK)
  - `musteriId`: Müşteri ID (FK)
  - `ilgiliKisiId`: İlgili kişi ID (FK, optional)
  - `etkinlikTipi`: Etkinlik tipi (enum)
  - `baslangicTarihi`: Başlangıç tarihi
  - `bitisTarihi`: Bitiş tarihi (optional)
  - `aciklama`: Etkinlik açıklaması
  - `durum`: Etkinlik durumu
  - `oncelik`: Etkinlik önceliği
  - `kullaniciId`: Etkinliği oluşturan kullanıcı (FK)
- **İlişkiler**:
  - `musteri`: Bağlı olduğu müşteri (N:1)
  - `ilgiliKisi`: Bağlı olduğu ilgili kişi (N:1)
  - `kullanici`: Etkinliği oluşturan kullanıcı (N:1)

## İndeksler ve Kısıtlamalar

### Unique İndeksler
- `Kullanicilar.email`
- `Kullanicilar.clerkId`
- `Roller.rolAdi`
- `Teklifler.teklifNo`

### Foreign Key İndeksleri
- `Musteriler.kullaniciId`
- `Musteriler.temsilciId`
- `IlgiliKisiler.musteriId`
- `Teklifler.musteriId`
- `Teklifler.kullaniciId`
- `TeklifKalemleri.teklifId`
- `TeklifDosyalari.teklifId`

### Cascade Delete
- `Teklifler -> TeklifKalemleri`
- `Teklifler -> TeklifDosyalari` 