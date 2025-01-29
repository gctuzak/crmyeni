"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import type { TeklifForm } from "../validations/teklif"

const prisma = new PrismaClient()

// Teklif numarası oluşturma fonksiyonu
async function generateTeklifNo() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  
  // Bu ay içindeki son teklif numarasını bul
  const lastTeklif = await prisma.teklifler.findFirst({
    where: {
      teklifNo: {
        startsWith: `TKF-${year}${month}`,
      },
    },
    orderBy: {
      teklifNo: "desc",
    },
  })

  let sequence = 1
  if (lastTeklif) {
    const lastSequence = parseInt(lastTeklif.teklifNo.split("-")[2])
    sequence = lastSequence + 1
  }

  return `TKF-${year}${month}-${String(sequence).padStart(4, "0")}`
}

export async function getTeklifler() {
  try {
    const teklifler = await prisma.teklifler.findMany({
      include: {
        musteri: true,
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
    return { error: "Teklifler yüklenirken bir hata oluştu." }
  }
}

export async function getTeklif(id: number) {
  try {
    const teklif = await prisma.teklifler.findUnique({
      where: { id },
      include: {
        musteri: true,
        kullanici: true,
        teklifKalemleri: true,
      },
    })

    if (!teklif) {
      return { error: "Teklif bulunamadı." }
    }

    // Decimal değerleri number'a dönüştür
    const formattedTeklif = {
      ...teklif,
      toplamTutar: Number(teklif.toplamTutar),
      teklifKalemleri: teklif.teklifKalemleri.map(kalem => ({
        ...kalem,
        birimFiyat: Number(kalem.birimFiyat)
      }))
    }

    return { teklif: formattedTeklif }
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
    // Toplam tutarı hesapla
    const toplamTutar = data.teklifKalemleri.reduce((total, kalem) => {
      const kdvliTutar = kalem.birimFiyat * kalem.miktar * (1 + kalem.kdvOrani / 100)
      return total + kdvliTutar
    }, 0)

    const teklif = await prisma.teklifler.create({
      data: {
        musteriId: data.musteriId,
        teklifNo: await generateTeklifNo(),
        baslik: data.baslik,
        aciklama: data.aciklama,
        toplamTutar,
        paraBirimi: data.paraBirimi,
        durum: "Taslak",
        sonGecerlilikTarihi: new Date(data.sonGecerlilikTarihi),
        kullaniciId: data.kullaniciId,
        notlar: data.notlar,
        teklifKalemleri: {
          create: data.teklifKalemleri.map(kalem => ({
            urunAdi: kalem.urunAdi,
            miktar: kalem.miktar,
            birim: kalem.birim,
            birimFiyat: kalem.birimFiyat,
            kdvOrani: kalem.kdvOrani,
            aciklama: kalem.aciklama,
          })),
        },
      },
      include: {
        teklifKalemleri: true,
      },
    })

    revalidatePath("/teklifler")
    revalidatePath(`/musteriler/${data.musteriId}`)
    return { teklif }
  } catch (error) {
    return { error: "Teklif oluşturulurken bir hata oluştu." }
  }
}

export async function updateTeklif(id: number, data: TeklifForm) {
  try {
    // Toplam tutarı hesapla
    const toplamTutar = data.teklifKalemleri.reduce((total, kalem) => {
      const kdvliTutar = kalem.birimFiyat * kalem.miktar * (1 + kalem.kdvOrani / 100)
      return total + kdvliTutar
    }, 0)

    // Önce mevcut kalemleri sil
    await prisma.teklifKalemleri.deleteMany({
      where: { teklifId: id },
    })

    // Teklifi güncelle ve yeni kalemleri ekle
    const teklif = await prisma.teklifler.update({
      where: { id },
      data: {
        musteriId: data.musteriId,
        baslik: data.baslik,
        aciklama: data.aciklama,
        toplamTutar,
        paraBirimi: data.paraBirimi,
        sonGecerlilikTarihi: new Date(data.sonGecerlilikTarihi),
        kullaniciId: data.kullaniciId,
        notlar: data.notlar,
        revizyon: {
          increment: 1,
        },
        teklifKalemleri: {
          create: data.teklifKalemleri.map(kalem => ({
            urunAdi: kalem.urunAdi,
            miktar: kalem.miktar,
            birim: kalem.birim,
            birimFiyat: kalem.birimFiyat,
            kdvOrani: kalem.kdvOrani,
            aciklama: kalem.aciklama,
          })),
        },
      },
      include: {
        teklifKalemleri: true,
      },
    })

    revalidatePath("/teklifler")
    revalidatePath(`/musteriler/${data.musteriId}`)
    revalidatePath(`/teklifler/${id}`)
    return { teklif }
  } catch (error) {
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