import { Decimal } from "@prisma/client/runtime/library"

// Servis tipinden dönen ürün tipini tanımlıyoruz
export interface ApiUrun {
  id: number
  urunKodu: string
  urunAdi: string
  grupId: number
  birim: string
  birimFiyat: Decimal | number | { toString: () => string }
  kdvOrani: number
  aciklama: string | null
  aktif: boolean
  grup?: {
    id: number
    grupKodu: string
    grupAdi: string
  }
}

// Form için kullanılan ürün tipini tanımlıyoruz
export interface Urun extends Omit<ApiUrun, 'birimFiyat'> {
  birimFiyat: number
}

// Servis tipinden dönen hizmet tipini tanımlıyoruz
export interface ApiHizmet {
  id: number
  hizmetKodu: string
  hizmetAdi: string
  grupId: number
  birim: string
  birimFiyat: Decimal | number | { toString: () => string }
  kdvOrani: number
  aciklama: string | null
  aktif: boolean
  grup?: {
    id: number
    grupKodu: string
    grupAdi: string
  }
}

// Form için kullanılan hizmet tipini tanımlıyoruz
export interface Hizmet extends Omit<ApiHizmet, 'birimFiyat'> {
  birimFiyat: number
}

export interface UrunHizmetGrubu {
  id: number
  grupTipi: string
  grupKodu: string
  grupAdi: string
  aciklama: string | null
  aktif: boolean
  sira: number
  ustGrupId: number | null
}

// Form tarafında kullanılan teklif kalemi tipi
export interface TeklifKalemi {
  kalemTipi: "URUN" | "HIZMET"
  urunId?: number | null
  hizmetId?: number | null
  miktar: number
  birim: string
  birimFiyat: number
  kdvOrani: number
  aciklama?: string | null
}

// API'ye gönderilen teklif kalemi tipi
export interface ApiTeklifKalemi {
  kalemTipi: "URUN" | "HIZMET"
  urunId?: number
  hizmetId?: number
  miktar: number
  birim: string
  birimFiyat: number
  kdvOrani: number
  aciklama?: string | null
}

export interface CreateTeklifInput {
  teklifNo: string
  baslik: string
  musteriId: number
  aciklama?: string | null
  paraBirimi: string
  durum: string
  sonGecerlilikTarihi: string
  notlar?: string | null
  teklifKalemleri: ApiTeklifKalemi[]
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface LoadingState {
  isLoading: boolean
  error: string | null
} 