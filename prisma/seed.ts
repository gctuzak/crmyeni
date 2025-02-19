import { PrismaClient, EtkinlikTipi } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Önce mevcut verileri temizle
    await prisma.teklifDosyalari.deleteMany()
    await prisma.teklifKalemleri.deleteMany()
    await prisma.teklifler.deleteMany()
    await prisma.firsatlar.deleteMany()
    await prisma.etkinlikler.deleteMany()
    await prisma.ilgiliKisiler.deleteMany()
    await prisma.musteriler.deleteMany()
    await prisma.kullanicilar.deleteMany()
    await prisma.roller.deleteMany()
    await prisma.asamalar.deleteMany()
    await prisma.urunler.deleteMany()
    await prisma.hizmetler.deleteMany()
    await prisma.urunHizmetGruplari.deleteMany()

    console.log('Mevcut veriler temizlendi')

    // Rolleri oluştur
    const adminRol = await prisma.roller.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        rolAdi: 'Admin',
        yetkiler: JSON.stringify(['*']),
      },
    })

    const temsilciRol = await prisma.roller.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        rolAdi: 'Müşteri Temsilcisi',
        yetkiler: JSON.stringify(['musteri.*', 'teklif.*', 'etkinlik.*', 'firsat.*']),
      },
    })

    console.log('Roller oluşturuldu')

    // Kullanıcıları oluştur
    const admin = await prisma.kullanicilar.upsert({
      where: { email: 'admin@example.com' },
      update: {
        sifreHash: await bcrypt.hash('admin123', 10),
      },
      create: {
        email: 'admin@example.com',
        ad: 'Admin',
        soyad: 'Kullanıcı',
        sifreHash: await bcrypt.hash('admin123', 10),
        rolId: adminRol.id,
      },
    })

    const temsilci1 = await prisma.kullanicilar.upsert({
      where: { email: 'mehmet.yilmaz@example.com' },
      update: {},
      create: {
        email: 'mehmet.yilmaz@example.com',
        ad: 'Mehmet',
        soyad: 'Yılmaz',
        sifreHash: await bcrypt.hash('temsilci123', 10),
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
        sifreHash: await bcrypt.hash('temsilci123', 10),
        rolId: temsilciRol.id,
      },
    })

    console.log('Kullanıcılar oluşturuldu')

    // Ürün gruplarını oluştur
    const yazilimGrubu = await prisma.urunHizmetGruplari.create({
      data: {
        grupTipi: 'URUN',
        grupKodu: 'YZL',
        grupAdi: 'Yazılım Ürünleri',
        aciklama: 'Her türlü yazılım ürünü',
        sira: 1,
      },
    })

    const donaninGrubu = await prisma.urunHizmetGruplari.create({
      data: {
        grupTipi: 'URUN',
        grupKodu: 'DNM',
        grupAdi: 'Donanım Ürünleri',
        aciklama: 'Her türlü donanım ürünü',
        sira: 2,
      },
    })

    const hizmetGrubu = await prisma.urunHizmetGruplari.create({
      data: {
        grupTipi: 'HIZMET',
        grupKodu: 'HZM',
        grupAdi: 'Yazılım Hizmetleri',
        aciklama: 'Yazılım geliştirme ve destek hizmetleri',
        sira: 1,
      },
    })

    console.log('Ürün ve hizmet grupları oluşturuldu')

    // Ürünleri oluştur
    const urun1 = await prisma.urunler.create({
      data: {
        urunKodu: 'CRM-001',
        urunAdi: 'CRM Yazılımı',
        grupId: yazilimGrubu.id,
        birim: 'ADET',
        birimFiyat: 50000,
        kdvOrani: 20,
        aciklama: 'Temel CRM modülleri dahil',
      },
    })

    const urun2 = await prisma.urunler.create({
      data: {
        urunKodu: 'SRV-001',
        urunAdi: 'Sunucu',
        grupId: donaninGrubu.id,
        birim: 'ADET',
        birimFiyat: 100000,
        kdvOrani: 20,
        aciklama: 'Yüksek performanslı sunucu',
      },
    })

    console.log('Ürünler oluşturuldu')

    // Hizmetleri oluştur
    const hizmet1 = await prisma.hizmetler.create({
      data: {
        hizmetKodu: 'YAZG-001',
        hizmetAdi: 'Yazılım Geliştirme',
        grupId: hizmetGrubu.id,
        birim: 'SAAT',
        birimFiyat: 1500,
        kdvOrani: 20,
        aciklama: 'Yazılım geliştirme hizmeti',
      },
    })

    const hizmet2 = await prisma.hizmetler.create({
      data: {
        hizmetKodu: 'EGT-001',
        hizmetAdi: 'Eğitim',
        grupId: hizmetGrubu.id,
        birim: 'GUN',
        birimFiyat: 10000,
        kdvOrani: 20,
        aciklama: 'Kullanıcı eğitimi',
      },
    })

    console.log('Hizmetler oluşturuldu')

    // Müşterileri oluştur
    const musteri1 = await prisma.musteriler.create({
      data: {
        musteriTipi: 'BIREYSEL',
        ad: 'Ali',
        soyad: 'Kaya',
        tcKimlik: '12345678901',
        telefon: '5551234567',
        email: 'ali.kaya@example.com',
        adres: 'Atatürk Cad. No:123 Kadıköy/İstanbul',
        kullaniciId: admin.id,
        temsilciId: temsilci1.id,
        ilgiliKisiler: {
          create: [
            {
              ad: 'Fatma',
              soyad: 'Kaya',
              unvan: 'Eş',
              telefon: '5551234568',
              email: 'fatma.kaya@example.com',
            },
          ],
        },
      },
    })

    const musteri2 = await prisma.musteriler.create({
      data: {
        musteriTipi: 'KURUMSAL',
        firmaAdi: 'Teknoloji A.Ş.',
        vergiDairesi: 'Kadıköy',
        vergiNo: '1234567890',
        telefon: '5559876543',
        email: 'info@teknoloji.com',
        adres: 'Bağdat Cad. No:456 Kadıköy/İstanbul',
        kullaniciId: admin.id,
        temsilciId: temsilci1.id,
        ilgiliKisiler: {
          create: [
            {
              ad: 'Ahmet',
              soyad: 'Öztürk',
              unvan: 'Genel Müdür',
              telefon: '5559876544',
              email: 'ahmet.ozturk@teknoloji.com',
            },
            {
              ad: 'Zeynep',
              soyad: 'Çelik',
              unvan: 'Finans Müdürü',
              telefon: '5559876545',
              email: 'zeynep.celik@teknoloji.com',
            },
          ],
        },
      },
    })

    const musteri3 = await prisma.musteriler.create({
      data: {
        musteriTipi: 'BIREYSEL',
        ad: 'Mehmet',
        soyad: 'Demir',
        tcKimlik: '98765432109',
        telefon: '5553334444',
        email: 'mehmet.demir@example.com',
        adres: 'İstiklal Cad. No:789 Beyoğlu/İstanbul',
        kullaniciId: admin.id,
        temsilciId: temsilci2.id,
      },
    })

    const musteri4 = await prisma.musteriler.create({
      data: {
        musteriTipi: 'KURUMSAL',
        firmaAdi: 'İnşaat Ltd. Şti.',
        vergiDairesi: 'Şişli',
        vergiNo: '9876543210',
        telefon: '5552223333',
        email: 'info@insaat.com',
        adres: 'Büyükdere Cad. No:101 Şişli/İstanbul',
        kullaniciId: admin.id,
        temsilciId: temsilci2.id,
        ilgiliKisiler: {
          create: [
            {
              ad: 'Mustafa',
              soyad: 'Yıldız',
              unvan: 'Şantiye Şefi',
              telefon: '5552223334',
              email: 'mustafa.yildiz@insaat.com',
            },
          ],
        },
      },
    })

    console.log('Müşteriler ve ilgili kişiler oluşturuldu')

    // Aşamaları oluştur
    const asama1 = await prisma.asamalar.create({
      data: {
        asamaAdi: 'İlk Görüşme',
        sira: 1,
      },
    })

    const asama2 = await prisma.asamalar.create({
      data: {
        asamaAdi: 'Teklif Hazırlama',
        sira: 2,
      },
    })

    const asama3 = await prisma.asamalar.create({
      data: {
        asamaAdi: 'Müşteri Değerlendirmesi',
        sira: 3,
      },
    })

    console.log('Aşamalar oluşturuldu')

    // Fırsatları oluştur
    const firsat1 = await prisma.firsatlar.create({
      data: {
        musteriId: musteri2.id,
        baslik: 'Yazılım Projesi',
        beklenenKapanisTarihi: new Date('2024-03-01'),
        asamaId: asama2.id,
        olasilik: 70,
      },
    })

    const firsat2 = await prisma.firsatlar.create({
      data: {
        musteriId: musteri4.id,
        baslik: 'İnşaat Projesi',
        beklenenKapanisTarihi: new Date('2024-04-01'),
        asamaId: asama1.id,
        olasilik: 50,
      },
    })

    console.log('Fırsatlar oluşturuldu')

    // Etkinlikleri oluştur
    const etkinlik1 = await prisma.etkinlikler.create({
      data: {
        musteriId: musteri2.id,
        etkinlikTipi: EtkinlikTipi.TOPLANTI,
        aciklama: 'Yeni projenin detaylarının görüşülmesi',
        baslangicTarihi: new Date('2024-02-01T10:00:00Z'),
        bitisTarihi: new Date('2024-02-01T12:00:00Z'),
        durum: 'TAMAMLANDI',
        oncelik: 'YUKSEK',
        kullaniciId: temsilci1.id,
      },
    })

    const etkinlik2 = await prisma.etkinlikler.create({
      data: {
        musteriId: musteri4.id,
        etkinlikTipi: EtkinlikTipi.MUSTERI_ZIYARET,
        aciklama: 'İnşaat alanının yerinde incelenmesi',
        baslangicTarihi: new Date('2024-02-05T14:00:00Z'),
        bitisTarihi: new Date('2024-02-05T16:00:00Z'),
        durum: 'PLANLANMIS',
        oncelik: 'NORMAL',
        kullaniciId: temsilci2.id,
      },
    })

    console.log('Etkinlikler oluşturuldu')

    // Teklifleri oluştur
    const teklif1 = await prisma.teklifler.create({
      data: {
        musteriId: musteri2.id,
        teklifNo: 'TKL-2024-001',
        baslik: 'Yazılım Geliştirme Projesi',
        aciklama: 'Web tabanlı CRM uygulaması geliştirme projesi',
        toplamTutar: 250000,
        paraBirimi: 'TRY',
        durum: 'HAZIRLANIYOR',
        sonGecerlilikTarihi: new Date('2024-02-15'),
        kullaniciId: temsilci1.id,
        notlar: 'Müşteri özel istekleri eklenecek',
        teklifKalemleri: {
          create: [
            {
              kalemTipi: 'URUN',
              urunId: urun1.id,
              miktar: 1,
              birim: 'ADET',
              birimFiyat: 200000,
              kdvOrani: 20,
              aciklama: 'Temel CRM modülleri dahil',
            },
            {
              kalemTipi: 'HIZMET',
              hizmetId: hizmet2.id,
              miktar: 5,
              birim: 'GUN',
              birimFiyat: 10000,
              kdvOrani: 20,
              aciklama: 'Yerinde eğitim ve 6 ay destek',
            },
          ],
        },
      },
    })

    console.log('Teklifler oluşturuldu')

    console.log('Seed işlemi başarıyla tamamlandı')
  } catch (error) {
    console.error('Seed işlemi sırasında hata oluştu:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  }) 