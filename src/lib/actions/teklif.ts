"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { TeklifForm } from "../validations/teklif"
import { getUser } from "../auth"

const prisma = new PrismaClient()

// Teklif numarası oluşturma fonksiyonu
export async function generateTeklifNo(musteriId: number) {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")

  // O ay içindeki son teklif numarasını bul
  const lastTeklif = await prisma.teklifler.findFirst({
    where: {
      musteriId,
      teklifNo: {
        startsWith: `${year}${month}-`,
      },
    },
    orderBy: {
      teklifNo: "desc",
    },
  })

  let sequence = 1
  if (lastTeklif) {
    const lastSequence = parseInt(lastTeklif.teklifNo.split("-")[1])
    sequence = lastSequence + 1
  }

  return `${year}${month}-${String(sequence).padStart(3, "0")}`
}

export async function getTeklifler() {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    const teklifler = await prisma.teklifler.findMany({
      include: {
        musteri: {
          include: {
            ilgiliKisiler: true,
          },
        },
        kullanici: {
          select: {
            id: true,
            ad: true,
            soyad: true,
          },
        },
        teklifKalemleri: true,
      },
      orderBy: {
        olusturmaTarihi: "desc",
      },
    })

    return { teklifler }
  } catch (error) {
    console.error("Teklifler yüklenirken hata oluştu:", error)
    return { error: "Teklifler yüklenirken bir hata oluştu." }
  }
}

export async function getTeklif(id: number) {
  try {
    const teklif = await prisma.teklifler.findUnique({
      where: { id },
      include: {
        musteri: {
          include: {
            ilgiliKisiler: true,
          },
        },
        kullanici: {
          select: {
            id: true,
            ad: true,
            soyad: true,
          },
        },
        teklifKalemleri: true,
      },
    })

    if (!teklif) {
      return { error: "Teklif bulunamadı." }
    }

    return { teklif }
  } catch (error) {
    return { error: "Teklif bilgileri yüklenirken bir hata oluştu." }
  }
}

export async function getMusteriTeklifleri(musteriId: number) {
  try {
    const teklifler = await prisma.teklifler.findMany({
      where: { musteriId },
      include: {
        kullanici: true,
        teklifKalemleri: true,
      },
      orderBy: {
        olusturmaTarihi: "desc",
      },
    })

    // Decimal değerleri number'a dönüştür
    const formattedTeklifler = teklifler.map(teklif => ({
      ...teklif,
      toplamTutar: Number(teklif.toplamTutar),
      teklifKalemleri: teklif.teklifKalemleri.map(kalem => ({
        ...kalem,
        birimFiyat: Number(kalem.birimFiyat)
      }))
    }))

    return { teklifler: formattedTeklifler }
  } catch (error) {
    return { error: "Müşteri teklifleri yüklenirken bir hata oluştu." }
  }
}

export async function createTeklif(data: TeklifForm) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    // Teklif numarası oluştur
    const teklifNo = await generateTeklifNo(data.musteriId)

    // Toplam tutarı hesapla
    const toplamTutar = data.teklifKalemleri.reduce((total, kalem) => {
      const kdvliTutar = kalem.birimFiyat * kalem.miktar * (1 + kalem.kdvOrani / 100)
      return total + kdvliTutar
    }, 0)

    const teklif = await prisma.teklifler.create({
      data: {
        musteriId: data.musteriId,
        teklifNo,
        baslik: data.baslik,
        aciklama: data.aciklama,
        toplamTutar,
        paraBirimi: data.paraBirimi,
        durum: data.durum,
        olusturmaTarihi: new Date(),
        sonGecerlilikTarihi: data.sonGecerlilikTarihi,
        kullaniciId: user.id,
        revizyon: 1,
        notlar: data.notlar,
        teklifKalemleri: {
          create: data.teklifKalemleri,
        },
      },
      include: {
        teklifKalemleri: true,
      },
    })

    revalidatePath("/teklifler")
    return { teklif }
  } catch (error) {
    console.error("Teklif oluşturulurken hata oluştu:", error)
    return { error: "Teklif oluşturulurken bir hata oluştu." }
  }
}

export async function updateTeklif(id: number, data: TeklifForm) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    // Mevcut teklifi bul
    const mevcutTeklif = await prisma.teklifler.findUnique({
      where: { id },
      include: {
        teklifKalemleri: true,
      },
    })

    if (!mevcutTeklif) {
      return { error: "Teklif bulunamadı." }
    }

    // Toplam tutarı hesapla
    const toplamTutar = data.teklifKalemleri.reduce((total, kalem) => {
      const kdvliTutar = kalem.birimFiyat * kalem.miktar * (1 + kalem.kdvOrani / 100)
      return total + kdvliTutar
    }, 0)

    // Eski teklifi arşivle
    await prisma.teklifler.update({
      where: { id },
      data: {
        durum: "ARSIV",
      },
    })

    // Yeni revizyon oluştur
    const yeniTeklif = await prisma.teklifler.create({
      data: {
        musteriId: data.musteriId,
        teklifNo: `${mevcutTeklif.teklifNo}-R${mevcutTeklif.revizyon + 1}`,
        baslik: data.baslik,
        aciklama: data.aciklama,
        toplamTutar,
        paraBirimi: data.paraBirimi,
        durum: data.durum,
        olusturmaTarihi: new Date(),
        sonGecerlilikTarihi: data.sonGecerlilikTarihi,
        kullaniciId: user.id,
        revizyon: mevcutTeklif.revizyon + 1,
        notlar: data.notlar,
        teklifKalemleri: {
          create: data.teklifKalemleri,
        },
      },
      include: {
        teklifKalemleri: true,
      },
    })

    revalidatePath("/teklifler")
    revalidatePath(`/teklifler/${id}`)
    return { teklif: yeniTeklif }
  } catch (error) {
    console.error("Teklif güncellenirken hata oluştu:", error)
    return { error: "Teklif güncellenirken bir hata oluştu." }
  }
}

export async function deleteTeklif(id: number) {
  try {
    const teklif = await prisma.teklifler.delete({
      where: { id },
    })
    revalidatePath("/teklifler")
    revalidatePath(`/musteriler/${teklif.musteriId}`)
    return { success: true }
  } catch (error) {
    return { error: "Teklif silinirken bir hata oluştu." }
  }
}

export async function updateTeklifDurumu(id: number, durum: string) {
  try {
    const teklif = await prisma.teklifler.update({
      where: { id },
      data: { durum },
    })
    revalidatePath("/teklifler")
    revalidatePath(`/musteriler/${teklif.musteriId}`)
    revalidatePath(`/teklifler/${id}`)
    return { success: true }
  } catch (error) {
    return { error: "Teklif durumu güncellenirken bir hata oluştu." }
  }
}

export async function searchMusteriler(query: string) {
  try {
    if (query.length < 2) {
      return { musteriler: [] }
    }

    const musteriler = await prisma.musteriler.findMany({
      where: {
        OR: [
          // Bireysel müşteri araması
          {
            AND: [
              { musteriTipi: "BIREYSEL" },
              {
                OR: [
                  { ad: { contains: query, mode: 'insensitive' } },
                  { soyad: { contains: query, mode: 'insensitive' } },
                ],
              },
            ],
          },
          // Kurumsal müşteri araması
          {
            AND: [
              { musteriTipi: "KURUMSAL" },
              { firmaAdi: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      include: {
        ilgiliKisiler: true,
      },
      take: 5,
    })

    return { musteriler }
  } catch (error) {
    console.error("Müşteri araması yapılırken hata oluştu:", error)
    return { error: "Müşteri araması yapılırken bir hata oluştu." }
  }
} 