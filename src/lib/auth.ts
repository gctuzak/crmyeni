import { auth, currentUser } from "@clerk/nextjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function getCurrentUser() {
  try {
    const { userId } = auth()
    if (!userId) {
      console.error("Oturum açmış kullanıcı bulunamadı")
      return null
    }

    // Clerk'ten kullanıcı bilgilerini al
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

    // Clerk'in userId'si ile eşleşen kullanıcıyı bul
    const user = await prisma.kullanicilar.findFirst({
      where: {
        email: email,
      },
      select: {
        id: true,
        ad: true,
        soyad: true,
        email: true,
        rolId: true,
      },
    })

    if (!user) {
      console.log("Yeni kullanıcı oluşturuluyor:", email)
      // Kullanıcı yoksa yeni bir kullanıcı oluştur
      return await prisma.kullanicilar.create({
        data: {
          email: email,
          ad: clerkUser.firstName || "Varsayılan",
          soyad: clerkUser.lastName || "Kullanıcı",
          sifreHash: "geçici",
          rolId: 1, // Varsayılan rol
        },
        select: {
          id: true,
          ad: true,
          soyad: true,
          email: true,
          rolId: true,
        },
      })
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