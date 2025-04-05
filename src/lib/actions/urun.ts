"use server"

import { revalidatePath } from "next/cache"
import { PrismaClient, UrunHizmetGruplari, Urunler } from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/library"
import { prisma } from "@/lib/prisma"
import { ApiUrun, ApiHizmet } from "@/lib/types"
import { DatabaseError, NotFoundError, tryCatch } from "@/lib/error"
import { serializable } from "@/lib/utils"

export async function getUrunHizmetGruplari() {
  try {
    const gruplar = await prisma.urunHizmetGruplari.findMany({
      orderBy: [
        {
          sira: "asc",
        },
      ],
      where: {
        grupTipi: "URUN",
      },
    })
    return { gruplar }
  } catch (error) {
    console.error("Gruplar getirilirken hata oluştu:", error)
    return { error: "Gruplar getirilirken bir hata oluştu." }
  }
}

export async function getUrunHizmetGrubu(id: number) {
  try {
    const grup = await prisma.urunHizmetGruplari.findUnique({
      where: { id },
    })
    return { grup }
  } catch (error) {
    console.error("Grup getirilirken hata oluştu:", error)
    return { error: "Grup getirilirken bir hata oluştu." }
  }
}

type CreateGrupInput = {
  grupTipi: string
  grupKodu: string
  grupAdi: string
  aciklama?: string | null
  aktif?: boolean
  sira: number
  ustGrupId?: number | null
}

export async function createUrunHizmetGrubu(data: CreateGrupInput) {
  try {
    const grup = await prisma.urunHizmetGruplari.create({
      data,
    })
    return { grup }
  } catch (error) {
    console.error("Grup oluşturulurken hata oluştu:", error)
    return { error: "Grup oluşturulurken bir hata oluştu." }
  }
}

type UpdateGrupInput = Partial<CreateGrupInput>

export async function updateUrunHizmetGrubu(
  id: number,
  data: UpdateGrupInput
) {
  try {
    const grup = await prisma.urunHizmetGruplari.update({
      where: { id },
      data,
    })
    return { grup }
  } catch (error) {
    console.error("Grup güncellenirken hata oluştu:", error)
    return { error: "Grup güncellenirken bir hata oluştu." }
  }
}

export async function deleteUrunHizmetGrubu(id: number) {
  try {
    const grup = await prisma.urunHizmetGruplari.delete({
      where: { id },
    })
    return { grup }
  } catch (error) {
    console.error("Grup silinirken hata oluştu:", error)
    return { error: "Grup silinirken bir hata oluştu." }
  }
}

export async function getUrunler() {
  return tryCatch(async () => {
    const urunler = await prisma.urunler.findMany({
      include: {
        grup: true,
      },
      orderBy: {
        urunKodu: "asc",
      },
    })
    return urunler
  }, "Ürünler getirilirken hata oluştu")
}

export async function getUrun(id: number) {
  try {
    const urun = await prisma.urunler.findUnique({
      where: { id },
      include: {
        grup: true,
      },
    })
    return { urun: serializable(urun) }
  } catch (error) {
    console.error("Ürün getirilirken hata oluştu:", error)
    return { error: "Ürün getirilirken bir hata oluştu." }
  }
}

type CreateUrunInput = {
  urunKodu: string
  urunAdi: string
  grupId: number
  birim: string
  birimFiyat: number
  paraBirimi: string
  kurBazliFiyat?: number | null
  kurParaBirimi?: string | null
  kdvOrani: number
  aciklama?: string | null
  aktif?: boolean
}

export async function createUrun(data: CreateUrunInput) {
  try {
    console.log("Ürün oluşturma verileri:", JSON.stringify(data, null, 2));
    
    // Geçerlilik kontrolü
    if (!data.urunAdi || data.urunAdi.trim() === "") {
      throw new Error("Ürün adı gereklidir.")
    }

    if (!data.urunKodu || data.urunKodu.trim() === "") {
      throw new Error("Ürün kodu gereklidir.")
    }

    // Oluşturulan ürün verisi
    const urun = await prisma.urunler.create({
      data: {
        urunKodu: data.urunKodu,
        urunAdi: data.urunAdi,
        grup: {
          connect: { id: data.grupId }
        },
        birim: data.birim,
        birimFiyat: new Decimal(data.birimFiyat),
        paraBirimi: data.paraBirimi,
        kurBazliFiyat: data.kurBazliFiyat ? new Decimal(data.kurBazliFiyat) : null,
        kurParaBirimi: data.kurParaBirimi || null,
        kdvOrani: data.kdvOrani,
        aciklama: data.aciklama,
        aktif: data.aktif !== undefined ? data.aktif : true,
      },
      include: {
        grup: true
      }
    })

    console.log("Oluşturulan ürün:", JSON.stringify(urun, null, 2));

    revalidatePath("/urunler")
    return { urun: serializable(urun) }
  } catch (error) {
    console.error("Ürün oluşturulurken hata oluştu:", error)
    return { error: error instanceof Error ? error.message : "Ürün oluşturulurken bir hata oluştu." }
  }
}

