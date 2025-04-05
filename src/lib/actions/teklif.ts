"use server"

import { revalidatePath } from "next/cache"
import { Decimal } from "@prisma/client/runtime/library"
import { prisma } from "../prisma"
import { CreateTeklifInput } from "../types"
import { serializable } from "../utils"
import { requireAuth } from "../auth"
import { TeklifForm } from "../validations/teklif"

// UpdateTeklifInput tipini tanımlayalım
type UpdateTeklifInput = Partial<CreateTeklifInput>

// Teklif numarası oluşturma fonksiyonu
export async function generateTeklifNo(musteriId: number | string) {
  try {
    // String olarak gelen musteriId değerini number'a dönüştür
    const musteriIdNumber = typeof musteriId === 'string' ? parseInt(musteriId, 10) : musteriId
    
    // Tüm tekliflerde en son teklif numarasını bul (müşteriye özgü değil)
    const sonTeklif = await prisma.teklifler.findFirst({
      orderBy: { teklifNo: "desc" },
    })

    const yil = new Date().getFullYear()
    let siraNo = 1

    if (sonTeklif) {
      const sonTeklifNo = sonTeklif.teklifNo
      const match = sonTeklifNo.match(/TKL-(\d{4})-(\d+)/)
      if (match && match[1] === yil.toString()) {
        siraNo = parseInt(match[2]) + 1
      }
    }

    // Benzersiz olup olmadığını kontrol et
    let teklifNo = `TKL-${yil}-${siraNo.toString().padStart(3, "0")}`
    let isUnique = false
    let tekrarSayisi = 0
    
    while (!isUnique && tekrarSayisi < 10) {
      // Bu numara zaten var mı kontrol et
      const existingTeklif = await prisma.teklifler.findUnique({
        where: { teklifNo },
      })
      
      if (!existingTeklif) {
        isUnique = true
      } else {
        siraNo++
        teklifNo = `TKL-${yil}-${siraNo.toString().padStart(3, "0")}`
        tekrarSayisi++
      }
    }
    
    console.log(`Oluşturulan teklif numarası: ${teklifNo}`);
    return teklifNo
  } catch (error) {
    console.error("Teklif numarası oluşturulurken hata oluştu:", error)
    throw new Error("Teklif numarası oluşturulurken bir hata oluştu.")
  }
}

export async function getTeklifler() {
  try {
    const teklifler = await prisma.teklifler.findMany({
      include: {
        musteri: true,
        kullanici: true,
        teklifKalemleri: {
          include: {
            urun: true,
            hizmet: true,
          },
        },
      },
      orderBy: {
        olusturmaTarihi: "desc",
      },
    })
    
    return { teklifler: serializable(teklifler) }
  } catch (error) {
    console.error("Teklifler getirilirken hata oluştu:", error)
    return { error: "Teklifler getirilirken bir hata oluştu." }
  }
}

export async function getTeklif(id: number) {
  try {
    console.log(`Teklif getiriliyor, ID: ${id}`);
    
    const teklif = await prisma.teklifler.findUnique({
      where: { id },
      include: {
        musteri: {
          include: {
            ilgiliKisiler: true
          }
        },
        kullanici: true,
        teklifKalemleri: {
          include: {
            urun: {
              include: {
                grup: true
              }
            },
            hizmet: {
              include: {
                grup: true
              }
            },
          },
        },
      },
    });
    
    if (!teklif) {
      console.log(`Teklif bulunamadı, ID: ${id}`);
      return { error: "Teklif bulunamadı" };
    }
    
    console.log(`Teklif başarıyla getirildi, ID: ${id}, Müşteri ID: ${teklif.musteriId}`);
    console.log(`Müşteri bilgisi: ${JSON.stringify(teklif.musteri || 'Müşteri bilgisi bulunamadı')}`);
    
    return { teklif: serializable(teklif) };
  } catch (error) {
    console.error("Teklif getirilirken hata oluştu:", error);
    return { error: "Teklif getirilirken bir hata oluştu." };
  }
}

