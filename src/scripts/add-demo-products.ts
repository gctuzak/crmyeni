 
import { PrismaClient } from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/library"

const prisma = new PrismaClient()

// Demo ürün kategorileri
const demoKategoriler = [
  { isim: "Elektronik", kod: "ELKT" },
  { isim: "Ofis Malzemeleri", kod: "OFIS" },
  { isim: "Yazılım", kod: "YZL" },
  { isim: "Donanım", kod: "DNM" }
]

// Demo birimler
const demoBirimler = ["Adet", "Kutu", "Paket", "Lisans", "Metre"]

// Demo ürün isimleri ve açıklamaları
const demoUrunler = [
  { isim: "Dizüstü Bilgisayar", aciklama: "Yüksek performanslı iş bilgisayarı", kategori: "ELKT" },
  { isim: "Masaüstü Bilgisayar", aciklama: "Güçlü işlemci, geniş depolama", kategori: "ELKT" },
  { isim: "Monitör 24\"", aciklama: "Full HD IPS panel monitör", kategori: "ELKT" },
  { isim: "Tablet", aciklama: "Taşınabilir dokunmatik ekranlı cihaz", kategori: "ELKT" },
  { isim: "Klavye", aciklama: "Ergonomik mekanik klavye", kategori: "ELKT" },
  { isim: "Mouse", aciklama: "Kablosuz optik mouse", kategori: "ELKT" },
  { isim: "A4 Kağıt", aciklama: "500 sayfalık A4 kağıt paketi", kategori: "OFIS" },
  { isim: "Kalem Seti", aciklama: "12'li tükenmez kalem seti", kategori: "OFIS" },
  { isim: "Dosya Dolabı", aciklama: "Metal 4 çekmeceli dolap", kategori: "OFIS" },
  { isim: "Zımba", aciklama: "Orta boy zımba makinesi", kategori: "OFIS" },
  { isim: "Hesap Makinesi", aciklama: "Bilimsel hesap makinesi", kategori: "OFIS" },
  { isim: "Windows Lisans", aciklama: "Windows 11 Pro lisansı", kategori: "YZL" },
  { isim: "Office Paketi", aciklama: "Microsoft Office 365 yıllık abonelik", kategori: "YZL" },
  { isim: "Antivirüs", aciklama: "1 yıllık antivirüs yazılımı", kategori: "YZL" },
  { isim: "CAD Yazılımı", aciklama: "Mühendislik tasarım yazılımı", kategori: "YZL" },
  { isim: "RAM Bellek", aciklama: "16GB DDR4 RAM", kategori: "DNM" },
  { isim: "SSD Disk", aciklama: "500GB SSD disk", kategori: "DNM" },
  { isim: "Harici HDD", aciklama: "2TB taşınabilir disk", kategori: "DNM" },
  { isim: "Router", aciklama: "Kablosuz ağ yönlendiricisi", kategori: "DNM" },
  { isim: "Yazıcı", aciklama: "Renkli lazer yazıcı", kategori: "DNM" }
]

// KDV oranları
const kdvOranlari = [0, 1, 8, 18]

async function main() {
  console.log("Demo ürünler ekleniyor...")

  // Önce mevcut ürün gruplarını kontrol edelim
  const mevcutGruplar = await prisma.urunHizmetGruplari.findMany({
    where: {
      grupTipi: "URUN"
    }
  })

  let gruplar = []

  // Eğer hiç grup yoksa, demo grupları ekleyelim
  if (mevcutGruplar.length === 0) {
    console.log("Ürün grupları oluşturuluyor...")
    
    for (let i = 0; i < demoKategoriler.length; i++) {
      const kategori = demoKategoriler[i]
      
      const yeniGrup = await prisma.urunHizmetGruplari.create({
        data: {
          grupTipi: "URUN",
          grupKodu: kategori.kod,
          grupAdi: kategori.isim,
          aciklama: `${kategori.isim} kategorisi`,
          aktif: true,
          sira: i + 1
        }
      })
      
      gruplar.push(yeniGrup)
      console.log(`Grup oluşturuldu: ${yeniGrup.grupAdi}`)
    }
  } else {
    console.log("Mevcut gruplar kullanılacak")
    gruplar = mevcutGruplar
  }

  // Ürünleri ekleyelim
  for (let i = 0; i < demoUrunler.length; i++) {
    const urun = demoUrunler[i]
    
    // Kategoriye göre grup ID'sini bulalım
    const grupId = gruplar.find(g => g.grupKodu === urun.kategori)?.id || gruplar[0].id
    
    // Rastgele bir birim seçelim
    const birim = demoBirimler[Math.floor(Math.random() * demoBirimler.length)]
    
    // Rastgele fiyat oluşturalım (100-10000 arası)
    const fiyat = (Math.floor(Math.random() * 9900) + 100) / 100
    
    // Rastgele KDV oranı seçelim
    const kdvOrani = kdvOranlari[Math.floor(Math.random() * kdvOranlari.length)]
    
    // Ürün kodunu oluşturalım
    const urunKodu = `${urun.kategori}-${(i + 1).toString().padStart(3, '0')}`
    
    try {
      const yeniUrun = await prisma.urunler.create({
        data: {
          urunKodu,
          urunAdi: urun.isim,
          grupId,
          birim,
          birimFiyat: new Decimal(fiyat),
          kdvOrani,
          aciklama: urun.aciklama,
          aktif: true
        }
      })
      
      console.log(`Ürün eklendi: ${yeniUrun.urunAdi} (${urunKodu}) - ${fiyat} TL`)
    } catch (error) {
      console.error(`Ürün eklenirken hata oluştu: ${urun.isim}`, error)
    }
  }

  console.log("Demo ürünler başarıyla eklendi!")
}

main()
  .catch(e => {
    console.error("Hata:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })