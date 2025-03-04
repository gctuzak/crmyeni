"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"
import { DatabaseError, NotFoundError, tryCatch } from "@/lib/error"

export async function getHizmetler() {
  return tryCatch(async () => {
    const hizmetler = await prisma.hizmetler.findMany({
      include: {
        grup: true,
      },
      orderBy: {
        hizmetKodu: "asc",
      },
    })
    return hizmetler
  }, "Hizmetler getirilirken hata oluştu")
}

export async function getHizmet(id: number) {
  return tryCatch(async () => {
    const hizmet = await prisma.hizmetler.findUnique({
      where: { id },
      include: {
        grup: true,
      },
    })
    
    if (!hizmet) {
      throw new NotFoundError("Hizmet", id)
    }
    
    return hizmet
  }, `Hizmet ID:${id} getirilirken hata oluştu`)
}

type CreateHizmetInput = {
  hizmetKodu: string
  hizmetAdi: string
  grupId: number
  birim: string
  birimFiyat: number
  kdvOrani: number
  aciklama?: string | null
  aktif?: boolean
}

export async function createHizmet(data: CreateHizmetInput) {
  return tryCatch(async () => {
    const hizmet = await prisma.hizmetler.create({
      data: {
        ...data,
        birimFiyat: new Decimal(data.birimFiyat),
      },
    })
    revalidatePath("/hizmetler")
    return hizmet
  }, "Hizmet oluşturulurken hata oluştu")
}

type UpdateHizmetInput = Partial<CreateHizmetInput>

export async function updateHizmet(id: number, data: UpdateHizmetInput) {
  return tryCatch(async () => {
    const existingHizmet = await prisma.hizmetler.findUnique({
      where: { id }
    })
    
    if (!existingHizmet) {
      throw new NotFoundError("Hizmet", id)
    }
    
    const hizmet = await prisma.hizmetler.update({
      where: { id },
      data: {
        ...data,
        birimFiyat: data.birimFiyat ? new Decimal(data.birimFiyat) : undefined,
      },
    })
    revalidatePath("/hizmetler")
    return hizmet
  }, `Hizmet ID:${id} güncellenirken hata oluştu`)
}

export async function deleteHizmet(id: number) {
  return tryCatch(async () => {
    // Hizmetin kullanımda olup olmadığını kontrol et
    const kullaniliyor = await prisma.teklifKalemleri.findFirst({
      where: { hizmetId: id }
    })
    
    if (kullaniliyor) {
      throw new Error("Bu hizmet bir veya daha fazla teklifte kullanılmaktadır ve silinemez.")
    }
    
    const hizmet = await prisma.hizmetler.delete({
      where: { id },
    })
    revalidatePath("/hizmetler")
    return hizmet
  }, `Hizmet ID:${id} silinirken hata oluştu`)
} 