export async function getMusteriTeklifleri(musteriId: number) {
  try {
    const teklifler = await prisma.teklifler.findMany({
      where: { musteriId },
      include: {
        kullanici: true,
        teklifKalemleri: true,
      },
      orderBy: {
        olusturmaTarihi: "desc",
      },
    })

    // Decimal değerleri number'a dönüştür
    const formattedTeklifler = teklifler.map(teklif => ({
      ...teklif,
      toplamTutar: Number(teklif.toplamTutar),
      teklifKalemleri: teklif.teklifKalemleri.map(kalem => ({
        ...kalem,
        birimFiyat: Number(kalem.birimFiyat)
      }))
    }))

    return { teklifler: formattedTeklifler }
  } catch (error) {
    return { error: "Müşteri teklifleri yüklenirken bir hata oluştu." }
  }
}

export async function createTeklif(data: CreateTeklifInput) {
  try {
    console.log("Teklif oluşturma verileri:", JSON.stringify(data, null, 2));

    // Oturum açmış kullanıcı bilgisini al
    const currentUser = await requireAuth();
    
    // Gerekli alan kontrolleri
    if (!data.teklifNo || data.teklifNo.trim() === "") {
      throw new Error("Teklif numarası gereklidir.");
    }

    // Toplam tutarı hesapla
    let toplamTutar = new Decimal(0)
    for (const kalem of data.teklifKalemleri) {
      const tutar = new Decimal(kalem.birimFiyat).mul(kalem.miktar)
      toplamTutar = toplamTutar.add(tutar)
    }

    let isCreated = false;
    let attempts = 0;
    let teklif = null;
    let teklifNo = data.teklifNo;
    
    while (!isCreated && attempts < 3) {
      try {
        // Teklif oluştur
        teklif = await prisma.teklifler.create({
          data: {
            teklifNo: teklifNo,
            baslik: data.baslik,
            musteriId: data.musteriId,
            aciklama: data.aciklama,
            toplamTutar,
            paraBirimi: data.paraBirimi,
            kurDegeri: data.kurDegeri ? new Decimal(data.kurDegeri) : null,
            kurTarihi: data.kurTarihi ? new Date(data.kurTarihi) : null,
            durum: data.durum,
            sonGecerlilikTarihi: new Date(data.sonGecerlilikTarihi),
            notlar: data.notlar,
            kullaniciId: currentUser.id, // Oturum açmış kullanıcı ID'si
            teklifKalemleri: {
              create: data.teklifKalemleri.map((kalem: {
                kalemTipi: "URUN" | "HIZMET";
                urunId?: number | null;
                hizmetId?: number | null;
                miktar: number;
                birim: string;
                birimFiyat: number;
                kdvOrani: number;
                aciklama?: string | null;
              }) => ({
                kalemTipi: kalem.kalemTipi,
                urunId: kalem.kalemTipi === "URUN" ? kalem.urunId : null,
                hizmetId: kalem.kalemTipi === "HIZMET" ? kalem.hizmetId : null,
                miktar: kalem.miktar,
                birim: kalem.birim,
                birimFiyat: new Decimal(kalem.birimFiyat),
                paraBirimi: data.paraBirimi, // Teklif para birimini kalem için de saklıyoruz
                kdvOrani: kalem.kdvOrani,
                aciklama: kalem.aciklama,
              })),
            },
          },
          include: {
            teklifKalemleri: true,
            musteri: true,
          },
        });
        
        isCreated = true;
      } catch (createError: any) {
        attempts++;
        
        // Teklif numarası çakışması durumunda
        if (createError.code === 'P2002' && createError.meta?.target?.includes('TeklifNo')) {
          console.log(`Teklif numarası çakışması: ${teklifNo}. Yeni numara oluşturuluyor...`);
          // Yeni benzersiz teklif numarası oluştur
          teklifNo = await generateTeklifNo(data.musteriId);
          console.log(`Yeni teklif numarası: ${teklifNo}`);
        } else {
          // Başka bir hata durumunda hatayı fırlat
          throw createError;
        }
      }
    }

    if (!isCreated || !teklif) {
      throw new Error("Teklif oluşturulamadı, maksimum deneme sayısına ulaşıldı.");
    }

    console.log("Oluşturulan teklif:", JSON.stringify(teklif, null, 2));

    revalidatePath("/teklifler");
    return { teklif: serializable(teklif) };
  } catch (error) {
    console.error("Teklif oluşturulurken hata oluştu:", error);
    return { error: error instanceof Error ? error.message : "Teklif oluşturulurken bir hata oluştu." };
  }
}

