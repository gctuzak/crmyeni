"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { getTeklifKalemUrunleri, getTeklifKalemHizmetleri } from "@/lib/actions/urun"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash } from "lucide-react"
import { createTeklif, generateTeklifNo, updateTeklif } from "@/lib/actions/teklif"
import { ApiUrun, ApiHizmet, TeklifKalemi, CreateTeklifInput } from "@/lib/types"
import { decimalToNumber, formatTeklifKalemiForApi } from "@/lib/utils"

const formSchema = z.object({
  teklifNo: z.string().min(1, {
    message: "Teklif numarası zorunludur.",
  }),
  baslik: z.string().min(1, {
    message: "Başlık zorunludur.",
  }),
  musteriId: z.coerce.number().min(1, {
    message: "Müşteri seçimi zorunludur.",
  }),
  aciklama: z.string().optional(),
  paraBirimi: z.string().min(1, {
    message: "Para birimi zorunludur.",
  }),
  kurDegeri: z.coerce.number().min(0).nullable().optional(),
  kurTarihi: z.string().nullable().optional(),
  durum: z.string().min(1, {
    message: "Durum seçimi zorunludur.",
  }),
  sonGecerlilikTarihi: z.string().min(1, {
    message: "Son geçerlilik tarihi zorunludur.",
  }),
  notlar: z.string().optional(),
  teklifKalemleri: z.array(z.object({
    kalemTipi: z.enum(["URUN", "HIZMET"]),
    urunId: z.number().optional().nullable(),
    hizmetId: z.number().optional().nullable(),
    miktar: z.number().min(1, "Miktar 1'den küçük olamaz"),
    birim: z.string().min(1, "Birim zorunludur"),
    birimFiyat: z.number().min(0, "Birim fiyat 0'dan küçük olamaz"),
    kdvOrani: z.number().min(0, "KDV oranı 0'dan küçük olamaz"),
    aciklama: z.string().optional().nullable(),
  })).refine((kalemler) => {
    return kalemler.every((kalem) => {
      if (kalem.kalemTipi === "URUN") {
        return !!kalem.urunId
      } else {
        return !!kalem.hizmetId
      }
    })
  }, {
    message: "Her kalem için ürün veya hizmet seçilmelidir"
  }),
})

type FormValues = z.infer<typeof formSchema>

type Props = {
  musteriler?: {
    id: number
    firmaAdi?: string | null
    ad?: string | null
    soyad?: string | null
  }[]
  initialData?: {
    id: number
    musteriId: number
    teklifNo?: string
    baslik: string
    aciklama: string
    paraBirimi: string
    kurDegeri?: number | null
    kurTarihi?: string | null
    durum?: string
    sonGecerlilikTarihi: string
    notlar: string
    teklifKalemleri: any[]
    kullaniciId?: number
  }
}

// Para birimleri
const paraBirimleri = [
  "TRY",
  "USD",
  "EUR",
  "GBP"
]

