"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { EtkinlikForm } from "../validations/etkinlik"
import { getUser } from "./auth"

const prisma = new PrismaClient()

export async function getEtkinlikler() {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    const etkinlikler = await prisma.etkinlikler.findMany({
      include: {
        musteri: true,
        ilgiliKisi: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            unvan: true,
          },
        },
        kullanici: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            email: true,
          },
        },
      },
      orderBy: {
        baslangicTarihi: 'desc',
      },
    })

    return { etkinlikler }
  } catch (error) {
    console.error("Etkinlikler yüklenirken hata oluştu:", error)
    return { error: "Etkinlikler yüklenirken bir hata oluştu." }
  }
}

export async function getEtkinlik(id: number) {
  try {
    const etkinlik = await prisma.etkinlikler.findUnique({
      where: { id },
      include: {
        musteri: true,
        ilgiliKisi: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            unvan: true,
          },
        },
        kullanici: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            email: true,
          },
        },
      },
    })

    if (!etkinlik) {
      return { error: "Etkinlik bulunamadı." }
    }

    return { etkinlik }
  } catch (error) {
    return { error: "Etkinlik bilgileri yüklenirken bir hata oluştu." }
  }
}

export async function getMusteriEtkinlikleri(musteriId: number) {
  try {
    const etkinlikler = await prisma.etkinlikler.findMany({
      where: { musteriId },
      include: {
        ilgiliKisi: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            unvan: true,
          },
        },
        kullanici: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            email: true,
          },
        },
      },
      orderBy: {
        baslangicTarihi: 'desc',
      },
    })

    return { etkinlikler }
  } catch (error) {
    return { error: "Müşteri etkinlikleri yüklenirken bir hata oluştu." }
  }
}

export async function createEtkinlik(data: EtkinlikForm) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    const etkinlik = await prisma.etkinlikler.create({
      data: {
        musteriId: data.musteriId,
        ilgiliKisiId: data.ilgiliKisiId || null,
        etkinlikTipi: data.etkinlikTipi,
        baslangicTarihi: new Date(data.baslangicTarihi),
        bitisTarihi: data.bitisTarihi ? new Date(data.bitisTarihi) : null,
        aciklama: data.aciklama || null,
        durum: data.durum,
        oncelik: data.oncelik,
        kullaniciId: user.id,
      },
      include: {
        musteri: true,
        ilgiliKisi: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            unvan: true,
          },
        },
        kullanici: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            email: true,
          },
        },
      },
    })

    revalidatePath("/etkinlikler")
    revalidatePath(`/musteriler/${data.musteriId}`)
    return { etkinlik }
  } catch (error) {
    console.error("Etkinlik oluşturulurken hata oluştu:", error)
    return { error: "Etkinlik oluşturulurken bir hata oluştu." }
  }
}

export async function updateEtkinlik(id: number, data: EtkinlikForm) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    const etkinlik = await prisma.etkinlikler.update({
      where: { id },
      data: {
        musteriId: data.musteriId,
        ilgiliKisiId: data.ilgiliKisiId || null,
        etkinlikTipi: data.etkinlikTipi,
        baslangicTarihi: new Date(data.baslangicTarihi),
        bitisTarihi: data.bitisTarihi ? new Date(data.bitisTarihi) : null,
        aciklama: data.aciklama || null,
        durum: data.durum,
        oncelik: data.oncelik,
      },
      include: {
        musteri: true,
        ilgiliKisi: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            unvan: true,
          },
        },
        kullanici: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            email: true,
          },
        },
      },
    })

    revalidatePath("/etkinlikler")
    revalidatePath(`/musteriler/${data.musteriId}`)
    revalidatePath(`/etkinlikler/${id}`)
    return { etkinlik }
  } catch (error) {
    console.error("Etkinlik güncellenirken hata oluştu:", error)
    return { error: "Etkinlik güncellenirken bir hata oluştu." }
  }
}

export async function deleteEtkinlik(id: number) {
  try {
    const etkinlik = await prisma.etkinlikler.delete({
      where: { id },
    })

    revalidatePath("/etkinlikler")
    revalidatePath(`/musteriler/${etkinlik.musteriId}`)
    return { success: true }
  } catch (error) {
    return { error: "Etkinlik silinirken bir hata oluştu." }
  }
}

export async function updateEtkinlikDurumu(id: number, durum: string) {
  try {
    const etkinlik = await prisma.etkinlikler.update({
      where: { id },
      data: { durum },
    })

    revalidatePath("/etkinlikler")
    revalidatePath(`/musteriler/${etkinlik.musteriId}`)
    revalidatePath(`/etkinlikler/${id}`)
    return { success: true }
  } catch (error) {
    return { error: "Etkinlik durumu güncellenirken bir hata oluştu." }
  }
}

export async function updateEtkinlikOnceligi(id: number, oncelik: string) {
  try {
    const etkinlik = await prisma.etkinlikler.update({
      where: { id },
      data: { oncelik },
    })

    revalidatePath("/etkinlikler")
    revalidatePath(`/musteriler/${etkinlik.musteriId}`)
    revalidatePath(`/etkinlikler/${id}`)
    return { success: true }
  } catch (error) {
    return { error: "Etkinlik önceliği güncellenirken bir hata oluştu." }
  }
}

// Yaklaşan etkinlikleri getir
export async function getYaklasanEtkinlikler() {
  try {
    const simdi = new Date()
    const birHaftaSonra = new Date(simdi.getTime() + 7 * 24 * 60 * 60 * 1000)

    const etkinlikler = await prisma.etkinlikler.findMany({
      where: {
        baslangicTarihi: {
          gte: simdi,
          lte: birHaftaSonra,
        },
      },
      include: {
        musteri: true,
        ilgiliKisi: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            unvan: true,
          },
        },
        kullanici: true,
      },
      orderBy: {
        baslangicTarihi: "asc",
      },
    })
    return { etkinlikler }
  } catch (error) {
    return { error: "Yaklaşan etkinlikler yüklenirken bir hata oluştu." }
  }
} 