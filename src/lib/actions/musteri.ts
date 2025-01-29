"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { MusteriForm, IlgiliKisiForm } from "../validations/musteri"
import { getUser } from "./auth"

const prisma = new PrismaClient()

export async function getMusteriler() {
  try {
    const user = await getUser()
    if (!user) {
      console.error("Kullanıcı bilgileri alınamadı")
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    console.log("Müşteriler getiriliyor, kullanıcı:", user.id, "rol:", user.rolId)
    const musteriler = await prisma.musteriler.findMany({
      include: {
        ilgiliKisiler: true,
        temsilci: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            email: true,
          },
        },
        kullanici: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            email: true,
          },
        },
      },
      orderBy: {
        kayitTarihi: 'desc',
      },
    })
    return { musteriler }
  } catch (error) {
    console.error("Müşteriler yüklenirken hata oluştu:", error)
    if (error instanceof Error) {
      console.error("Hata detayı:", error.message)
      console.error("Stack trace:", error.stack)
    }
    return { error: "Müşteriler yüklenirken bir hata oluştu." }
  }
}

export async function getMusteri(id: number) {
  try {
    const user = await getUser()

    const musteri = await prisma.musteriler.findFirst({
      where: { id },
      include: {
        ilgiliKisiler: true,
        temsilci: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            email: true,
          },
        },
        kullanici: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            email: true,
          },
        },
      },
    })

    if (!musteri) {
      return { error: "Müşteri bulunamadı." }
    }

    return { musteri }
  } catch (error) {
    return { error: "Müşteri bilgileri yüklenirken bir hata oluştu." }
  }
}

export async function createMusteri(data: MusteriForm) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    const musteri = await prisma.musteriler.create({
      data: {
        musteriTipi: data.musteriTipi,
        ...(data.musteriTipi === "BIREYSEL" ? {
          ad: data.ad,
          soyad: data.soyad,
          tcKimlik: data.tcKimlik,
        } : {
          firmaAdi: data.firmaAdi,
          vergiDairesi: data.vergiDairesi,
          vergiNo: data.vergiNo,
        }),
        telefon: data.telefon,
        email: data.email,
        adres: data.adres,
        kayitTarihi: new Date(),
        kullaniciId: user.id,
        ...(data.temsilciId && user.rolId === 1 ? { // Sadece admin temsilci atayabilir
          temsilciId: data.temsilciId,
        } : {}),
      },
    })
    revalidatePath("/musteriler")
    return { musteri }
  } catch (error) {
    console.error("Müşteri oluşturulurken hata oluştu:", error)
    if (error instanceof Error) {
      console.error("Hata detayı:", error.message)
      console.error("Stack trace:", error.stack)
    }
    return { error: "Müşteri oluşturulurken bir hata oluştu." }
  }
}

export async function updateMusteri(id: number, data: MusteriForm) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    // Müşteriyi bul
    const mevcutMusteri = await prisma.musteriler.findUnique({
      where: { id },
    })

    if (!mevcutMusteri) {
      return { error: "Müşteri bulunamadı." }
    }

    // Temsilci değişikliği varsa ve kullanıcı admin değilse engelle
    if (data.temsilciId !== mevcutMusteri.temsilciId && user.rolId !== 1) {
      return { error: "Müşteri temsilcisini değiştirme yetkiniz yok." }
    }

    const musteri = await prisma.musteriler.update({
      where: { id },
      data: {
        musteriTipi: data.musteriTipi,
        ...(data.musteriTipi === "BIREYSEL" ? {
          ad: data.ad,
          soyad: data.soyad,
          tcKimlik: data.tcKimlik,
          // Kurumsal alanları temizle
          firmaAdi: null,
          vergiDairesi: null,
          vergiNo: null,
        } : {
          firmaAdi: data.firmaAdi,
          vergiDairesi: data.vergiDairesi,
          vergiNo: data.vergiNo,
          // Bireysel alanları temizle
          ad: null,
          soyad: null,
          tcKimlik: null,
        }),
        telefon: data.telefon,
        email: data.email,
        adres: data.adres,
        ...(data.temsilciId && user.rolId === 1 ? { // Sadece admin temsilci atayabilir
          temsilciId: data.temsilciId,
        } : {}),
      },
    })
    revalidatePath("/musteriler")
    revalidatePath(`/musteriler/${id}`)
    return { musteri }
  } catch (error) {
    console.error("Müşteri güncellenirken hata oluştu:", error)
    if (error instanceof Error) {
      console.error("Hata detayı:", error.message)
      console.error("Stack trace:", error.stack)
    }
    return { error: "Müşteri güncellenirken bir hata oluştu." }
  }
}

export async function deleteMusteri(id: number) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    // Müşteriyi bul
    const mevcutMusteri = await prisma.musteriler.findUnique({
      where: { id },
    })

    if (!mevcutMusteri) {
      return { error: "Müşteri bulunamadı." }
    }

    // Sadece kaydeden kullanıcı veya admin silebilir
    if (mevcutMusteri.kullaniciId !== user.id && user.rolId !== 1) {
      return { error: "Bu müşteriyi silme yetkiniz yok." }
    }

    await prisma.musteriler.delete({
      where: { id },
    })
    revalidatePath("/musteriler")
    return { success: true }
  } catch (error) {
    return { error: "Müşteri silinirken bir hata oluştu." }
  }
}

