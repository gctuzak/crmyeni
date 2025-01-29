"use client"

import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { teklifSchema, type TeklifForm as TeklifFormType, PARA_BIRIMLERI, BIRIMLER, KDV_ORANLARI } from "@/lib/validations/teklif"
import { createTeklif, updateTeklif } from "@/lib/actions/teklif"
import { Plus, Trash2 } from "lucide-react"

interface TeklifFormProps {
  initialData?: TeklifFormType & { id: number }
}

export function TeklifForm({ initialData }: TeklifFormProps) {
  const router = useRouter()
  const form = useForm<TeklifFormType>({
    resolver: zodResolver(teklifSchema),
    defaultValues: initialData || {
      musteriId: undefined,
      baslik: "",
      aciklama: "",
      paraBirimi: "TRY",
      sonGecerlilikTarihi: "",
      kullaniciId: 1, // TODO: Gerçek kullanıcı ID'sini kullan
      notlar: "",
      teklifKalemleri: [
        {
          urunAdi: "",
          miktar: 1,
          birim: "Adet",
          birimFiyat: 0,
          kdvOrani: 18,
          aciklama: "",
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "teklifKalemleri",
  })

  async function onSubmit(data: TeklifFormType) {
    try {
      if (initialData) {
        const result = await updateTeklif(initialData.id, data)
        if (result.error) {
          // TODO: Hata gösterimi ekle
          console.error(result.error)
          return
        }
      } else {
        const result = await createTeklif(data)
        if (result.error) {
          // TODO: Hata gösterimi ekle
          console.error(result.error)
          return
        }
      }
      router.push("/teklifler")
    } catch (error) {
      console.error("Form gönderilirken bir hata oluştu:", error)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="musteriId">Müşteri</Label>
          {/* TODO: Müşteri seçimi için combobox ekle */}
          <Input
            id="musteriId"
            type="number"
            {...form.register("musteriId", { valueAsNumber: true })}
          />
          {form.formState.errors.musteriId && (
            <p className="text-sm text-red-500">
              {form.formState.errors.musteriId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="baslik">Başlık</Label>
          <Input
            id="baslik"
            {...form.register("baslik")}
          />
          {form.formState.errors.baslik && (
            <p className="text-sm text-red-500">
              {form.formState.errors.baslik.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="paraBirimi">Para Birimi</Label>
          <Select
            defaultValue={form.getValues("paraBirimi")}
            onValueChange={(value) => form.setValue("paraBirimi", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Para birimi seçin" />
            </SelectTrigger>
            <SelectContent>
              {PARA_BIRIMLERI.map((birim) => (
                <SelectItem key={birim} value={birim}>
                  {birim}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.paraBirimi && (
            <p className="text-sm text-red-500">
              {form.formState.errors.paraBirimi.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sonGecerlilikTarihi">Son Geçerlilik Tarihi</Label>
          <Input
            id="sonGecerlilikTarihi"
            type="datetime-local"
            {...form.register("sonGecerlilikTarihi")}
          />
          {form.formState.errors.sonGecerlilikTarihi && (
            <p className="text-sm text-red-500">
              {form.formState.errors.sonGecerlilikTarihi.message}
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="aciklama">Açıklama</Label>
          <Textarea
            id="aciklama"
            {...form.register("aciklama")}
            placeholder="Teklif açıklaması"
            rows={4}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Teklif Kalemleri</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({
              urunAdi: "",
              miktar: 1,
              birim: "Adet",
              birimFiyat: 0,
              kdvOrani: 18,
              aciklama: "",
            })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Kalem Ekle
          </Button>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="p-4 border rounded-lg space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Kalem #{index + 1}</h3>
              {index > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`teklifKalemleri.${index}.urunAdi`}>
                  Ürün Adı
                </Label>
                <Input
                  id={`teklifKalemleri.${index}.urunAdi`}
                  {...form.register(`teklifKalemleri.${index}.urunAdi`)}
                />
                {form.formState.errors.teklifKalemleri?.[index]?.urunAdi && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.teklifKalemleri[index]?.urunAdi?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`teklifKalemleri.${index}.miktar`}>
                  Miktar
                </Label>
                <Input
                  id={`teklifKalemleri.${index}.miktar`}
                  type="number"
                  min="1"
                  {...form.register(`teklifKalemleri.${index}.miktar`, { valueAsNumber: true })}
                />
                {form.formState.errors.teklifKalemleri?.[index]?.miktar && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.teklifKalemleri[index]?.miktar?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`teklifKalemleri.${index}.birim`}>
                  Birim
                </Label>
                <Select
                  defaultValue={form.getValues(`teklifKalemleri.${index}.birim`)}
                  onValueChange={(value) => form.setValue(`teklifKalemleri.${index}.birim`, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Birim seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {BIRIMLER.map((birim) => (
                      <SelectItem key={birim} value={birim}>
                        {birim}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.teklifKalemleri?.[index]?.birim && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.teklifKalemleri[index]?.birim?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`teklifKalemleri.${index}.birimFiyat`}>
                  Birim Fiyat
                </Label>
                <Input
                  id={`teklifKalemleri.${index}.birimFiyat`}
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register(`teklifKalemleri.${index}.birimFiyat`, { valueAsNumber: true })}
                />
                {form.formState.errors.teklifKalemleri?.[index]?.birimFiyat && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.teklifKalemleri[index]?.birimFiyat?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`teklifKalemleri.${index}.kdvOrani`}>
                  KDV Oranı (%)
                </Label>
                <Select
                  defaultValue={form.getValues(`teklifKalemleri.${index}.kdvOrani`).toString()}
                  onValueChange={(value) => form.setValue(`teklifKalemleri.${index}.kdvOrani`, parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="KDV oranı seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {KDV_ORANLARI.map((oran) => (
                      <SelectItem key={oran} value={oran.toString()}>
                        %{oran}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.teklifKalemleri?.[index]?.kdvOrani && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.teklifKalemleri[index]?.kdvOrani?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`teklifKalemleri.${index}.aciklama`}>
                  Açıklama
                </Label>
                <Input
                  id={`teklifKalemleri.${index}.aciklama`}
                  {...form.register(`teklifKalemleri.${index}.aciklama`)}
                />
              </div>
            </div>
          </div>
        ))}

        {form.formState.errors.teklifKalemleri && (
          <p className="text-sm text-red-500">
            {form.formState.errors.teklifKalemleri.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notlar">Notlar</Label>
        <Textarea
          id="notlar"
          {...form.register("notlar")}
          placeholder="Teklif ile ilgili notlar"
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/teklifler")}
        >
          İptal
        </Button>
        <Button type="submit">
          {initialData ? "Güncelle" : "Kaydet"}
        </Button>
      </div>
    </form>
  )
} 