export async function updateTeklif(id: number, data: UpdateTeklifInput) {
  try {
    console.log("Teklif güncelleme verileri:", JSON.stringify(data, null, 2));

    // Oturum açmış kullanıcı bilgisini al
    const currentUser = await requireAuth();

    // Teklifi bul
    const existingTeklif = await prisma.teklifler.findUnique({
      where: { id },
      include: {
        teklifKalemleri: true,
        musteri: true,
      }
    });

    if (!existingTeklif) {
      throw new Error(`Teklif bulunamadı (ID: ${id})`);
    }

    console.log(`Mevcut teklif bulundu, ID: ${id}, Müşteri ID: ${existingTeklif.musteriId}`);
    console.log(`Müşteri bilgisi: ${JSON.stringify(existingTeklif.musteri || 'Müşteri bilgisi bulunamadı')}`);

    // Transaction ile işlemi gerçekleştir
    const updatedTeklif = await prisma.$transaction(async (tx) => {
      // Mevcut teklif kalemlerini sil
      if (data.teklifKalemleri && data.teklifKalemleri.length > 0) {
        console.log(`Teklif kalemleri (${data.teklifKalemleri.length}) güncelleniyor...`);
        
        await tx.teklifKalemleri.deleteMany({
          where: { teklifId: id },
        })
        
        // Toplam tutarı hesapla
        let toplamTutar = new Decimal(0)
        for (const kalem of data.teklifKalemleri) {
          const tutar = new Decimal(kalem.birimFiyat).mul(kalem.miktar)
          toplamTutar = toplamTutar.add(tutar)
        }
        
        // Teklifi ve kalemleri güncelle
        const updatedTeklif = await tx.teklifler.update({
          where: { id },
          data: {
            teklifNo: data.teklifNo || existingTeklif.teklifNo,
            baslik: data.baslik || existingTeklif.baslik,
            musteriId: data.musteriId || existingTeklif.musteriId,
            aciklama: data.aciklama,
            toplamTutar,
            paraBirimi: data.paraBirimi || existingTeklif.paraBirimi,
            kurDegeri: data.kurDegeri !== undefined 
              ? data.kurDegeri !== null
                ? new Decimal(data.kurDegeri)
                : null
              : existingTeklif.kurDegeri,
            kurTarihi: data.kurTarihi !== undefined 
              ? data.kurTarihi !== null 
                ? new Date(data.kurTarihi) 
                : null 
              : existingTeklif.kurTarihi,
            durum: data.durum || existingTeklif.durum,
            sonGecerlilikTarihi: data.sonGecerlilikTarihi 
              ? new Date(data.sonGecerlilikTarihi) 
              : existingTeklif.sonGecerlilikTarihi,
            notlar: data.notlar,
            kullaniciId: currentUser.id, // Güncelleyen kullanıcı kimliği
            teklifKalemleri: {
              create: data.teklifKalemleri.map((kalem: {
                kalemTipi: "URUN" | "HIZMET";
                urunId?: number | null;
                hizmetId?: number | null;
                miktar: number;
                birim: string;
                birimFiyat: number;
                kdvOrani: number;
                aciklama?: string | null;
              }) => ({
                kalemTipi: kalem.kalemTipi,
                urunId: kalem.kalemTipi === "URUN" ? kalem.urunId : null,
                hizmetId: kalem.kalemTipi === "HIZMET" ? kalem.hizmetId : null,
                miktar: kalem.miktar,
                birim: kalem.birim,
                birimFiyat: new Decimal(kalem.birimFiyat),
                paraBirimi: data.paraBirimi || existingTeklif.paraBirimi, // Teklif para birimini kalem için de saklıyoruz
                kdvOrani: kalem.kdvOrani,
                aciklama: kalem.aciklama,
              })),
            },
          },
          include: {
            teklifKalemleri: true,
            musteri: true,
          },
        });
        
        console.log("Teklif başarıyla güncellendi:", updatedTeklif.id);
        return updatedTeklif;
      } else {
        console.log("Sadece teklif bilgileri güncelleniyor...");

        // Sadece teklif bilgilerini güncelle
        const updatedTeklif = await tx.teklifler.update({
          where: { id },
          data: {
            teklifNo: data.teklifNo || existingTeklif.teklifNo,
            baslik: data.baslik || existingTeklif.baslik,
            musteriId: data.musteriId || existingTeklif.musteriId,
            aciklama: data.aciklama,
            paraBirimi: data.paraBirimi || existingTeklif.paraBirimi,
            kurDegeri: data.kurDegeri !== undefined 
              ? data.kurDegeri !== null 
                ? new Decimal(data.kurDegeri) 
                : null 
              : existingTeklif.kurDegeri,
            kurTarihi: data.kurTarihi !== undefined 
              ? data.kurTarihi !== null 
                ? new Date(data.kurTarihi) 
                : null 
              : existingTeklif.kurTarihi,
            durum: data.durum || existingTeklif.durum,
            sonGecerlilikTarihi: data.sonGecerlilikTarihi 
              ? new Date(data.sonGecerlilikTarihi) 
              : existingTeklif.sonGecerlilikTarihi,
            notlar: data.notlar,
            kullaniciId: currentUser.id, // Güncelleyen kullanıcı kimliği
          },
          include: {
            teklifKalemleri: true,
            musteri: true,
          },
        });

        console.log("Teklif bilgileri başarıyla güncellendi:", updatedTeklif.id);
        return updatedTeklif;
      }
    });
    
    // Transaction sonrası güncellenmiş teklifi tüm ilişkili verileriyle birlikte getir
    const fullUpdatedTeklif = await prisma.teklifler.findUnique({
      where: { id },
      include: {
        musteri: {
          include: {
            ilgiliKisiler: true
          }
        },
        kullanici: true,
        teklifKalemleri: {
          include: {
            urun: {
              include: {
                grup: true
              }
            },
            hizmet: {
              include: {
                grup: true
              }
            },
          },
        },
      },
    });
    
    console.log("Güncellenmiş teklif tam veri ile alındı");
    console.log(`Müşteri bilgisi: ${JSON.stringify(fullUpdatedTeklif?.musteri || 'Müşteri bilgisi bulunamadı')}`);
    
    revalidatePath("/teklifler");
    console.log("Güncelleme tamamlandı, sonuç:", id);
    return { teklif: serializable(fullUpdatedTeklif) };
  } catch (error) {
    console.error("Teklif güncellenirken hata oluştu:", error);
    return { error: error instanceof Error ? error.message : "Teklif güncellenirken bir hata oluştu." };
  }
}