type UpdateUrunInput = Partial<CreateUrunInput>

export async function updateUrun(id: number, data: UpdateUrunInput) {
  try {
    console.log("Güncelleme verileri:", JSON.stringify(data, null, 2));
    
    // Güncellenecek ürünü bul
    const existingUrun = await prisma.urunler.findUnique({
      where: { id },
      include: {
        grup: true,
      }
    })

    if (!existingUrun) {
      throw new Error(`Ürün bulunamadı (ID: ${id})`)
    }

    // Birim fiyatı Decimal olarak düzenleme
    const birimFiyat = data.birimFiyat !== undefined
      ? new Decimal(data.birimFiyat)
      : undefined

    // Kur bazlı fiyatı Decimal olarak düzenleme
    const kurBazliFiyat = data.kurBazliFiyat !== undefined
      ? data.kurBazliFiyat !== null 
        ? new Decimal(data.kurBazliFiyat)
        : null
      : undefined

    // Güncellenecek veri objesi
    const updateData: any = {
      urunKodu: data.urunKodu,
      urunAdi: data.urunAdi,
      birim: data.birim,
      birimFiyat: birimFiyat,
      paraBirimi: data.paraBirimi,
      kurBazliFiyat: kurBazliFiyat,
      kurParaBirimi: data.kurParaBirimi,
      kdvOrani: data.kdvOrani,
      aciklama: data.aciklama,
      aktif: data.aktif
    };

    // Eğer grupId varsa, ilişkisel alanı doğru şekilde ayarla
    if (data.grupId) {
      updateData.grup = {
        connect: { id: data.grupId }
      };
    }

    // Undefined değerleri kaldır
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    console.log("Güncellenecek veri:", updateData);

    // Ürünü güncelle
    const updatedUrun = await prisma.urunler.update({
      where: { id },
      data: updateData,
      include: {
        grup: true
      }
    })

    console.log("Güncellenen ürün:", JSON.stringify(updatedUrun, null, 2));

    revalidatePath("/urunler")
    return { urun: serializable(updatedUrun) }
  } catch (error) {
    console.error("Ürün güncellenirken hata oluştu:", error)
    return { error: error instanceof Error ? error.message : "Ürün güncellenirken bir hata oluştu." }
  }
}

export async function deleteUrun(id: number) {
  try {
    const urun = await prisma.urunler.delete({
      where: { id },
    })
    revalidatePath("/urunler")
    return { urun }
  } catch (error) {
    console.error("Ürün silinirken hata oluştu:", error)
    return { error: "Ürün silinirken bir hata oluştu." }
  }
}

export async function getTeklifKalemUrunleri() {
  try {
    const urunler = await prisma.urunler.findMany({
      where: {
        aktif: true,
      },
      select: {
        id: true,
        urunKodu: true,
        urunAdi: true,
        grup: {
          select: {
            id: true,
            grupKodu: true,
            grupAdi: true,
          },
        },
        birim: true,
        birimFiyat: true,
        kdvOrani: true,
        grupId: true,
        aciklama: true,
        aktif: true,
      },
      orderBy: {
        urunKodu: "asc",
      },
    }) as unknown as ApiUrun[]

    // Decimal objelerini serialize et
    const serializableUrunler = serializable(urunler)

    return { urunler: serializableUrunler }
  } catch (error) {
    console.error("Teklif kalemleri için ürünler getirilirken hata oluştu:", error)
    return { error: "Ürünler getirilirken bir hata oluştu." }
  }
}

export async function getTeklifKalemHizmetleri() {
  try {
    const hizmetler = await prisma.hizmetler.findMany({
      where: {
        aktif: true,
      },
      select: {
        id: true,
        hizmetKodu: true,
        hizmetAdi: true,
        grup: {
          select: {
            id: true,
            grupKodu: true,
            grupAdi: true,
          },
        },
        birim: true,
        birimFiyat: true,
        kdvOrani: true,
        grupId: true,
        aciklama: true,
        aktif: true,
      },
      orderBy: {
        hizmetKodu: "asc",
      },
    }) as unknown as ApiHizmet[]

    // Decimal objelerini serialize et
    const serializableHizmetler = serializable(hizmetler)

    return { hizmetler: serializableHizmetler }
  } catch (error) {
    console.error("Teklif kalemleri için hizmetler getirilirken hata oluştu:", error)
    return { error: "Hizmetler getirilirken bir hata oluştu." }
  }
} 