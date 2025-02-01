"use server"

import { writeFile } from "fs/promises"
import { join } from "path"
import { getUser } from "./auth"
import { prisma } from "@/lib/prisma"

export async function getSirketAyarlari() {
  try {
    const ayarlar = await prisma.sirketAyarlari.findFirst({
      orderBy: {
        guncellemeTarihi: 'desc'
      }
    })
    return { ayarlar }
  } catch (error) {
    console.error("Şirket ayarları yüklenirken hata oluştu:", error)
    return { error: "Şirket ayarları yüklenirken bir hata oluştu." }
  }
}

export async function updateLogo(formData: FormData) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    // Admin kontrolü
    if (user.rolId !== 1) {
      return { error: "Bu işlem için yetkiniz yok." }
    }

    const file = formData.get("logo") as File
    if (!file) {
      return { error: "Logo dosyası bulunamadı." }
    }

    // Dosya tipini kontrol et
    if (!file.type.startsWith("image/")) {
      return { error: "Sadece resim dosyaları yüklenebilir." }
    }

    // Dosya boyutunu kontrol et (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return { error: "Dosya boyutu 2MB'dan büyük olamaz." }
    }

    // Dosya adını oluştur
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const filename = `logo_${timestamp}.${extension}`

    // Dosyayı kaydet
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const path = join(process.cwd(), "public", "uploads", filename)
    await writeFile(path, buffer)

    // Veritabanını güncelle
    const ayarlar = await prisma.sirketAyarlari.create({
      data: {
        logo: `/uploads/${filename}`,
        guncelleyenId: user.id
      }
    })

    return { ayarlar }
  } catch (error) {
    console.error("Logo güncellenirken hata oluştu:", error)
    return { error: "Logo güncellenirken bir hata oluştu." }
  }
} 