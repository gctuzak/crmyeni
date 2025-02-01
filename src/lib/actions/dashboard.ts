"use server"

import { PrismaClient } from "@prisma/client"
import { getUser } from "./auth"

const prisma = new PrismaClient()

const etkinlikTipiCevirileri: { [key: string]: string } = {
  CARI_HESAP_BILGILERI: "Cari Hesap Bilgileri",
  FATURA_KESILECEK: "Fatura Kesilecek",
  GELEN_EPOSTA: "Gelen E-posta",
  GIDEN_EPOSTA: "Giden E-posta",
  IMALAT: "İmalat",
  ISEMRI_OLUSTURULACAK: "İşemri Oluşturulacak",
  KESIF: "Keşif",
  MONTAJ: "Montaj",
  MUSTERI_ZIYARET: "Müşteri Ziyaret",
  NUMUNE_GONDERIMI: "Numune Gönderimi",
  PRIM_HAKEDISI: "Prim Hakedişi",
  PROJE_CIZIM: "Proje Çizim",
  PROJE_INCELEME: "Proje İnceleme",
  SEVKIYAT: "Sevkiyat",
  SIKAYET_ARIZA_SERVIS: "Şikayet/Arıza/Servis",
  TAHSILAT_TAKIBI: "Tahsilat Takibi",
  TEKLIF_DURUM_TAKIBI: "Teklif Durum Takibi",
  TEKLIF_GONDERIM_ONAYI: "Teklif Gönderim Onayı",
  TEKLIF_ONAY_TALEBI: "Teklif Onay Talebi",
  TEKLIF_VERILECEK: "Teklif Verilecek",
  TEKNIK_SERVIS: "Teknik Servis",
  TELEFON_GORUSMESI: "Telefon Görüşmesi",
  TOPLANTI: "Toplantı",
  TOPLU_EPOSTA: "Toplu E-posta"
}

export async function getDashboardData() {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    // Son 7 gündeki etkinlikleri getir
    const simdi = new Date()
    const birHaftaOnce = new Date(simdi.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      musteriSayisi,
      bekleyenEtkinlikSayisi,
      tamamlananEtkinlikSayisi,
      sonEtkinlikler,
      yaklasanEtkinlikler,
      sonTekliflerRaw,
      etkinlikDagilimi,
      musteriTipiDagilimi
    ] = await Promise.all([
      // Toplam müşteri sayısı
      prisma.musteriler.count(),

      // Bekleyen etkinlik sayısı
      prisma.etkinlikler.count({
        where: {
          durum: "BEKLIYOR"
        }
      }),

      // Tamamlanan etkinlik sayısı (son 7 gün)
      prisma.etkinlikler.count({
        where: {
          durum: "TAMAMLANDI",
          baslangicTarihi: {
            gte: birHaftaOnce,
            lte: simdi
          }
        }
      }),

      // Son etkinlikler
      prisma.etkinlikler.findMany({
        take: 5,
        orderBy: {
          baslangicTarihi: "desc"
        },
        include: {
          musteri: true,
          ilgiliKisi: {
            select: {
              id: true,
              ad: true,
              soyad: true,
              unvan: true
            }
          },
          kullanici: {
            select: {
              id: true,
              ad: true,
              soyad: true
            }
          }
        }
      }),

      // Yaklaşan etkinlikler
      prisma.etkinlikler.findMany({
        where: {
          baslangicTarihi: {
            gte: simdi
          },
          durum: "BEKLIYOR"
        },
        take: 5,
        orderBy: {
          baslangicTarihi: "asc"
        },
        include: {
          musteri: true,
          ilgiliKisi: {
            select: {
              id: true,
              ad: true,
              soyad: true,
              unvan: true
            }
          },
          kullanici: {
            select: {
              id: true,
              ad: true,
              soyad: true
            }
          }
        }
      }),

      // Son teklifler
      prisma.teklifler.findMany({
        take: 5,
        orderBy: {
          olusturmaTarihi: "desc"
        },
        include: {
          musteri: true,
          kullanici: {
            select: {
              id: true,
              ad: true,
              soyad: true
            }
          }
        }
      }),

      // Etkinlik tipi dağılımı
      prisma.etkinlikler.findMany({
        select: {
          etkinlikTipi: true
        }
      }).then(etkinlikler => {
        const dagilim: { [key: string]: number } = {}
        etkinlikler.forEach(etkinlik => {
          const tip = etkinlik.etkinlikTipi
          dagilim[tip] = (dagilim[tip] || 0) + 1
        })
        return Object.entries(dagilim).map(([tip, sayi]) => ({
          etkinlikTipi: tip,
          _count: sayi
        }))
      }),

      // Müşteri tipi dağılımı
      prisma.musteriler.groupBy({
        by: ["musteriTipi"],
        _count: true
      })
    ])

    // Decimal değerleri number'a dönüştür
    const sonTeklifler = sonTekliflerRaw.map(teklif => ({
      ...teklif,
      toplamTutar: Number(teklif.toplamTutar)
    }))

    console.log("Etkinlik dağılımı:", etkinlikDagilimi) // Debug için

    return {
      musteriSayisi,
      bekleyenEtkinlikSayisi,
      tamamlananEtkinlikSayisi,
      sonEtkinlikler,
      yaklasanEtkinlikler,
      sonTeklifler,
      etkinlikDagilimi: etkinlikDagilimi.map(item => ({
        name: etkinlikTipiCevirileri[item.etkinlikTipi] || item.etkinlikTipi,
        value: item._count
      })),
      musteriTipiDagilimi: musteriTipiDagilimi.map(item => ({
        name: item.musteriTipi === "BIREYSEL" ? "Bireysel" : "Kurumsal",
        value: item._count
      }))
    }
  } catch (error) {
    console.error("Dashboard verileri yüklenirken hata oluştu:", error)
    return { error: "Dashboard verileri yüklenirken bir hata oluştu." }
  }
} 