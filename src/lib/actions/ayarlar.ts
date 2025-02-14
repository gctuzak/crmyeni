"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getUser } from "./auth"

export async function getAyar(anahtar: string) {
  try {
    const ayar = await prisma.ayarlar.findUnique({
      where: { anahtar },
    })
    return { deger: ayar?.deger }
  } catch (error) {
    console.error("Ayar alınırken hata oluştu:", error)
    return { error: "Ayar alınırken bir hata oluştu" }
  } finally {
    await prisma.$disconnect()
  }
}

export async function updateAyar(anahtar: string, deger: string, aciklama?: string) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    if (user.rolId !== 1) {
      return { error: "Bu işlem için yetkiniz yok." }
    }

    const ayar = await prisma.ayarlar.upsert({
      where: { anahtar },
      update: { deger, aciklama },
      create: { anahtar, deger, aciklama },
    })

    revalidatePath("/ayarlar")
    return { ayar }
  } catch (error) {
    console.error("Ayar güncellenirken hata oluştu:", error)
    return { error: "Ayar güncellenirken bir hata oluştu" }
  } finally {
    await prisma.$disconnect()
  }
}

export async function uploadLogo(formData: FormData) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    if (user.rolId !== 1) {
      return { error: "Bu işlem için yetkiniz yok." }
    }

    const file = formData.get("logo") as File
    if (!file) {
      return { error: "Logo dosyası bulunamadı" }
    }

    // Base64'e çevir
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const mimeType = file.type

    // Base64 formatında kaydet
    const logoData = `data:${mimeType};base64,${base64}`
    
    const ayar = await prisma.ayarlar.upsert({
      where: { anahtar: "logo" },
      update: { 
        deger: logoData,
        aciklama: "Şirket logosu"
      },
      create: {
        anahtar: "logo",
        deger: logoData,
        aciklama: "Şirket logosu"
      },
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Logo yüklenirken hata oluştu:", error)
    return { error: "Logo yüklenirken bir hata oluştu" }
  } finally {
    await prisma.$disconnect()
  }
} 