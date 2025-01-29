"use server"

import { PrismaClient } from "@prisma/client"
import { currentUser } from "@clerk/nextjs"

const prisma = new PrismaClient()

export async function getCurrentUser() {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return null
    }

    // Önce clerkId ile ara
    let user = await prisma.kullanicilar.findFirst({
      where: { clerkId: clerkUser.id },
    })

    // Bulunamadıysa e-posta ile ara
    if (!user) {
      const email = clerkUser.emailAddresses[0]?.emailAddress
      if (email) {
        user = await prisma.kullanicilar.findFirst({
          where: { email },
        })

        // E-posta ile bulunduysa clerkId'yi güncelle
        if (user) {
          user = await prisma.kullanicilar.update({
            where: { id: user.id },
            data: { clerkId: clerkUser.id },
          })
          return user
        }
      }

      // Kullanıcı hiç bulunamadıysa yeni oluştur
      // Admin rolünü bul
      const adminRol = await prisma.roller.findFirst({
        where: { rolAdi: "Admin" },
      })

      if (!adminRol) {
        console.error("Admin rolü bulunamadı")
        return null
      }

      // Yeni kullanıcı oluştur
      const newUser = await prisma.kullanicilar.create({
        data: {
          ad: clerkUser.firstName || "Varsayılan",
          soyad: clerkUser.lastName || "Kullanıcı",
          email: email || "",
          sifreHash: "geçici",
          clerkId: clerkUser.id,
          rolId: adminRol.id, // Test için admin rolü veriyoruz
        },
      })

      return newUser
    }

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

export async function getUser() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error("Oturum açmış kullanıcı bulunamadı.")
    }
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

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Bu işlem için yetkiniz yok.")
  }
  return user
} 