export async function deleteTeklif(id: number) {
  try {
    const teklif = await prisma.teklifler.delete({
      where: { id },
    })
    revalidatePath("/teklifler")
    return { teklif }
  } catch (error) {
    console.error("Teklif silinirken hata oluştu:", error)
    return { error: "Teklif silinirken bir hata oluştu." }
  }
}

export async function updateTeklifDurumu(id: number, durum: string) {
  try {
    const teklif = await prisma.teklifler.update({
      where: { id },
      data: { durum },
    })
    revalidatePath("/teklifler")
    revalidatePath(`/musteriler/${teklif.musteriId}`)
    revalidatePath(`/teklifler/${id}`)
    return { success: true }
  } catch (error) {
    return { error: "Teklif durumu güncellenirken bir hata oluştu." }
  }
}

export async function searchMusteriler(query: string) {
  try {
    if (query.length < 2) {
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
                ],
              },
            ],
          },
          // Kurumsal müşteri araması
          {
            AND: [
              { musteriTipi: "KURUMSAL" },
              { firmaAdi: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      include: {
        ilgiliKisiler: true,
      },
      take: 5,
    })

    return { musteriler }
  } catch (error) {
    console.error("Müşteri araması yapılırken hata oluştu:", error)
    return { error: "Müşteri araması yapılırken bir hata oluştu." }
  }
} 