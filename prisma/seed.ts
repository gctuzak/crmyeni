const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Rolleri oluştur
  const adminRol = await prisma.roller.upsert({
    where: { rolAdi: 'Admin' },
    update: {},
    create: {
      rolAdi: 'Admin',
      yetkiler: JSON.stringify(['musteri.*', 'kullanici.*', 'teklif.*', 'etkinlik.*', 'firsat.*']),
    },
  })

  const temsilciRol = await prisma.roller.upsert({
    where: { rolAdi: 'Müşteri Temsilcisi' },
    update: {},
    create: {
      rolAdi: 'Müşteri Temsilcisi',
      yetkiler: JSON.stringify(['musteri.okuma', 'musteri.yazma', 'teklif.*', 'etkinlik.*', 'firsat.*']),
    },
  })

  // Kullanıcıları oluştur
  const admin = await prisma.kullanicilar.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      ad: 'Admin',
      soyad: 'Kullanıcı',
      sifreHash: 'hash123',
      rolId: adminRol.id,
    },
  })

  const temsilci1 = await prisma.kullanicilar.upsert({
    where: { email: 'ahmet.yilmaz@example.com' },
    update: {},
    create: {
      email: 'ahmet.yilmaz@example.com',
      ad: 'Ahmet',
      soyad: 'Yılmaz',
      sifreHash: 'hash123',
      rolId: temsilciRol.id,
    },
  })

  const temsilci2 = await prisma.kullanicilar.upsert({
    where: { email: 'ayse.demir@example.com' },
    update: {},
    create: {
      email: 'ayse.demir@example.com',
      ad: 'Ayşe',
      soyad: 'Demir',
      sifreHash: 'hash123',
      rolId: temsilciRol.id,
    },
  })

  // Müşterileri oluştur
  // Bireysel müşteriler
  const bireysel1 = await prisma.musteriler.create({
    data: {
      musteriTipi: 'BIREYSEL',
      ad: 'Mehmet',
      soyad: 'Kaya',
      tcKimlik: '12345678901',
      telefon: '0532 111 2233',
      email: 'mehmet.kaya@email.com',
      adres: 'Atatürk Cad. No:123 Kadıköy/İstanbul',
      kullaniciId: admin.id,
      temsilciId: temsilci1.id,
      ilgiliKisiler: {
        create: [
          {
            ad: 'Zeynep',
            soyad: 'Kaya',
            unvan: 'Eş',
            telefon: '0533 222 3344',
            email: 'zeynep.kaya@email.com',
          },
        ],
      },
    },
  })

  const bireysel2 = await prisma.musteriler.create({
    data: {
      musteriTipi: 'BIREYSEL',
      ad: 'Fatma',
      soyad: 'Öztürk',
      tcKimlik: '98765432109',
      telefon: '0542 333 4455',
      email: 'fatma.ozturk@email.com',
      adres: 'Cumhuriyet Mah. 1234 Sk. No:5 Çankaya/Ankara',
      kullaniciId: admin.id,
      temsilciId: temsilci2.id,
    },
  })

  // Kurumsal müşteriler
  const kurumsal1 = await prisma.musteriler.create({
    data: {
      musteriTipi: 'KURUMSAL',
      firmaAdi: 'Teknoloji A.Ş.',
      vergiDairesi: 'Mecidiyeköy',
      vergiNo: '1234567890',
      telefon: '0212 444 5566',
      email: 'info@teknoloji.com',
      adres: 'Büyükdere Cad. No:123 Şişli/İstanbul',
      kullaniciId: admin.id,
      temsilciId: temsilci1.id,
      ilgiliKisiler: {
        create: [
          {
            ad: 'Ali',
            soyad: 'Yıldız',
            unvan: 'Genel Müdür',
            telefon: '0533 555 6677',
            email: 'ali.yildiz@teknoloji.com',
          },
          {
            ad: 'Ayşe',
            soyad: 'Çelik',
            unvan: 'Satın Alma Müdürü',
            telefon: '0532 666 7788',
            email: 'ayse.celik@teknoloji.com',
          },
        ],
      },
    },
  })

  const kurumsal2 = await prisma.musteriler.create({
    data: {
      musteriTipi: 'KURUMSAL',
      firmaAdi: 'İnşaat Ltd. Şti.',
      vergiDairesi: 'Çankaya',
      vergiNo: '9876543210',
      telefon: '0312 777 8899',
      email: 'info@insaat.com',
      adres: 'Eskişehir Yolu 9. Km No:1 Çankaya/Ankara',
      kullaniciId: admin.id,
      temsilciId: temsilci2.id,
      ilgiliKisiler: {
        create: [
          {
            ad: 'Mustafa',
            soyad: 'Şahin',
            unvan: 'Şirket Müdürü',
            telefon: '0533 888 9900',
            email: 'mustafa.sahin@insaat.com',
          },
        ],
      },
    },
  })

  // Örnek etkinlikler
  const etkinlikler = [
    {
      musteriId: kurumsal1.id,
      etkinlikTipi: "MUSTERI_ZIYARET",
      baslangicTarihi: new Date("2024-02-01T10:00:00Z"),
      bitisTarihi: new Date("2024-02-01T11:30:00Z"),
      aciklama: "Yeni proje görüşmesi",
      durum: "TAMAMLANDI",
      oncelik: "YUKSEK",
      kullaniciId: temsilci1.id,
    },
    {
      musteriId: kurumsal1.id,
      etkinlikTipi: "TEKLIF_VERILECEK",
      baslangicTarihi: new Date("2024-02-05T14:00:00Z"),
      bitisTarihi: new Date("2024-02-05T15:00:00Z"),
      aciklama: "Yeni sistem için teklif hazırlanacak",
      durum: "BEKLIYOR",
      oncelik: "NORMAL",
      kullaniciId: temsilci1.id,
    },
    {
      musteriId: bireysel1.id,
      etkinlikTipi: "TELEFON_GORUSMESI",
      baslangicTarihi: new Date("2024-02-02T09:00:00Z"),
      bitisTarihi: new Date("2024-02-02T09:30:00Z"),
      aciklama: "Mevcut sistemle ilgili görüşme",
      durum: "TAMAMLANDI",
      oncelik: "NORMAL",
      kullaniciId: temsilci1.id,
    },
  ]

  // Etkinlikleri ekle
  for (const etkinlik of etkinlikler) {
    await prisma.etkinlikler.create({
      data: etkinlik,
    })
  }

  // Aşamaları oluştur
  const asamalar = await prisma.asamalar.createMany({
    data: [
      { asamaAdi: 'İlk Görüşme', sira: 1 },
      { asamaAdi: 'İhtiyaç Analizi', sira: 2 },
      { asamaAdi: 'Teklif Hazırlama', sira: 3 },
      { asamaAdi: 'Teklif Sunumu', sira: 4 },
      { asamaAdi: 'Müzakere', sira: 5 },
      { asamaAdi: 'Sözleşme', sira: 6 },
      { asamaAdi: 'Kazanıldı', sira: 7 },
      { asamaAdi: 'Kaybedildi', sira: 8 },
    ],
  })

  // Fırsatlar oluştur
  await prisma.firsatlar.createMany({
    data: [
      {
        musteriId: kurumsal1.id,
        baslik: 'Yazılım Projesi',
        beklenenKapanisTarihi: new Date('2024-03-15'),
        asamaId: 3,
        olasilik: 75,
      },
      {
        musteriId: kurumsal2.id,
        baslik: 'İnşaat Malzemeleri',
        beklenenKapanisTarihi: new Date('2024-04-01'),
        asamaId: 2,
        olasilik: 50,
      },
    ],
  })

  // Teklifler oluştur
  const teklif1 = await prisma.teklifler.create({
    data: {
      musteriId: kurumsal1.id,
      teklifNo: 'TKF-2024-001',
      baslik: 'Yazılım Geliştirme Projesi',
      aciklama: 'Web tabanlı CRM yazılımı geliştirme projesi',
      toplamTutar: 250000,
      paraBirimi: 'TRY',
      durum: 'HAZIRLANIYOR',
      sonGecerlilikTarihi: new Date('2024-03-01'),
      kullaniciId: temsilci1.id,
      notlar: 'Müşteri özel istekleri dikkate alınacak',
      teklifKalemleri: {
        create: [
          {
            urunAdi: 'Analiz ve Tasarım',
            miktar: 1,
            birim: 'Adet',
            birimFiyat: 50000,
            kdvOrani: 20,
            aciklama: 'Sistem analizi ve tasarım dokümanı',
          },
          {
            urunAdi: 'Yazılım Geliştirme',
            miktar: 1,
            birim: 'Adet',
            birimFiyat: 150000,
            kdvOrani: 20,
            aciklama: 'Yazılım geliştirme ve test',
          },
          {
            urunAdi: 'Eğitim ve Destek',
            miktar: 1,
            birim: 'Adet',
            birimFiyat: 50000,
            kdvOrani: 20,
            aciklama: 'Kullanıcı eğitimi ve 1 yıl destek',
          },
        ],
      },
    },
  })

  console.log('Test verileri başarıyla oluşturuldu')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 