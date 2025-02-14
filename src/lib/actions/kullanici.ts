"use server"

import { revalidatePath } from "next/cache"
import { getUser } from "../auth"
import { KullaniciForm } from "../validations/kullanici"
import * as bcrypt from "bcrypt"
import { prisma } from "../prisma"

export async function getKullanicilar() {
  try {
    const kullanicilar = await prisma.kullanicilar.findMany({
      include: {
        rol: true,
      },
      orderBy: {
        id: "asc",
      },
    })

    return { kullanicilar }
  } catch (error) {
    console.error("Kullanıcılar alınırken hata oluştu:", error)
    return { error: "Kullanıcılar alınırken bir hata oluştu" }
  } finally {
    await prisma.$disconnect()
  }
}

export async function getKullanici(id: number) {
  try {
    const kullanici = await prisma.kullanicilar.findUnique({
      where: { id },
      include: { rol: true },
    })

    if (!kullanici) {
      return { error: "Kullanıcı bulunamadı" }
    }

    return { kullanici }
  } catch (error) {
    console.error("Kullanıcı alınırken hata oluştu:", error)
    return { error: "Kullanıcı alınırken bir hata oluştu" }
  } finally {
    await prisma.$disconnect()
  }
}

export async function createKullanici(data: KullaniciForm) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    if (user.rolId !== 1) {
      return { error: "Bu işlem için yetkiniz yok." }
    }

    // E-posta adresi kontrolü
    const mevcutKullanici = await prisma.kullanicilar.findUnique({
      where: { email: data.email },
    })

    if (mevcutKullanici) {
      return { error: "Bu e-posta adresi zaten kullanılıyor." }
    }

    // Şifreyi hashle
    const sifreHash = await bcrypt.hash(data.sifre, 10)

    const kullanici = await prisma.kullanicilar.create({
      data: {
        ad: data.ad,
        soyad: data.soyad,
        email: data.email,
        sifreHash,
        rolId: data.rolId,
      },
    })

    revalidatePath("/kullanicilar/yonetim")
    return { kullanici }
  } catch (error) {
    console.error("Kullanıcı oluşturulurken hata oluştu:", error)
    return { error: "Kullanıcı oluşturulurken bir hata oluştu." }
  } finally {
    await prisma.$disconnect()
  }
}

export async function updateKullanici(id: number, data: KullaniciForm) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    if (user.rolId !== 1) {
      return { error: "Bu işlem için yetkiniz yok." }
    }

    // Kullanıcıyı bul
    const mevcutKullanici = await prisma.kullanicilar.findUnique({
      where: { id },
    })

    if (!mevcutKullanici) {
      return { error: "Kullanıcı bulunamadı." }
    }

    // E-posta adresi kontrolü
    const emailKullanici = await prisma.kullanicilar.findFirst({
      where: {
        email: data.email,
        id: { not: id },
      },
    })

    if (emailKullanici) {
      return { error: "Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor." }
    }

    // Şifreyi hashle (eğer değiştiyse)
    let sifreHash = mevcutKullanici.sifreHash
    if (data.sifre) {
      sifreHash = await bcrypt.hash(data.sifre, 10)
    }

    const kullanici = await prisma.kullanicilar.update({
      where: { id },
      data: {
        ad: data.ad,
        soyad: data.soyad,
        email: data.email,
        sifreHash,
        rolId: data.rolId,
      },
    })

    revalidatePath("/kullanicilar/yonetim")
    revalidatePath(`/kullanicilar/yonetim/${id}`)
    return { kullanici }
  } catch (error) {
    console.error("Kullanıcı güncellenirken hata oluştu:", error)
    return { error: "Kullanıcı güncellenirken bir hata oluştu." }
  } finally {
    await prisma.$disconnect()
  }
}

export async function deleteKullanici(id: number) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    if (user.rolId !== 1) {
      return { error: "Bu işlem için yetkiniz yok." }
    }

    // Kullanıcıyı bul
    const mevcutKullanici = await prisma.kullanicilar.findUnique({
      where: { id },
    })

    if (!mevcutKullanici) {
      return { error: "Kullanıcı bulunamadı." }
    }

    // Son admin kontrolü
    if (mevcutKullanici.rolId === 1) {
      const adminSayisi = await prisma.kullanicilar.count({
        where: { rolId: 1 },
      })

      if (adminSayisi === 1) {
        return { error: "Son admin kullanıcısı silinemez." }
      }
    }

    await prisma.kullanicilar.delete({
      where: { id },
    })

    revalidatePath("/kullanicilar/yonetim")
    return { success: true }
  } catch (error) {
    console.error("Kullanıcı silinirken hata oluştu:", error)
    return { error: "Kullanıcı silinirken bir hata oluştu." }
  } finally {
    await prisma.$disconnect()
  }
} 