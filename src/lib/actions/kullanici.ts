"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { getUser } from "./auth"

const prisma = new PrismaClient()

export async function getKullanicilar() {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    // Admin kontrolü
    if (user.rolId !== 1) {
      return { error: "Bu işlem için yetkiniz yok." }
    }

    const kullanicilar = await prisma.kullanicilar.findMany({
      include: {
        rol: true,
        kayitliMusteriler: {
          select: {
            id: true,
            musteriTipi: true,
            ad: true,
            soyad: true,
            firmaAdi: true
          }
        },
        temsilciMusteriler: {
          select: {
            id: true,
            musteriTipi: true,
            ad: true,
            soyad: true,
            firmaAdi: true
          }
        }
      },
      orderBy: {
        ad: 'asc'
      }
    })

    return { kullanicilar }
  } catch (error) {
    console.error("Kullanıcılar yüklenirken hata oluştu:", error)
    return { error: "Kullanıcılar yüklenirken bir hata oluştu." }
  }
}

export async function getKullanici(id: number) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    // Admin kontrolü veya kendisi kontrolü
    if (user.rolId !== 1 && user.id !== id) {
      return { error: "Bu işlem için yetkiniz yok." }
    }

    const kullanici = await prisma.kullanicilar.findUnique({
      where: { id },
      include: {
        rol: true,
        kayitliMusteriler: {
          select: {
            id: true,
            musteriTipi: true,
            ad: true,
            soyad: true,
            firmaAdi: true
          }
        },
        temsilciMusteriler: {
          select: {
            id: true,
            musteriTipi: true,
            ad: true,
            soyad: true,
            firmaAdi: true
          }
        }
      }
    })

    if (!kullanici) {
      return { error: "Kullanıcı bulunamadı." }
    }

    return { kullanici }
  } catch (error) {
    console.error("Kullanıcı bilgileri yüklenirken hata oluştu:", error)
    return { error: "Kullanıcı bilgileri yüklenirken bir hata oluştu." }
  }
}

export async function createKullanici(data: {
  ad: string
  soyad: string
  email: string
  rolId: number
}) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    // Admin kontrolü
    if (user.rolId !== 1) {
      return { error: "Bu işlem için yetkiniz yok." }
    }

    // E-posta kontrolü
    const mevcutKullanici = await prisma.kullanicilar.findUnique({
      where: { email: data.email }
    })

    if (mevcutKullanici) {
      return { error: "Bu e-posta adresi zaten kullanılıyor." }
    }

    const kullanici = await prisma.kullanicilar.create({
      data: {
        ...data,
        sifreHash: "geçici" // Clerk ile entegre olduğu için şifre kullanmıyoruz
      },
      include: {
        rol: true
      }
    })

    revalidatePath("/kullanicilar")
    return { kullanici }
  } catch (error) {
    console.error("Kullanıcı oluşturulurken hata oluştu:", error)
    return { error: "Kullanıcı oluşturulurken bir hata oluştu." }
  }
}

export async function updateKullanici(id: number, data: {
  ad: string
  soyad: string
  email: string
  rolId: number
}) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    // Admin kontrolü veya kendisi kontrolü
    if (user.rolId !== 1 && user.id !== id) {
      return { error: "Bu işlem için yetkiniz yok." }
    }

    // E-posta kontrolü
    const mevcutKullanici = await prisma.kullanicilar.findUnique({
      where: { email: data.email }
    })

    if (mevcutKullanici && mevcutKullanici.id !== id) {
      return { error: "Bu e-posta adresi zaten kullanılıyor." }
    }

    // Rol değişikliği sadece admin tarafından yapılabilir
    if (user.rolId !== 1) {
      delete data.rolId
    }

    const kullanici = await prisma.kullanicilar.update({
      where: { id },
      data,
      include: {
        rol: true
      }
    })

    revalidatePath("/kullanicilar")
    revalidatePath(`/kullanicilar/${id}`)
    return { kullanici }
  } catch (error) {
    console.error("Kullanıcı güncellenirken hata oluştu:", error)
    return { error: "Kullanıcı güncellenirken bir hata oluştu." }
  }
}

export async function deleteKullanici(id: number) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    // Admin kontrolü
    if (user.rolId !== 1) {
      return { error: "Bu işlem için yetkiniz yok." }
    }

    // Kendini silmeye çalışıyor mu kontrolü
    if (user.id === id) {
      return { error: "Kendinizi silemezsiniz." }
    }

    await prisma.kullanicilar.delete({
      where: { id }
    })

    revalidatePath("/kullanicilar")
    return { success: true }
  } catch (error) {
    console.error("Kullanıcı silinirken hata oluştu:", error)
    return { error: "Kullanıcı silinirken bir hata oluştu." }
  }
}

export async function getRoller() {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    const roller = await prisma.roller.findMany({
      orderBy: {
        ad: 'asc'
      }
    })

    return { roller }
  } catch (error) {
    console.error("Roller yüklenirken hata oluştu:", error)
    return { error: "Roller yüklenirken bir hata oluştu." }
  }
} 