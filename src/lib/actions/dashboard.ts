"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { decimalToNumber } from "@/lib/utils"
import { Decimal } from "@prisma/client/runtime/library"

interface Firsat {
  id: number
  olasilik: number | Decimal
  asama: {
    id: number
    asamaAdi: string
  }
}

interface Teklif {
  id: number
  toplamTutar: number | Decimal
}

interface Asama {
  id: number
  asamaAdi: string
}

export async function getDashboardData() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    const simdi = new Date()
    const birAyOnce = new Date(simdi.getFullYear(), simdi.getMonth() - 1, simdi.getDate())
    const birHaftaOnce = new Date(simdi.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Toplam müşteri sayısı
    const toplamMusteri = await prisma.musteriler.count()

    // Geçen aydan bu yana yeni müşteri sayısı
    const yeniMusteriSayisi = await prisma.musteriler.count({
      where: {
        kayitTarihi: {
          gte: birAyOnce
        }
      }
    })

    // Açık fırsatlar
    const acikFirsatlar = await prisma.firsatlar.findMany({
      where: {
        asamaId: {
          not: 8 // Kaybedildi aşaması hariç
        }
      },
      include: {
        asama: true
      }
    })

    // Bekleyen teklifler
    const bekleyenTeklifler = await prisma.teklifler.findMany({
      where: {
        durum: {
          in: ["TASLAK", "HAZIRLANIYOR", "GONDERILDI"]
        }
      }
    })

    // Planlı etkinlikler
    const planliEtkinlikler = await prisma.etkinlikler.count({
      where: {
        baslangicTarihi: {
          gte: simdi
        },
        durum: {
          in: ["BEKLIYOR", "DEVAM_EDIYOR"]
        }
      }
    })

    // Bu haftaki etkinlikler
    const buHaftakiEtkinlikler = await prisma.etkinlikler.count({
      where: {
        baslangicTarihi: {
          gte: simdi,
          lte: new Date(simdi.getTime() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    // Tamamlanan etkinlikler
    const tamamlananEtkinlikler = await prisma.etkinlikler.count({
      where: {
        durum: "TAMAMLANDI",
        baslangicTarihi: {
          gte: birHaftaOnce,
          lte: simdi
        }
      }
    })

    // Toplam fırsat tutarı
    const toplamFirsatTutari = acikFirsatlar.reduce((total: number, firsat: any) => {
      return total + decimalToNumber(firsat.olasilik)
    }, 0)

    // Toplam teklif tutarı
    const toplamTeklifTutari = bekleyenTeklifler.reduce((total: number, teklif: any) => {
      return total + decimalToNumber(teklif.toplamTutar)
    }, 0)

    // Satış performansı (son 12 ay)
    const aylar = []
    for (let i = 11; i >= 0; i--) {
      const baslangic = new Date(simdi.getFullYear(), simdi.getMonth() - i, 1)
      const bitis = new Date(simdi.getFullYear(), simdi.getMonth() - i + 1, 0)
      
      const aylikTeklifler = await prisma.teklifler.aggregate({
        where: {
          olusturmaTarihi: {
            gte: baslangic,
            lte: bitis
          },
          durum: "ONAYLANDI"
        },
        _sum: {
          toplamTutar: true
        }
      })

      aylar.push({
        name: baslangic.toLocaleString('tr-TR', { month: 'short' }),
        total: decimalToNumber(aylikTeklifler._sum.toplamTutar)
      })
    }

    // Satış hunisi (fırsat aşamaları)
    const asamalar = await prisma.asamalar.findMany({
      orderBy: {
        sira: 'asc'
      }
    })

    const firsatAsamalari = await Promise.all(
      asamalar.map(async (asama: Asama) => {
        const firsatSayisi = await prisma.firsatlar.count({
          where: {
            asamaId: asama.id
          }
        })

        return {
          name: asama.asamaAdi,
          value: firsatSayisi
        }
      })
    )

    return {
      data: {
        toplamMusteri,
        yeniMusteriSayisi,
        acikFirsatlar: acikFirsatlar.length,
        toplamFirsatTutari,
        bekleyenTeklifler: bekleyenTeklifler.length,
        toplamTeklifTutari,
        planliEtkinlikler,
        buHaftakiEtkinlikler,
        tamamlananEtkinlikler,
        satisPerformansi: aylar,
        firsatAsamalari
      }
    }
  } catch (error) {
    console.error("Dashboard verileri yüklenirken hata oluştu:", error)
    return { error: "Dashboard verileri yüklenirken bir hata oluştu." }
  }
} 