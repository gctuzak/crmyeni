-- Roller tablosuna örnek veriler
INSERT INTO "Roller" ("RolAdi", "Yetkiler") VALUES
('Admin', 'tum_yetkiler'),
('Satış Temsilcisi', 'musteri,teklif,firsat,etkinlik'),
('Müşteri Temsilcisi', 'musteri,etkinlik');

-- Kullanıcılar tablosuna örnek veriler
INSERT INTO "Kullanicilar" ("Ad", "Soyad", "Email", "SifreHash", "RolID") VALUES
('Admin', 'User', 'admin@example.com', 'hash123', 1),
('Ahmet', 'Yılmaz', 'ahmet@example.com', 'hash456', 2),
('Ayşe', 'Demir', 'ayse@example.com', 'hash789', 2);

-- Müşteriler tablosuna örnek veriler
INSERT INTO "Musteriler" ("MusteriTipi", "Ad", "Soyad", "VergiNo", "Telefon", "Email", "Adres") VALUES
('Bireysel', 'Mehmet', 'Kaya', NULL, '5551234567', 'mehmet@example.com', 'Istanbul'),
('Kurumsal', 'ABC Sirketi', NULL, '1234567890', '2121234567', 'info@abc.com', 'Ankara'),
('Kurumsal', 'XYZ Ltd.', NULL, '9876543210', '2161234567', 'info@xyz.com', 'Izmir');

-- İlgili Kişiler tablosuna örnek veriler
INSERT INTO "IlgiliKisiler" ("MusteriID", "Ad", "Soyad", "Unvan", "Telefon", "Email") VALUES
(2, 'Ali', 'Yildiz', 'Satin Alma Muduru', '5552345678', 'ali@abc.com'),
(2, 'Zeynep', 'Celik', 'Finans Muduru', '5553456789', 'zeynep@abc.com'),
(3, 'Can', 'Demir', 'Genel Mudur', '5554567890', 'can@xyz.com');

-- Aşamalar tablosuna örnek veriler
INSERT INTO "Asamalar" ("AsamaAdi", "Sira") VALUES
('Ilk Gorusme', 1),
('Ihtiyac Analizi', 2),
('Teklif Hazirlama', 3),
('Teklif Sunumu', 4),
('Muzakere', 5),
('Sozlesme', 6),
('Kazanildi', 7),
('Kaybedildi', 8);

-- Teklifler tablosuna örnek veriler
INSERT INTO "Teklifler" ("MusteriID", "TeklifNo", "Baslik", "Aciklama", "ToplamTutar", "ParaBirimi", "Durum", "SonGecerlilikTarihi", "KullaniciID", "Revizyon") VALUES
(2, 'TKF-202401-0001', 'Yazilim Projesi', 'ERP Yazilimi Gelistirme', 150000.00, 'TRY', 'Taslak', '2024-02-28', 1, 1),
(3, 'TKF-202401-0002', 'Danismanlik Hizmeti', 'Is Surecleri Danismanligi', 50000.00, 'TRY', 'Hazirlaniyor', '2024-02-15', 2, 1);

-- Teklif Kalemleri tablosuna örnek veriler
INSERT INTO "TeklifKalemleri" ("TeklifID", "UrunAdi", "Miktar", "Birim", "BirimFiyat", "KDVOrani", "Aciklama") VALUES
(1, 'Frontend Gelistirme', 1, 'Adet', 50000.00, 18, 'React ve Next.js ile gelistirme'),
(1, 'Backend Gelistirme', 1, 'Adet', 60000.00, 18, 'Node.js ve PostgreSQL ile gelistirme'),
(1, 'Mobil Uygulama', 1, 'Adet', 40000.00, 18, 'React Native ile gelistirme'),
(2, 'Is Analizi', 10, 'Saat', 2500.00, 18, 'Gunluk danismanlik ucreti'),
(2, 'Dokumantasyon', 1, 'Adet', 25000.00, 18, 'Surec dokumantasyonu');

-- Fırsatlar tablosuna örnek veriler
INSERT INTO "Firsatlar" ("MusteriID", "Baslik", "BeklenenKapanisTarihi", "AsamaID", "Olasilik") VALUES
(2, 'ERP Projesi', '2024-03-31', 3, 75.00),
(3, 'Danismanlik Projesi', '2024-02-28', 4, 90.00);

-- Etkinlikler tablosuna örnek veriler
INSERT INTO "Etkinlikler" ("MusteriID", "EtkinlikTipi", "BaslangicTarihi", "BitisTarihi", "Aciklama", "KullaniciID") VALUES
(2, 'Toplanti', '2024-01-15 10:00:00', '2024-01-15 11:30:00', 'Proje baslangic toplantisi', 2),
(2, 'Demo', '2024-01-20 14:00:00', '2024-01-20 15:00:00', 'Urun demo sunumu', 2),
(3, 'Gorusme', '2024-01-18 11:00:00', '2024-01-18 12:00:00', 'Ihtiyac analizi gorusmesi', 3);

-- İşlem Geçmişi tablosuna örnek veriler
INSERT INTO "IslemGecmisi" ("TabloAdi", "KayitID", "DegisiklikDetayi", "KullaniciID") VALUES
('Teklifler', 1, 'Yeni teklif olusturuldu', 2),
('Teklifler', 1, 'Teklif durumu guncellendi: Taslak -> Hazirlaniyor', 2),
('Musteriler', 2, 'Yeni musteri olusturuldu', 3),
('Etkinlikler', 1, 'Yeni etkinlik olusturuldu', 2); 