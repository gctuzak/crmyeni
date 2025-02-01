"use server"

import { PrismaClient } from "@prisma/client"
import { getUser } from "./auth"

const prisma = new PrismaClient()

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
      prisma.etkinlikler.groupBy({
        by: ["etkinlikTipi"],
        _count: true,
        where: {
          baslangicTarihi: {
            gte: birHaftaOnce,
            lte: simdi
          }
        }
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

    return {
      musteriSayisi,
      bekleyenEtkinlikSayisi,
      tamamlananEtkinlikSayisi,
      sonEtkinlikler,
      yaklasanEtkinlikler,
      sonTeklifler,
      etkinlikDagilimi: etkinlikDagilimi.map(item => ({
        name: item.etkinlikTipi.replace(/_/g, " "),
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