"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import type { FirsatForm } from "../validations/firsat"

const prisma = new PrismaClient()

export async function getFirsatlar() {
  try {
    const firsatlar = await prisma.firsatlar.findMany({
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

    // Decimal değerleri number'a dönüştür
    const formattedFirsatlar = firsatlar.map(firsat => ({
      ...firsat,
      olasilik: Number(firsat.olasilik)
    }))

    return { firsatlar: formattedFirsatlar }
  } catch (error) {
    return { error: "Fırsatlar yüklenirken bir hata oluştu." }
  }
}

export async function getFirsat(id: number) {
  try {
    const firsat = await prisma.firsatlar.findUnique({
      where: { id },
      include: {
        musteri: true,
        asama: true,
      },
    })

    if (!firsat) {
      return { error: "Fırsat bulunamadı." }
    }

    // Decimal değerleri number'a dönüştür
    const formattedFirsat = {
      ...firsat,
      olasilik: Number(firsat.olasilik)
    }

    return { firsat: formattedFirsat }
  } catch (error) {
    return { error: "Fırsat bilgileri yüklenirken bir hata oluştu." }
  }
}

export async function getMusteriFirsatlari(musteriId: number) {
  try {
    const firsatlar = await prisma.firsatlar.findMany({
      where: { musteriId },
      include: {
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

    // Decimal değerleri number'a dönüştür
    const formattedFirsatlar = firsatlar.map(firsat => ({
      ...firsat,
      olasilik: Number(firsat.olasilik)
    }))

    return { firsatlar: formattedFirsatlar }
  } catch (error) {
    return { error: "Müşteri fırsatları yüklenirken bir hata oluştu." }
  }
}

export async function createFirsat(data: FirsatForm) {
  try {
    const firsat = await prisma.firsatlar.create({
      data: {
        musteriId: data.musteriId,
        baslik: data.baslik,
        beklenenKapanisTarihi: new Date(data.beklenenKapanisTarihi),
        asamaId: data.asamaId,
        olasilik: data.olasilik,
      },
      include: {
        musteri: true,
        asama: true,
      },
    })

    revalidatePath("/firsatlar")
    revalidatePath(`/musteriler/${data.musteriId}`)
    return { firsat }
  } catch (error) {
    return { error: "Fırsat oluşturulurken bir hata oluştu." }
  }
}

export async function updateFirsat(id: number, data: FirsatForm) {
  try {
    const firsat = await prisma.firsatlar.update({
      where: { id },
      data: {
        musteriId: data.musteriId,
        baslik: data.baslik,
        beklenenKapanisTarihi: new Date(data.beklenenKapanisTarihi),
        asamaId: data.asamaId,
        olasilik: data.olasilik,
      },
      include: {
        musteri: true,
        asama: true,
      },
    })

    revalidatePath("/firsatlar")
    revalidatePath(`/musteriler/${data.musteriId}`)
    revalidatePath(`/firsatlar/${id}`)
    return { firsat }
  } catch (error) {
    return { error: "Fırsat güncellenirken bir hata oluştu." }
  }
}

export async function deleteFirsat(id: number) {
  try {
    const firsat = await prisma.firsatlar.delete({
      where: { id },
    })
    revalidatePath("/firsatlar")
    revalidatePath(`/musteriler/${firsat.musteriId}`)
    return { success: true }
  } catch (error) {
    return { error: "Fırsat silinirken bir hata oluştu." }
  }
}

export async function updateFirsatAsama(id: number, asamaId: number) {
  try {
    const firsat = await prisma.firsatlar.update({
      where: { id },
      data: { asamaId },
    })
    revalidatePath("/firsatlar")
    revalidatePath(`/musteriler/${firsat.musteriId}`)
    revalidatePath(`/firsatlar/${id}`)
    return { success: true }
  } catch (error) {
    return { error: "Fırsat aşaması güncellenirken bir hata oluştu." }
  }
}

export async function getAsamalar() {
  try {
    const asamalar = await prisma.asamalar.findMany({
      orderBy: {
        sira: "asc",
      },
    })
    return { asamalar }
  } catch (error) {
    return { error: "Aşamalar yüklenirken bir hata oluştu." }
  }
} 