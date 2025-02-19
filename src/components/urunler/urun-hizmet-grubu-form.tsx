"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
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
import { createUrunHizmetGrubu } from "@/lib/actions/urun"
import { toast } from "sonner"
import { UrunHizmetGruplari } from "@prisma/client"

const formSchema = z.object({
  grupKodu: z.string().min(1, "Kod alanı zorunludur"),
  grupAdi: z.string().min(1, "Ad alanı zorunludur"),
  grupTipi: z.enum(["URUN", "HIZMET"]),
  aciklama: z.string().nullable(),
  aktif: z.boolean().default(true),
  sira: z.number().min(0, "Sıra numarası 0'dan küçük olamaz"),
  ustGrupId: z.number().nullable(),
})

type FormValues = z.infer<typeof formSchema>

interface FieldProps {
  field: {
    value: any
    onChange: (value: any) => void
  }
}

export function UrunHizmetGrubuForm() {
  const router = useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      aktif: true,
      sira: 0,
      aciklama: null,
      ustGrupId: null,
    },
  })

  async function onSubmit(data: FormValues) {
    try {
      const result = await createUrunHizmetGrubu(data)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Grup başarıyla oluşturuldu")
        router.push("/urunler/gruplar")
        router.refresh()
      }
    } catch (error) {
      toast.error("Grup oluşturulurken bir hata oluştu")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="grupKodu"
            render={({ field }: FieldProps) => (
              <FormItem>
                <FormLabel>Kod</FormLabel>
                <FormControl>
                  <Input placeholder="Grup kodu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="grupAdi"
            render={({ field }: FieldProps) => (
              <FormItem>
                <FormLabel>Ad</FormLabel>
                <FormControl>
                  <Input placeholder="Grup adı" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="grupTipi"
            render={({ field }: FieldProps) => (
              <FormItem>
                <FormLabel>Tip</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Grup tipi seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="URUN">Ürün</SelectItem>
                    <SelectItem value="HIZMET">Hizmet</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sira"
            render={({ field }: FieldProps) => (
              <FormItem>
                <FormLabel>Sıra No</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Sıra numarası"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="aciklama"
          render={({ field }: FieldProps) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Textarea placeholder="Grup açıklaması" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="aktif"
          render={({ field }: FieldProps) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Aktif</FormLabel>
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

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/urunler/gruplar")}
          >
            İptal
          </Button>
          <Button type="submit">Kaydet</Button>
        </div>
      </form>
    </Form>
  )
} 