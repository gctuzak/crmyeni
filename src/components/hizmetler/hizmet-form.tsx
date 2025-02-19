"use client"

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
import { createHizmet, updateHizmet } from "@/lib/actions/hizmet"
import { toast } from "sonner"
import { UrunHizmetGruplari } from "@prisma/client"

const formSchema = z.object({
  hizmetKodu: z.string().min(1, {
    message: "Hizmet kodu zorunludur.",
  }),
  hizmetAdi: z.string().min(1, {
    message: "Hizmet adı zorunludur.",
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
  hizmet?: {
    id: number
    hizmetKodu: string
    hizmetAdi: string
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
  "SAAT",
  "GUN",
  "HAFTA",
  "AY",
  "YIL",
  "ADET",
  "PAKET",
]

export function HizmetForm({ hizmet, gruplar }: Props) {
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hizmetKodu: hizmet?.hizmetKodu || "",
      hizmetAdi: hizmet?.hizmetAdi || "",
      grupId: hizmet?.grupId || 0,
      birim: hizmet?.birim || "",
      birimFiyat: hizmet?.birimFiyat || 0,
      kdvOrani: hizmet?.kdvOrani || 0,
      aciklama: hizmet?.aciklama || "",
      aktif: hizmet?.aktif ?? true,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (hizmet) {
        const { error } = await updateHizmet(hizmet.id, values)
        if (error) {
          toast.error(error)
          return
        }
        toast.success("Hizmet başarıyla güncellendi.")
      } else {
        const { error } = await createHizmet(values)
        if (error) {
          toast.error(error)
          return
        }
        toast.success("Hizmet başarıyla oluşturuldu.")
      }
      router.push("/hizmetler")
      router.refresh()
    } catch (error) {
      toast.error("Bir hata oluştu.")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="hizmetKodu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hizmet Kodu</FormLabel>
                <FormControl>
                  <Input placeholder="Hizmet kodu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hizmetAdi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hizmet Adı</FormLabel>
                <FormControl>
                  <Input placeholder="Hizmet adı" {...field} />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  Hizmetin aktif olup olmadığını belirler.
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
          {hizmet ? "Güncelle" : "Oluştur"}
        </Button>
      </form>
    </Form>
  )
} 