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