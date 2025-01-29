"use server"

import { auth, currentUser } from "@clerk/nextjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function getUser() {
  try {
    const { userId } = auth()
    if (!userId) {
      console.error("Oturum açmış kullanıcı bulunamadı")
      return null
    }

    const clerkUser = await currentUser()
    if (!clerkUser) {
      console.error("Clerk kullanıcı bilgileri alınamadı")
      return null
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress
    if (!email) {
      console.error("Kullanıcının email adresi bulunamadı")
      return null
    }

    // Önce admin kullanıcısını bul
    const adminUser = await prisma.kullanicilar.findFirst({
      where: {
        email: 'admin@example.com',
      },
    })

    if (!adminUser) {
      console.error("Admin kullanıcısı bulunamadı")
      return null
    }

    // Clerk'in userId'si ile eşleşen kullanıcıyı bul veya oluştur
    const user = await prisma.kullanicilar.upsert({
      where: {
        email: email,
      },
      update: {
        ad: clerkUser.firstName || "Varsayılan",
        soyad: clerkUser.lastName || "Kullanıcı",
      },
      create: {
        email: email,
        ad: clerkUser.firstName || "Varsayılan",
        soyad: clerkUser.lastName || "Kullanıcı",
        sifreHash: "geçici",
        rolId: adminUser.rolId, // Yeni kullanıcılara admin rolü veriyoruz (test için)
      },
    })

    return user
  } catch (error) {
    console.error("Kullanıcı bilgileri alınırken hata oluştu:", error)
    if (error instanceof Error) {
      console.error("Hata detayı:", error.message)
      console.error("Stack trace:", error.stack)
    }
    return null
  }
} 