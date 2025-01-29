"use server"

import { PrismaClient } from "@prisma/client"
import type { RaporFiltre } from "../validations/rapor"

const prisma = new PrismaClient()

export async function getMusteriAktiviteRaporu(filtre: RaporFiltre) {
  try {
    const etkinlikler = await prisma.etkinlikler.findMany({
      where: {
        musteriId: filtre.musteriId,
        baslangicTarihi: {
          gte: new Date(filtre.baslangicTarihi),
          lte: new Date(filtre.bitisTarihi),
        },
      },
      include: {
        musteri: true,
        kullanici: true,
      },
      orderBy: {
        baslangicTarihi: "asc",
      },
    })

    const firsatlar = await prisma.firsatlar.findMany({
      where: {
        musteriId: filtre.musteriId,
        beklenenKapanisTarihi: {
          gte: new Date(filtre.baslangicTarihi),
          lte: new Date(filtre.bitisTarihi),
        },
      },
      include: {
        musteri: true,
        asama: true,
      },
      orderBy: {
        beklenenKapanisTarihi: "asc",
      },
    })

    return { etkinlikler, firsatlar }
  } catch (error) {
    return { error: "Müşteri aktivite raporu oluşturulurken bir hata oluştu." }
  }
}

export async function getSatisPerformansRaporu(filtre: RaporFiltre) {
  try {
    const teklifler = await prisma.teklifler.findMany({
      where: {
        kullaniciId: filtre.kullaniciId,
        olusturmaTarihi: {
          gte: new Date(filtre.baslangicTarihi),
          lte: new Date(filtre.bitisTarihi),
        },
      },
      include: {
        musteri: true,
        kullanici: true,
      },
      orderBy: {
        olusturmaTarihi: "asc",
      },
    })

    const firsatlar = await prisma.firsatlar.findMany({
      where: {
        beklenenKapanisTarihi: {
          gte: new Date(filtre.baslangicTarihi),
          lte: new Date(filtre.bitisTarihi),
        },
        asama: {
          asamaAdi: {
            in: ["Kazanıldı", "Kaybedildi"],
          },
        },
      },
      include: {
        musteri: true,
        asama: true,
      },
      orderBy: {
        beklenenKapanisTarihi: "asc",
      },
    })

    return { teklifler, firsatlar }
  } catch (error) {
    return { error: "Satış performans raporu oluşturulurken bir hata oluştu." }
  }
}

export async function getFirsatDurumRaporu(filtre: RaporFiltre) {
  try {
    const firsatlar = await prisma.firsatlar.findMany({
      where: {
        beklenenKapanisTarihi: {
          gte: new Date(filtre.baslangicTarihi),
          lte: new Date(filtre.bitisTarihi),
        },
      },
      include: {
        musteri: true,
        asama: true,
      },
      orderBy: [
        {
          asama: {
            sira: "asc",
          },
        },
        {
          beklenenKapanisTarihi: "asc",
        },
      ],
    })

    // Aşamalara göre grupla
    const asamalar = await prisma.asamalar.findMany({
      orderBy: {
        sira: "asc",
      },
    })

    const asamaGruplari = asamalar.map(asama => ({
      ...asama,
      firsatlar: firsatlar.filter(f => f.asamaId === asama.id),
      toplamDeger: firsatlar
        .filter(f => f.asamaId === asama.id)
        .reduce((total, f) => total + f.olasilik.toNumber(), 0),
    }))

    return { asamaGruplari }
  } catch (error) {
    return { error: "Fırsat durum raporu oluşturulurken bir hata oluştu." }
  }
}

export async function getTeklifAnalizRaporu(filtre: RaporFiltre) {
  try {
    const teklifler = await prisma.teklifler.findMany({
      where: {
        olusturmaTarihi: {
          gte: new Date(filtre.baslangicTarihi),
          lte: new Date(filtre.bitisTarihi),
        },
      },
      include: {
        musteri: true,
        kullanici: true,
        teklifKalemleri: true,
      },
      orderBy: {
        olusturmaTarihi: "asc",
      },
    })

    // Durumlara göre grupla
    const durumGruplari = teklifler.reduce((acc, teklif) => {
      const durum = teklif.durum
      if (!acc[durum]) {
        acc[durum] = {
          durum,
          teklifler: [],
          toplamTutar: 0,
          ortalamaTutar: 0,
        }
      }
      acc[durum].teklifler.push(teklif)
      acc[durum].toplamTutar += teklif.toplamTutar.toNumber()
      acc[durum].ortalamaTutar = acc[durum].toplamTutar / acc[durum].teklifler.length
      return acc
    }, {} as Record<string, any>)

    return { durumGruplari }
  } catch (error) {
    return { error: "Teklif analiz raporu oluşturulurken bir hata oluştu." }
  }
} 