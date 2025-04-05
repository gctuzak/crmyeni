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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { createUrun, getUrunHizmetGruplari, updateUrun } from "@/lib/actions/urun"
import { toast } from "sonner"
import { UrunHizmetGruplari } from "@prisma/client"

const formSchema = z.object({
  urunKodu: z.string().min(1, {
    message: "Ürün kodu zorunludur.",
  }),
  urunAdi: z.string().min(1, {
    message: "Ürün adı zorunludur.",
  }),
  grupId: z.coerce.number().min(1, {
    message: "Grup seçimi zorunludur.",
  }),
  birim: z.string().min(1, {
    message: "Birim zorunludur.",
  }),
  birimFiyat: z.coerce.number().min(0, {
    message: "Birim fiyat 0'dan büyük olmalıdır.",
  }),
  paraBirimi: z.string().min(1, {
    message: "Para birimi zorunludur.",
  }),
  kurBazliFiyat: z.coerce.number().min(0).nullable().optional(),
  kurParaBirimi: z.string().nullable().optional(),
  kdvOrani: z.coerce.number().min(0).max(100, {
    message: "KDV oranı 0-100 arasında olmalıdır.",
  }),
  aciklama: z.string().optional(),
  aktif: z.boolean().default(true),
})

type Props = {
  urun?: {
    id: number
    urunKodu: string
    urunAdi: string
    grupId: number
    birim: string
    birimFiyat: number
    paraBirimi?: string
    kurBazliFiyat?: number | null
    kurParaBirimi?: string | null
    kdvOrani: number
    aciklama: string | null
    aktif: boolean
  }
  gruplar?: {
    id: number
    grupKodu: string
    grupAdi: string
    grupTipi?: string
  }[]
}

const birimler = [
  "ADET",
  "KUTU",
  "PAKET",
  "METRE",
  "M2",
  "M3",
  "KG",
  "GRAM",
  "LITRE",
  "TON",
]

const paraBirimleri = [
  "TRY",
  "USD",
  "EUR",
  "GBP"
]

export function UrunForm({ urun, gruplar }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [localGruplar, setLocalGruplar] = useState<typeof gruplar>(gruplar || [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      urunKodu: urun?.urunKodu || "",
      urunAdi: urun?.urunAdi || "",
      grupId: urun?.grupId || 0,
      birim: urun?.birim || "",
      birimFiyat: urun?.birimFiyat || 0,
      paraBirimi: urun?.paraBirimi || "TRY",
      kurBazliFiyat: urun?.kurBazliFiyat || null,
      kurParaBirimi: urun?.kurParaBirimi || null,
      kdvOrani: urun?.kdvOrani || 0,
      aciklama: urun?.aciklama || "",
      aktif: urun?.aktif ?? true,
    },
  })

  // Grup yükleme fonksiyonu
  async function loadGruplar() {
    try {
      const result = await getUrunHizmetGruplari()
      if (result.error) {
        toast.error(result.error)
      } else if (result.gruplar) {
        setLocalGruplar(result.gruplar.filter(g => g.grupTipi === "URUN"))
      }
    } catch (error) {
      toast.error("Gruplar yüklenirken bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Eğer dışarıdan gruplar gelmezse veritabanından yükle
    if (!gruplar || gruplar.length === 0) {
      setIsLoading(true);
      loadGruplar();
    } else {
      setLocalGruplar(gruplar)
    }
  }, [gruplar])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      console.log("Form değerleri:", values);
      
      // Tüm alanları içeren bir obje oluşturalım
      const formData = {
        urunKodu: values.urunKodu,
        urunAdi: values.urunAdi,
        grupId: values.grupId,
        birim: values.birim,
        birimFiyat: values.birimFiyat,
        paraBirimi: values.paraBirimi,
        kurBazliFiyat: values.kurBazliFiyat,
        kurParaBirimi: values.kurParaBirimi,
        kdvOrani: values.kdvOrani,
        aciklama: values.aciklama,
        aktif: values.aktif,
      };
      
      if (urun) {
        const result = await updateUrun(urun.id, formData)
        console.log("Güncelleme sonucu:", result);
        
        if (result.error) {
          toast.error(result.error)
          setIsLoading(false);
          return
        }
        
        toast.success("Ürün başarıyla güncellendi.")
        // Yönlendirmeden önce biraz bekleyelim
        setTimeout(() => {
          router.push("/urunler");
          router.refresh();
        }, 500);
      } else {
        const result = await createUrun(formData)
        console.log("Oluşturma sonucu:", result);
        
        if (result.error) {
          toast.error(result.error)
          setIsLoading(false);
          return
        }
        
        toast.success("Ürün başarıyla oluşturuldu.")
        // Yönlendirmeden önce biraz bekleyelim
        setTimeout(() => {
          router.push("/urunler");
          router.refresh();
        }, 500);
      }
    } catch (error) {
      console.error("Form gönderim hatası:", error);
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
            name="urunKodu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ürün Kodu</FormLabel>
                <FormControl>
                  <Input placeholder="Ürün kodu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="urunAdi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ürün Adı</FormLabel>
                <FormControl>
                  <Input placeholder="Ürün adı" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="grupId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grup</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Grup seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {localGruplar?.map((grup) => (
                      <SelectItem key={grup.id} value={grup.id.toString()}>
                        {grup.grupAdi}
                      </SelectItem>
                    )) || (
                      <SelectItem value="-1" disabled>
                        Grup bulunamadı
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Birim</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Birim seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {birimler.map((birim) => (
                      <SelectItem key={birim} value={birim}>
                        {birim}
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
            name="birimFiyat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Birim Fiyat</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
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
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || undefined}
                >
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
            name="kurBazliFiyat"
            render={({ field }) => {
              const value = field.value !== null && field.value !== undefined ? String(field.value) : '';
              
              return (
                <FormItem>
                  <FormLabel>Kur Bazlı Fiyat</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      value={value} 
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : Number(e.target.value);
                        field.onChange(val);
                      }} 
                      onBlur={field.onBlur}
                      disabled={field.disabled}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="kurParaBirimi"
            render={({ field }) => {
              const value = field.value !== null && field.value !== undefined ? field.value : '';
              
              return (
                <FormItem>
                  <FormLabel>Kur Para Birimi</FormLabel>
                  <Select 
                    onValueChange={(val) => field.onChange(val || null)} 
                    value={value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Kur para birimi seçin" />
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
              );
            }}
          />
          <FormField
            control={form.control}
            name="kdvOrani"
            render={({ field }) => (
              <FormItem>
                <FormLabel>KDV Oranı</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormDescription>0-100 arasında bir değer girin.</FormDescription>
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
                <Textarea placeholder="Açıklama" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="aktif"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Aktif</FormLabel>
                <FormDescription>
                  Ürünün aktif olup olmadığını belirler.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">
          {urun ? "Güncelle" : "Oluştur"}
        </Button>
      </form>
    </Form>
  )
} 