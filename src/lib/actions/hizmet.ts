"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"

export async function getHizmetler() {
  try {
    const hizmetler = await prisma.hizmetler.findMany({
      include: {
        grup: true,
      },
      orderBy: [
        {
          hizmetKodu: "asc",
        },
      ],
    })
    return { hizmetler }
  } catch (error) {
    console.error("Hizmetler getirilirken hata oluştu:", error)
    return { error: "Hizmetler getirilirken bir hata oluştu." }
  }
}

export async function getHizmet(id: number) {
  try {
    const hizmet = await prisma.hizmetler.findUnique({
      where: { id },
      include: {
        grup: true,
      },
    })
    return { hizmet }
  } catch (error) {
    console.error("Hizmet getirilirken hata oluştu:", error)
    return { error: "Hizmet getirilirken bir hata oluştu." }
  }
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
  try {
    const hizmet = await prisma.hizmetler.create({
      data: {
        ...data,
        birimFiyat: new Decimal(data.birimFiyat),
      },
    })
    revalidatePath("/hizmetler")
    return { hizmet }
  } catch (error) {
    console.error("Hizmet oluşturulurken hata oluştu:", error)
    return { error: "Hizmet oluşturulurken bir hata oluştu." }
  }
}

type UpdateHizmetInput = Partial<CreateHizmetInput>

export async function updateHizmet(id: number, data: UpdateHizmetInput) {
  try {
    const hizmet = await prisma.hizmetler.update({
      where: { id },
      data: {
        ...data,
        birimFiyat: data.birimFiyat ? new Decimal(data.birimFiyat) : undefined,
      },
    })
    revalidatePath("/hizmetler")
    return { hizmet }
  } catch (error) {
    console.error("Hizmet güncellenirken hata oluştu:", error)
    return { error: "Hizmet güncellenirken bir hata oluştu." }
  }
}

export async function deleteHizmet(id: number) {
  try {
    const hizmet = await prisma.hizmetler.delete({
      where: { id },
    })
    revalidatePath("/hizmetler")
    return { hizmet }
  } catch (error) {
    console.error("Hizmet silinirken hata oluştu:", error)
    return { error: "Hizmet silinirken bir hata oluştu." }
  }
} 