export async function createIlgiliKisi(musteriId: number, data: IlgiliKisiForm) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    // Müşteriyi bul
    const musteri = await prisma.musteriler.findUnique({
      where: { id: musteriId },
    })

    if (!musteri) {
      return { error: "Müşteri bulunamadı." }
    }

    const ilgiliKisi = await prisma.ilgiliKisiler.create({
      data: {
        musteriId,
        ad: data.ad,
        soyad: data.soyad,
        unvan: data.unvan,
        telefon: data.telefon,
        email: data.email,
      },
    })
    revalidatePath(`/musteriler/${musteriId}`)
    return { ilgiliKisi }
  } catch (error) {
    return { error: "İlgili kişi oluşturulurken bir hata oluştu." }
  }
}

export async function updateIlgiliKisi(id: number, data: IlgiliKisiForm) {
  try {
    const ilgiliKisi = await prisma.ilgiliKisiler.update({
      where: { id },
      data: {
        ad: data.ad,
        soyad: data.soyad,
        unvan: data.unvan,
        telefon: data.telefon,
        email: data.email,
      },
    })
    revalidatePath(`/musteriler/${ilgiliKisi.musteriId}`)
    return { ilgiliKisi }
  } catch (error) {
    return { error: "İlgili kişi güncellenirken bir hata oluştu." }
  }
}

export async function deleteIlgiliKisi(id: number) {
  try {
    const ilgiliKisi = await prisma.ilgiliKisiler.delete({
      where: { id },
    })
    revalidatePath(`/musteriler/${ilgiliKisi.musteriId}`)
    return { success: true }
  } catch (error) {
    return { error: "İlgili kişi silinirken bir hata oluştu." }
  }
}

export async function updateMusteriTemsilcisi(musteriId: number, temsilciId: number | null) {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    // Kullanıcının admin olup olmadığını kontrol et
    if (user.rolId !== 1) { // Admin rolü ID'si 1 olarak varsayıyoruz
      return { error: "Bu işlem için yetkiniz yok." }
    }

    const musteri = await prisma.musteriler.update({
      where: { id: musteriId },
      data: {
        temsilciId,
      },
      include: {
        temsilci: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            email: true,
          },
        },
      },
    })

    revalidatePath("/musteriler")
    revalidatePath(`/musteriler/${musteriId}`)
    return { musteri }
  } catch (error) {
    console.error("Müşteri temsilcisi güncellenirken hata oluştu:", error)
    if (error instanceof Error) {
      console.error("Hata detayı:", error.message)
      console.error("Stack trace:", error.stack)
    }
    return { error: "Müşteri temsilcisi güncellenirken bir hata oluştu." }
  }
}

export async function getKullanicilar() {
  try {
    const user = await getUser()
    if (!user) {
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    // Kullanıcının admin olup olmadığını kontrol et
    if (user.rolId !== 1) { // Admin rolü ID'si 1 olarak varsayıyoruz
      return { error: "Bu işlem için yetkiniz yok." }
    }

    const kullanicilar = await prisma.kullanicilar.findMany({
      select: {
        id: true,
        ad: true,
        soyad: true,
        email: true,
        rolId: true,
      },
      orderBy: {
        ad: 'asc',
      },
    })

    return { kullanicilar }
  } catch (error) {
    console.error("Kullanıcılar yüklenirken hata oluştu:", error)
    if (error instanceof Error) {
      console.error("Hata detayı:", error.message)
      console.error("Stack trace:", error.stack)
    }
    return { error: "Kullanıcılar yüklenirken bir hata oluştu." }
  }
}

export async function searchMusteriler(query: string) {
  try {
    const user = await getUser()
    if (!user) {
      console.error("Kullanıcı bilgileri alınamadı")
      return { error: "Oturum açmış kullanıcı bulunamadı." }
    }

    if (query.length < 3) {
      return { musteriler: [] }
    }

    const musteriler = await prisma.musteriler.findMany({
      where: {
        OR: [
          // Bireysel müşteri araması
          {
            AND: [
              { musteriTipi: "BIREYSEL" },
              {
                OR: [
                  { ad: { contains: query, mode: 'insensitive' } },
                  { soyad: { contains: query, mode: 'insensitive' } },
                  { tcKimlik: { contains: query } },
                ],
              },
            ],
          },
          // Kurumsal müşteri araması
          {
            AND: [
              { musteriTipi: "KURUMSAL" },
              {
                OR: [
                  { firmaAdi: { contains: query, mode: 'insensitive' } },
                  { vergiNo: { contains: query } },
                ],
              },
            ],
          },
          // Ortak alan araması
          {
            OR: [
              { telefon: { contains: query } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
          // İlgili kişi araması
          {
            ilgiliKisiler: {
              some: {
                OR: [
                  { ad: { contains: query, mode: 'insensitive' } },
                  { soyad: { contains: query, mode: 'insensitive' } },
                  { unvan: { contains: query, mode: 'insensitive' } },
                  { telefon: { contains: query } },
                  { email: { contains: query, mode: 'insensitive' } },
                ],
              },
            },
          },
        ],
      },
      include: {
        ilgiliKisiler: true,
        temsilci: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            email: true,
          },
        },
        kullanici: {
          select: {
            id: true,
            ad: true,
            soyad: true,
            email: true,
          },
        },
      },
      take: 10, // En fazla 10 sonuç göster
    })

    return { musteriler }
  } catch (error) {
    console.error("Müşteri araması yapılırken hata oluştu:", error)
    if (error instanceof Error) {
      console.error("Hata detayı:", error.message)
      console.error("Stack trace:", error.stack)
    }
    return { error: "Müşteri araması yapılırken bir hata oluştu." }
  }
} 