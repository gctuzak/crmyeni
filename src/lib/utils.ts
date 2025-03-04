import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Decimal } from "@prisma/client/runtime/library"
import { ApiHizmet, ApiUrun, Hizmet, Urun, TeklifKalemi, ApiTeklifKalemi } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount)
}

/**
 * Decimal içeren verileri (objeler, diziler) JSON serileştirilebilir hale getirir
 * Bu fonksiyon, Next.js'in Server Component'lerinden Client Component'lere aktarım sırasındaki
 * "Only plain objects can be passed to Client Components from Server Components. Decimal objects are not supported."
 * hatasını çözmek için kullanılır.
 */
export function serializable<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  
  // Array'leri işle
  if (Array.isArray(data)) {
    return data.map(item => serializable(item)) as unknown as T;
  }
  
  // Object'leri işle
  if (typeof data === 'object') {
    // Date objesi ise dokunma
    if (data instanceof Date) {
      return data;
    }
    
    // Decimal objesi ise veya toString metodu varsa
    if ('toString' in data && typeof data.toString === 'function') {
      // Prisma Decimal tipini kontrol et
      if (
        // Prisma Decimal özellikleri
        's' in data || 
        'e' in data || 
        'd' in data
      ) {
        // Number'a dönüştür
        return Number(data.toString()) as unknown as T;
      }
    }
    
    // Object'in tüm property'lerini dönüştür
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = serializable(value);
    }
    
    return result as T;
  }
  
  // Primitive değerleri olduğu gibi döndür
  return data;
}

/**
 * Decimal veri tipini number'a dönüştürür
 */
export function decimalToNumber(decimal: Decimal | number | null | undefined | { toString: () => string }): number {
  if (decimal === null || decimal === undefined) return 0
  if (typeof decimal === "number") return decimal
  return Number(decimal.toString())
}

/**
 * Ürün verilerini form için uygun tipe dönüştürür
 */
export function formatUrunForForm(urun: ApiUrun): Urun {
  return {
    ...urun,
    birimFiyat: decimalToNumber(urun.birimFiyat)
  }
}

/**
 * Hizmet verilerini form için uygun tipe dönüştürür
 */
export function formatHizmetForForm(hizmet: ApiHizmet): Hizmet {
  return {
    ...hizmet,
    birimFiyat: decimalToNumber(hizmet.birimFiyat)
  }
}

/**
 * Teklif kalemini API formatına dönüştürür
 */
export function formatTeklifKalemiForApi(kalem: TeklifKalemi): ApiTeklifKalemi {
  const apiKalem: ApiTeklifKalemi = {
    kalemTipi: kalem.kalemTipi,
    miktar: kalem.miktar,
    birim: kalem.birim,
    birimFiyat: kalem.birimFiyat,
    kdvOrani: kalem.kdvOrani,
    aciklama: kalem.aciklama
  }
  
  if (kalem.kalemTipi === "URUN" && kalem.urunId) {
    apiKalem.urunId = kalem.urunId
  } else if (kalem.kalemTipi === "HIZMET" && kalem.hizmetId) {
    apiKalem.hizmetId = kalem.hizmetId
  }
  
  return apiKalem
}

/**
 * Oran formatında yüzde gösterir (örn: %20)
 */
export function formatPercent(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value / 100)
} 