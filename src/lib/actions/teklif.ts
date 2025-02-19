"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { TeklifForm } from "../validations/teklif"
import { getUser } from "../auth"
import { Decimal } from "@prisma/client/runtime/library"

const prisma = new PrismaClient()

// Teklif numarası oluşturma fonksiyonu
export async function generateTeklifNo(musteriId: number) {
  try {
    // Müşterinin son teklifini bul
    const sonTeklif = await prisma.teklifler.findFirst({
      where: { musteriId },
      orderBy: { olusturmaTarihi: "desc" },
    })

    const yil = new Date().getFullYear()
    let siraNo = 1

    if (sonTeklif) {
      const sonTeklifNo = sonTeklif.teklifNo
      const match = sonTeklifNo.match(/TKL-(\d{4})-(\d+)/)
      if (match && match[1] === yil.toString()) {
        siraNo = parseInt(match[2]) + 1
      }
    }

    return `TKL-${yil}-${siraNo.toString().padStart(3, "0")}`
  } catch (error) {
    console.error("Teklif numarası oluşturulurken hata oluştu:", error)
    throw new Error("Teklif numarası oluşturulurken bir hata oluştu.")
  }
}

export async function getTeklifler() {
  try {
    const teklifler = await prisma.teklifler.findMany({
      include: {
        musteri: true,
        kullanici: true,
        teklifKalemleri: {
          include: {
            urun: true,
            hizmet: true,
          },
        },
      },
      orderBy: {
        olusturmaTarihi: "desc",
      },
    })
    return { teklifler }
  } catch (error) {
    console.error("Teklifler getirilirken hata oluştu:", error)
    return { error: "Teklifler getirilirken bir hata oluştu." }
  }
}

export async function getTeklif(id: number) {
  try {
    const teklif = await prisma.teklifler.findUnique({
      where: { id },
      include: {
        musteri: true,
        kullanici: true,
        teklifKalemleri: {
          include: {
            urun: true,
            hizmet: true,
          },
        },
      },
    })
    return { teklif }
  } catch (error) {
    console.error("Teklif getirilirken hata oluştu:", error)
    return { error: "Teklif getirilirken bir hata oluştu." }
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

type CreateTeklifInput = {
  teklifNo: string
  baslik: string
  musteriId: number
  aciklama?: string | null
  paraBirimi: string
  durum: string
  sonGecerlilikTarihi: string
  notlar?: string | null
  teklifKalemleri: {
    kalemTipi: "URUN" | "HIZMET"
    urunId?: number
    hizmetId?: number
    miktar: number
    birim: string
    birimFiyat: number
    kdvOrani: number
    aciklama?: string | null
  }[]
}

export async function createTeklif(data: CreateTeklifInput) {
  try {
    // Toplam tutarı hesapla
    let toplamTutar = new Decimal(0)
    for (const kalem of data.teklifKalemleri) {
      const tutar = new Decimal(kalem.birimFiyat).mul(kalem.miktar)
      toplamTutar = toplamTutar.add(tutar)
    }

    const teklif = await prisma.teklifler.create({
      data: {
        teklifNo: data.teklifNo,
        baslik: data.baslik,
        musteriId: data.musteriId,
        aciklama: data.aciklama,
        toplamTutar,
        paraBirimi: data.paraBirimi,
        durum: data.durum,
        sonGecerlilikTarihi: new Date(data.sonGecerlilikTarihi),
        notlar: data.notlar,
        kullaniciId: 1, // TODO: Gerçek kullanıcı ID'si kullanılacak
        teklifKalemleri: {
          create: data.teklifKalemleri.map(kalem => ({
            kalemTipi: kalem.kalemTipi,
            urunId: kalem.kalemTipi === "URUN" ? kalem.urunId : null,
            hizmetId: kalem.kalemTipi === "HIZMET" ? kalem.hizmetId : null,
            miktar: kalem.miktar,
            birim: kalem.birim,
            birimFiyat: new Decimal(kalem.birimFiyat),
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
    return { teklif }
  } catch (error) {
    console.error("Teklif oluşturulurken hata oluştu:", error)
    return { error: "Teklif oluşturulurken bir hata oluştu." }
  }
}

type UpdateTeklifInput = Partial<CreateTeklifInput>

export async function updateTeklif(id: number, data: UpdateTeklifInput) {
  try {
    // Önce mevcut teklif kalemlerini sil
    await prisma.teklifKalemleri.deleteMany({
      where: { teklifId: id },
    })

    // Toplam tutarı hesapla
    let toplamTutar = new Decimal(0)
    if (data.teklifKalemleri) {
      for (const kalem of data.teklifKalemleri) {
        const tutar = new Decimal(kalem.birimFiyat).mul(kalem.miktar)
        toplamTutar = toplamTutar.add(tutar)
      }
    }

    const teklif = await prisma.teklifler.update({
      where: { id },
      data: {
        ...(data.teklifNo && { teklifNo: data.teklifNo }),
        ...(data.baslik && { baslik: data.baslik }),
        ...(data.musteriId && { musteriId: data.musteriId }),
        aciklama: data.aciklama,
        ...(data.teklifKalemleri && { toplamTutar }),
        ...(data.paraBirimi && { paraBirimi: data.paraBirimi }),
        ...(data.durum && { durum: data.durum }),
        ...(data.sonGecerlilikTarihi && {
          sonGecerlilikTarihi: new Date(data.sonGecerlilikTarihi),
        }),
        notlar: data.notlar,
        ...(data.teklifKalemleri && {
          teklifKalemleri: {
            create: data.teklifKalemleri.map(kalem => ({
              kalemTipi: kalem.kalemTipi,
              urunId: kalem.kalemTipi === "URUN" ? kalem.urunId : null,
              hizmetId: kalem.kalemTipi === "HIZMET" ? kalem.hizmetId : null,
              miktar: kalem.miktar,
              birim: kalem.birim,
              birimFiyat: new Decimal(kalem.birimFiyat),
              kdvOrani: kalem.kdvOrani,
              aciklama: kalem.aciklama,
            })),
          },
        }),
      },
      include: {
        teklifKalemleri: true,
      },
    })

    revalidatePath("/teklifler")
    return { teklif }
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
    return { teklif }
  } catch (error) {
    console.error("Teklif silinirken hata oluştu:", error)
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