export function TeklifForm({ musteriler = [], initialData }: Props) {
  const router = useRouter()
  const [urunler, setUrunler] = useState<ApiUrun[]>([])
  const [hizmetler, setHizmetler] = useState<ApiHizmet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [defaultTeklifNo, setDefaultTeklifNo] = useState(initialData?.teklifNo || "")
  const isEditMode = !!initialData

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teklifNo: initialData?.teklifNo || defaultTeklifNo,
      baslik: initialData?.baslik || "",
      musteriId: initialData?.musteriId || 0,
      aciklama: initialData?.aciklama || "",
      paraBirimi: initialData?.paraBirimi || "TRY",
      kurDegeri: initialData?.kurDegeri || null,
      kurTarihi: initialData?.kurTarihi || null,
      durum: initialData?.durum || "HAZIRLANIYOR",
      sonGecerlilikTarihi: initialData?.sonGecerlilikTarihi || "",
      notlar: initialData?.notlar || "",
      teklifKalemleri: initialData?.teklifKalemleri || [],
    },
    mode: "onChange"
  })

  // Teklif kalemlerini izle
  const teklifKalemleri = form.watch("teklifKalemleri")

  useEffect(() => {
    async function loadData() {
      try {
        const [urunlerResult, hizmetlerResult] = await Promise.all([
          getTeklifKalemUrunleri(),
          getTeklifKalemHizmetleri(),
        ])

        if (urunlerResult.error) {
          toast.error(urunlerResult.error)
          return
        }

        if (hizmetlerResult.error) {
          toast.error(hizmetlerResult.error)
          return
        }

        setUrunler(urunlerResult.urunler || [])
        setHizmetler(hizmetlerResult.hizmetler || [])
      } catch (error) {
        toast.error("Veriler yüklenirken bir hata oluştu")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Müşteri seçildiğinde teklif numarası oluştur
  useEffect(() => {
    const musteriId = form.getValues("musteriId")
    if (musteriId && musteriId > 0) {
      generateTeklifNo(musteriId)
        .then(teklifNo => {
          setDefaultTeklifNo(teklifNo)
          form.setValue("teklifNo", teklifNo, { shouldValidate: true })
        })
        .catch(error => {
          console.error("Teklif no oluşturma hatası:", error)
          toast.error("Teklif numarası oluşturulurken bir hata oluştu")
        })
    }
  }, [form, form.watch("musteriId")])

  // defaultTeklifNo değiştiğinde form değerini güncelle
  useEffect(() => {
    if (defaultTeklifNo) {
      form.setValue("teklifNo", defaultTeklifNo)
    }
  }, [defaultTeklifNo, form])

  // initialData değiştiğinde form değerlerini ayarla
  useEffect(() => {
    if (initialData) {
      console.log("Teklif Düzenleme - initialData:", initialData);
      
      // Form değerlerini teker teker ayarla
      form.setValue("teklifNo", initialData.teklifNo || "");
      console.log("TeklifNo ayarlandı:", initialData.teklifNo);
      
      form.setValue("baslik", initialData.baslik || "");
      console.log("Başlık ayarlandı:", initialData.baslik);
      
      form.setValue("musteriId", initialData.musteriId);
      console.log("MüşteriID ayarlandı:", initialData.musteriId);
      
      form.setValue("aciklama", initialData.aciklama || "");
      form.setValue("paraBirimi", initialData.paraBirimi || "TRY");
      form.setValue("durum", initialData.durum || "HAZIRLANIYOR");
      
      if (initialData.sonGecerlilikTarihi) {
        console.log("Orijinal son geçerlilik tarihi:", initialData.sonGecerlilikTarihi);
        form.setValue("sonGecerlilikTarihi", initialData.sonGecerlilikTarihi);
        console.log("Ayarlanan son geçerlilik tarihi:", form.getValues("sonGecerlilikTarihi"));
      }
      
      form.setValue("notlar", initialData.notlar || "");
      
      if (initialData.teklifKalemleri && initialData.teklifKalemleri.length > 0) {
        form.setValue("teklifKalemleri", initialData.teklifKalemleri);
        console.log("Teklif kalemleri ayarlandı:", initialData.teklifKalemleri.length);
      }
      
      if (initialData.kurDegeri !== undefined && initialData.kurDegeri !== null) {
        form.setValue("kurDegeri", initialData.kurDegeri);
      }
      
      if (initialData.kurTarihi) {
        form.setValue("kurTarihi", initialData.kurTarihi);
      }
    }
  }, [initialData, form]);

  // Müşteri bilgilerini konsolda göster (Debug için)
  useEffect(() => {
    if (musteriler && musteriler.length > 0) {
      console.log("Mevcut müşteriler:", musteriler);
      console.log("Form'daki müşteri ID:", form.getValues("musteriId"));
    }
  }, [musteriler, form]);

  const handleAddKalem = (tip: "URUN" | "HIZMET") => {
    const yeniKalem: TeklifKalemi = {
      kalemTipi: tip,
      urunId: null,
      hizmetId: null,
      miktar: 1,
      birim: "",
      birimFiyat: 0,
      kdvOrani: 20,
      aciklama: "",
    }
    form.setValue("teklifKalemleri", [...teklifKalemleri, yeniKalem], {
      shouldValidate: true,
    })
  }

  const handleKalemChange = (
    index: number,
    field: keyof TeklifKalemi,
    value: string | number
  ) => {
    const yeniKalemler = [...teklifKalemleri]
    const kalem = { ...yeniKalemler[index] } as TeklifKalemi

    if (field === "urunId" && value) {
      const urun = urunler.find(u => u.id === Number(value))
      if (urun) {
        kalem.birim = urun.birim
        kalem.birimFiyat = decimalToNumber(urun.birimFiyat)
        kalem.kdvOrani = urun.kdvOrani
      }
    } else if (field === "hizmetId" && value) {
      const hizmet = hizmetler.find(h => h.id === Number(value))
      if (hizmet) {
        kalem.birim = hizmet.birim
        kalem.birimFiyat = decimalToNumber(hizmet.birimFiyat)
        kalem.kdvOrani = hizmet.kdvOrani
      }
    }

    if (field === "kalemTipi" && (value === "URUN" || value === "HIZMET")) {
      kalem.kalemTipi = value
      // Tip değiştiğinde ilgili ID'yi temizle
      if (value === "URUN") {
        kalem.hizmetId = null
      } else {
        kalem.urunId = null
      }
    } else if (field === "birim" || field === "aciklama") {
      kalem[field] = value as string
    } else if (field === "urunId" || field === "hizmetId" || field === "miktar" || field === "birimFiyat" || field === "kdvOrani") {
      kalem[field] = Number(value)
    }

    yeniKalemler[index] = kalem
    form.setValue("teklifKalemleri", yeniKalemler, {
      shouldValidate: true,
    })
  }

  const handleRemoveKalem = (index: number) => {
    const yeniKalemler = [...teklifKalemleri]
    yeniKalemler.splice(index, 1)
    form.setValue("teklifKalemleri", yeniKalemler, {
      shouldValidate: true,
    })
  }

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true);
      console.log("Teklif form değerleri:", values);
      
      // Müşteri seçildiğinden emin olalım
      if (!values.musteriId) {
        toast.error("Lütfen bir müşteri seçin");
        setIsLoading(false);
        return;
      }

      console.log("Seçilen müşteri ID:", values.musteriId);
      
      // API için verileri dönüştür
      const apiValues: CreateTeklifInput = {
        ...values,
        musteriId: Number(values.musteriId), // Müşteri ID'sini number olarak ekleyelim
        teklifKalemleri: values.teklifKalemleri.map(kalem => formatTeklifKalemiForApi(kalem))
      }

      let result;
      if (isEditMode && initialData) {
        console.log("Teklif güncelleniyor, ID:", initialData.id);
        console.log("Gönderilecek veriler:", apiValues);
        
        result = await updateTeklif(initialData.id, apiValues)
        console.log("Teklif güncelleme sonucu:", result);
        
        if (result.error) {
          toast.error(result.error)
          setIsLoading(false);
          return
        }
        toast.success("Teklif başarıyla güncellendi.")
        // Yönlendirmeden önce biraz bekleyelim
        setTimeout(() => {
          router.push("/teklifler");
          router.refresh();
        }, 500);
      } else {
        console.log("Yeni teklif oluşturuluyor");
        console.log("Gönderilecek veriler:", apiValues);
        
        result = await createTeklif(apiValues)
        console.log("Teklif oluşturma sonucu:", result);
        
        if (result.error) {
          toast.error(result.error)
          setIsLoading(false);
          return
        }
        toast.success("Teklif başarıyla oluşturuldu.")
        // Yönlendirmeden önce biraz bekleyelim
        setTimeout(() => {
          router.push("/teklifler");
          router.refresh();
        }, 500);
      }
    } catch (error) {
      console.error("Teklif form gönderim hatası:", error);
      toast.error("Bir hata oluştu.")
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="teklifNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teklif No</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="TKL-2024-001" />
                </FormControl>
                <FormDescription>
                  Otomatik oluşturulur, değiştirebilirsiniz.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="baslik"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Başlık</FormLabel>
                <FormControl>
                  <Input placeholder="Teklif başlığı" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="musteriId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Müşteri</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value ? field.value.toString() : undefined}
                  defaultValue={field.value ? field.value.toString() : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Müşteri seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {musteriler && musteriler.length > 0 ? (
                      musteriler.map((musteri) => (
                        <SelectItem key={musteri.id} value={musteri.id.toString()}>
                          {musteri.firmaAdi || `${musteri.ad || ''} ${musteri.soyad || ''}`}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="0">Müşteri bulunamadı</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paraBirimi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Para Birimi</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Para birimi seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {paraBirimleri.map((paraBirimi) => (
                      <SelectItem key={paraBirimi} value={paraBirimi}>
                        {paraBirimi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kurDegeri"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kur Değeri</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.0001" 
                    placeholder="Kur değeri"
                    value={field.value === null ? '' : field.value}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                </FormControl>
                <FormDescription>
                  Yabancı para birimi ile teklif oluşturuyorsanız kur değerini giriniz.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kurTarihi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kur Tarihi</FormLabel>
                <FormControl>
                  <Input type="date" 
                    value={field.value || ''} 
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="durum"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durum</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Durum seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="HAZIRLANIYOR">Hazırlanıyor</SelectItem>
                    <SelectItem value="BEKLEMEDE">Beklemede</SelectItem>
                    <SelectItem value="ONAYLANDI">Onaylandı</SelectItem>
                    <SelectItem value="REDDEDILDI">Reddedildi</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sonGecerlilikTarihi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Son Geçerlilik Tarihi</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    placeholder="YYYY-MM-DD"
                    value={field.value || ''}
                    onChange={(e) => {
                      console.log("Tarih değişti:", e.target.value);
                      field.onChange(e.target.value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Teklif son geçerlilik tarihi (YYYY-MM-DD formatında)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="aciklama"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Textarea placeholder="Teklif açıklaması" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card>
          <CardHeader>
            <CardTitle>Teklif Kalemleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button type="button" onClick={() => handleAddKalem("URUN")}>
                  Ürün Ekle
                </Button>
                <Button type="button" onClick={() => handleAddKalem("HIZMET")}>
                  Hizmet Ekle
                </Button>
              </div>

              {form.formState.errors.teklifKalemleri?.message && (
                <div className="text-sm font-medium text-destructive">
                  {form.formState.errors.teklifKalemleri.message}
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tip</TableHead>
                    <TableHead>Ürün/Hizmet</TableHead>
                    <TableHead>Miktar</TableHead>
                    <TableHead>Birim</TableHead>
                    <TableHead>Birim Fiyat</TableHead>
                    <TableHead>KDV Oranı</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teklifKalemleri.map((kalem, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Select
                          value={kalem.kalemTipi}
                          onValueChange={(value) => handleKalemChange(index, "kalemTipi", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="URUN">Ürün</SelectItem>
                            <SelectItem value="HIZMET">Hizmet</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={kalem.kalemTipi === "URUN" ? kalem.urunId?.toString() : kalem.hizmetId?.toString()}
                          onValueChange={(value) => handleKalemChange(index, kalem.kalemTipi === "URUN" ? "urunId" : "hizmetId", Number(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {kalem.kalemTipi === "URUN" ? (
                              urunler.map((urun) => (
                                <SelectItem key={urun.id} value={urun.id.toString()}>
                                  {urun.urunKodu} - {urun.urunAdi}
                                </SelectItem>
                              ))
                            ) : (
                              hizmetler.map((hizmet) => (
                                <SelectItem key={hizmet.id} value={hizmet.id.toString()}>
                                  {hizmet.hizmetKodu} - {hizmet.hizmetAdi}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={kalem.miktar}
                          onChange={(e) => handleKalemChange(index, "miktar", Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={kalem.birim}
                          onChange={(e) => handleKalemChange(index, "birim", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={kalem.birimFiyat}
                          onChange={(e) => handleKalemChange(index, "birimFiyat", Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={kalem.kdvOrani}
                          onChange={(e) => handleKalemChange(index, "kdvOrani", Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={kalem.aciklama || ""}
                          onChange={(e) => handleKalemChange(index, "aciklama", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveKalem(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="notlar"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notlar</FormLabel>
              <FormControl>
                <Textarea placeholder="Teklif notları" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/teklifler")}
          >
            İptal
          </Button>
          <Button type="submit">{isEditMode ? "Güncelle" : "Oluştur"}</Button>
        </div>
      </form>
    </Form>
  )
} 