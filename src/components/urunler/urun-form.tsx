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
    kdvOrani: number
    aciklama: string | null
    aktif: boolean
  }
  gruplar: {
    id: number
    grupKodu: string
    grupAdi: string
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

export function UrunForm({ urun, gruplar }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      urunKodu: urun?.urunKodu || "",
      urunAdi: urun?.urunAdi || "",
      grupId: urun?.grupId || 0,
      birim: urun?.birim || "",
      birimFiyat: urun?.birimFiyat || 0,
      kdvOrani: urun?.kdvOrani || 0,
      aciklama: urun?.aciklama || "",
      aktif: urun?.aktif ?? true,
    },
  })

  useEffect(() => {
    async function loadGruplar() {
      try {
        const result = await getUrunHizmetGruplari()
        if (result.error) {
          toast.error(result.error)
        } else if (result.gruplar) {
          setGruplar(result.gruplar.filter(g => g.grupTipi === "URUN"))
        }
      } catch (error) {
        toast.error("Gruplar yüklenirken bir hata oluştu")
      } finally {
        setIsLoading(false)
      }
    }

    loadGruplar()
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (urun) {
        const { error } = await updateUrun(urun.id, values)
        if (error) {
          toast.error(error)
          return
        }
        toast.success("Ürün başarıyla güncellendi.")
      } else {
        const { error } = await createUrun(values)
        if (error) {
          toast.error(error)
          return
        }
        toast.success("Ürün başarıyla oluşturuldu.")
      }
      router.push("/urunler")
      router.refresh()
    } catch (error) {
      toast.error("Bir hata oluştu.")
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
                    {gruplar.map((grup) => (
                      <SelectItem key={grup.id} value={grup.id.toString()}>
                        {grup.grupAdi}
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
            name="birim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Birim</FormLabel>
                <FormControl>
                  <Input placeholder="Birim" {...field} />
                </FormControl>
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