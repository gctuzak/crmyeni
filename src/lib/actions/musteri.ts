"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { MusteriForm, IlgiliKisiForm } from "../validations/musteri"
import { requireAuth } from "../auth"

const prisma = new PrismaClient()

export async function getMusteriler() {
  try {
    const user = await requireAuth()
    if (!user) {
      console.error("Kullanıcı bilgileri alınamadı")
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    console.log("Müşteriler getiriliyor, kullanıcı:", user.id)
    const musteriler = await prisma.musteriler.findMany({
      where: {
        kullaniciId: user.id,
      },
      include: {
        ilgiliKisiler: true,
      },
      orderBy: {
        kayitTarihi: 'desc',
      },
    })
    return { musteriler }
  } catch (error) {
    console.error("Müşteriler yüklenirken hata oluştu:", error)
    if (error instanceof Error) {
      console.error("Hata detayı:", error.message)
      console.error("Stack trace:", error.stack)
    }
    return { error: "Müşteriler yüklenirken bir hata oluştu." }
  }
}

export async function getMusteri(id: number) {
  try {
    const user = await requireAuth()

    const musteri = await prisma.musteriler.findFirst({
      where: { 
        id,
        kullaniciId: user.id,
      },
      include: {
        ilgiliKisiler: true,
      },
    })

    if (!musteri) {
      return { error: "Müşteri bulunamadı." }
    }

    return { musteri }
  } catch (error) {
    return { error: "Müşteri bilgileri yüklenirken bir hata oluştu." }
  }
}

export async function createMusteri(data: MusteriForm) {
  try {
    const user = await requireAuth()

    const musteri = await prisma.musteriler.create({
      data: {
        musteriTipi: data.musteriTipi,
        ...(data.musteriTipi === "BIREYSEL" ? {
          ad: data.ad,
          soyad: data.soyad,
          tcKimlik: data.tcKimlik,
        } : {
          firmaAdi: data.firmaAdi,
          vergiDairesi: data.vergiDairesi,
          vergiNo: data.vergiNo,
        }),
        telefon: data.telefon,
        email: data.email,
        adres: data.adres,
        kayitTarihi: new Date(),
        kullaniciId: user.id,
        ...(data.temsilciId && {
          temsilciId: data.temsilciId,
        }),
      },
    })
    revalidatePath("/musteriler")
    return { musteri }
  } catch (error) {
    console.error("Müşteri oluşturulurken hata oluştu:", error)
    if (error instanceof Error) {
      console.error("Hata detayı:", error.message)
      console.error("Stack trace:", error.stack)
    }
    return { error: "Müşteri oluşturulurken bir hata oluştu." }
  }
}

export async function updateMusteri(id: number, data: MusteriForm) {
  try {
    const user = await requireAuth()

    // Önce müşterinin bu kullanıcıya ait olup olmadığını kontrol et
    const mevcutMusteri = await prisma.musteriler.findFirst({
      where: {
        id,
        kullaniciId: user.id,
      },
    })

    if (!mevcutMusteri) {
      return { error: "Müşteri bulunamadı veya bu işlem için yetkiniz yok." }
    }

    const musteri = await prisma.musteriler.update({
      where: { id },
      data: {
        musteriTipi: data.musteriTipi,
        ...(data.musteriTipi === "BIREYSEL" ? {
          ad: data.ad,
          soyad: data.soyad,
          tcKimlik: data.tcKimlik,
          // Kurumsal alanları temizle
          firmaAdi: null,
          vergiDairesi: null,
          vergiNo: null,
        } : {
          firmaAdi: data.firmaAdi,
          vergiDairesi: data.vergiDairesi,
          vergiNo: data.vergiNo,
          // Bireysel alanları temizle
          ad: null,
          soyad: null,
          tcKimlik: null,
        }),
        telefon: data.telefon,
        email: data.email,
        adres: data.adres,
        ...(data.temsilciId && {
          temsilciId: data.temsilciId,
        }),
      },
    })
    revalidatePath("/musteriler")
    revalidatePath(`/musteriler/${id}`)
    return { musteri }
  } catch (error) {
    console.error("Müşteri güncellenirken hata oluştu:", error)
    if (error instanceof Error) {
      console.error("Hata detayı:", error.message)
      console.error("Stack trace:", error.stack)
    }
    return { error: "Müşteri güncellenirken bir hata oluştu." }
  }
}

export async function deleteMusteri(id: number) {
  try {
    const user = await requireAuth()

    // Önce müşterinin bu kullanıcıya ait olup olmadığını kontrol et
    const mevcutMusteri = await prisma.musteriler.findFirst({
      where: {
        id,
        kullaniciId: user.id,
      },
    })

    if (!mevcutMusteri) {
      return { error: "Müşteri bulunamadı veya bu işlem için yetkiniz yok." }
    }

    await prisma.musteriler.delete({
      where: { id },
    })
    revalidatePath("/musteriler")
    return { success: true }
  } catch (error) {
    return { error: "Müşteri silinirken bir hata oluştu." }
  }
}

export async function createIlgiliKisi(musteriId: number, data: IlgiliKisiForm) {
  try {
    const user = await requireAuth()

    // Önce müşterinin bu kullanıcıya ait olup olmadığını kontrol et
    const musteri = await prisma.musteriler.findFirst({
      where: {
        id: musteriId,
        kullaniciId: user.id,
      },
    })

    if (!musteri) {
      return { error: "Müşteri bulunamadı veya bu işlem için yetkiniz yok." }
    }

    const ilgiliKisi = await prisma.ilgiliKisiler.create({
      data: {
        musteriId,
        ad: data.ad,
        soyad: data.soyad,
        unvan: data.unvan,
        telefon: data.telefon,
        email: data.email,
      },
    })
    revalidatePath(`/musteriler/${musteriId}`)
    return { ilgiliKisi }
  } catch (error) {
    return { error: "İlgili kişi oluşturulurken bir hata oluştu." }
  }
}

export async function updateIlgiliKisi(id: number, data: IlgiliKisiForm) {
  try {
    const ilgiliKisi = await prisma.ilgiliKisiler.update({
      where: { id },
      data: {
        ad: data.ad,
        soyad: data.soyad,
        unvan: data.unvan,
        telefon: data.telefon,
        email: data.email,
      },
    })
    revalidatePath(`/musteriler/${ilgiliKisi.musteriId}`)
    return { ilgiliKisi }
  } catch (error) {
    return { error: "İlgili kişi güncellenirken bir hata oluştu." }
  }
}

export async function deleteIlgiliKisi(id: number) {
  try {
    const ilgiliKisi = await prisma.ilgiliKisiler.delete({
      where: { id },
    })
    revalidatePath(`/musteriler/${ilgiliKisi.musteriId}`)
    return { success: true }
  } catch (error) {
    return { error: "İlgili kişi silinirken bir hata oluştu." }
  }
}

export async function updateMusteriTemsilcisi(musteriId: number, temsilciId: number | null) {
  try {
    const user = await requireAuth()

    // Kullanıcının admin olup olmadığını kontrol et
    if (user.rolId !== 1) { // Admin rolü ID'si 1 olarak varsayıyoruz
      return { error: "Bu işlem için yetkiniz yok." }
    }

    const musteri = await prisma.musteriler.update({
      where: { id: musteriId },
      data: {
        temsilciId,
      },
      include: {
        temsilci: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            email: true,
          },
        },
      },
    })

    revalidatePath("/musteriler")
    revalidatePath(`/musteriler/${musteriId}`)
    return { musteri }
  } catch (error) {
    console.error("Müşteri temsilcisi güncellenirken hata oluştu:", error)
    if (error instanceof Error) {
      console.error("Hata detayı:", error.message)
      console.error("Stack trace:", error.stack)
    }
    return { error: "Müşteri temsilcisi güncellenirken bir hata oluştu." }
  }
}

export async function getKullanicilar() {
  try {
    const user = await requireAuth()

    // Kullanıcının admin olup olmadığını kontrol et
    if (user.rolId !== 1) { // Admin rolü ID'si 1 olarak varsayıyoruz
      return { error: "Bu işlem için yetkiniz yok." }
    }

    const kullanicilar = await prisma.kullanicilar.findMany({
      select: {
        id: true,
        ad: true,
        soyad: true,
        email: true,
        rolId: true,
      },
      orderBy: {
        ad: 'asc',
      },
    })

    return { kullanicilar }
  } catch (error) {
    console.error("Kullanıcılar yüklenirken hata oluştu:", error)
    if (error instanceof Error) {
      console.error("Hata detayı:", error.message)
      console.error("Stack trace:", error.stack)
    }
    return { error: "Kullanıcılar yüklenirken bir hata oluştu." }
  }
} 