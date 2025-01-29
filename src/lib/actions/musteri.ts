"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { MusteriForm, IlgiliKisiForm } from "../validations/musteri"

const prisma = new PrismaClient()

export async function getMusteriler() {
  try {
    const musteriler = await prisma.musteriler.findMany({
      include: {
        ilgiliKisiler: true,
      },
    })
    return { musteriler }
  } catch (error) {
    return { error: "Müşteriler yüklenirken bir hata oluştu." }
  }
}

export async function getMusteri(id: number) {
  try {
    const musteri = await prisma.musteriler.findUnique({
      where: { id },
      include: {
        ilgiliKisiler: true,
      },
    })
    return { musteri }
  } catch (error) {
    return { error: "Müşteri bilgileri yüklenirken bir hata oluştu." }
  }
}

export async function createMusteri(data: MusteriForm) {
  try {
    const musteri = await prisma.musteriler.create({
      data: {
        musteriTipi: data.musteriTipi,
        ad: data.ad,
        soyad: data.soyad,
        vergiNo: data.vergiNo,
        telefon: data.telefon,
        email: data.email,
        adres: data.adres,
      },
    })
    revalidatePath("/musteriler")
    return { musteri }
  } catch (error) {
    return { error: "Müşteri oluşturulurken bir hata oluştu." }
  }
}

export async function updateMusteri(id: number, data: MusteriForm) {
  try {
    const musteri = await prisma.musteriler.update({
      where: { id },
      data: {
        musteriTipi: data.musteriTipi,
        ad: data.ad,
        soyad: data.soyad,
        vergiNo: data.vergiNo,
        telefon: data.telefon,
        email: data.email,
        adres: data.adres,
      },
    })
    revalidatePath("/musteriler")
    revalidatePath(`/musteriler/${id}`)
    return { musteri }
  } catch (error) {
    return { error: "Müşteri güncellenirken bir hata oluştu." }
  }
}

export async function deleteMusteri(id: number) {
  try {
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