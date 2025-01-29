"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { firsatSchema, type FirsatForm as FirsatFormType, FIRSAT_ASAMALARI, OLASILIK_DEGERLERI } from "@/lib/validations/firsat"
import { createFirsat, updateFirsat } from "@/lib/actions/firsat"

interface FirsatFormProps {
  initialData?: FirsatFormType & { id: number }
}

export function FirsatForm({ initialData }: FirsatFormProps) {
  const router = useRouter()
  const form = useForm<FirsatFormType>({
    resolver: zodResolver(firsatSchema),
    defaultValues: initialData || {
      musteriId: undefined,
      baslik: "",
      beklenenKapanisTarihi: "",
      asamaId: FIRSAT_ASAMALARI[0].id,
      olasilik: OLASILIK_DEGERLERI[0].deger,
    },
  })

  async function onSubmit(data: FirsatFormType) {
    try {
      if (initialData) {
        const result = await updateFirsat(initialData.id, data)
        if (result.error) {
          // TODO: Hata gösterimi ekle
          console.error(result.error)
          return
        }
      } else {
        const result = await createFirsat(data)
        if (result.error) {
          // TODO: Hata gösterimi ekle
          console.error(result.error)
          return
        }
      }
      router.push("/firsatlar")
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
          <Label htmlFor="beklenenKapanisTarihi">Beklenen Kapanış Tarihi</Label>
          <Input
            id="beklenenKapanisTarihi"
            type="datetime-local"
            {...form.register("beklenenKapanisTarihi")}
          />
          {form.formState.errors.beklenenKapanisTarihi && (
            <p className="text-sm text-red-500">
              {form.formState.errors.beklenenKapanisTarihi.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="asamaId">Aşama</Label>
          <Select
            defaultValue={form.getValues("asamaId").toString()}
            onValueChange={(value) => form.setValue("asamaId", parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Aşama seçin" />
            </SelectTrigger>
            <SelectContent>
              {FIRSAT_ASAMALARI.map((asama) => (
                <SelectItem key={asama.id} value={asama.id.toString()}>
                  {asama.asamaAdi}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.asamaId && (
            <p className="text-sm text-red-500">
              {form.formState.errors.asamaId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="olasilik">Olasılık</Label>
          <Select
            defaultValue={form.getValues("olasilik").toString()}
            onValueChange={(value) => form.setValue("olasilik", parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Olasılık seçin" />
            </SelectTrigger>
            <SelectContent>
              {OLASILIK_DEGERLERI.map((olasilik) => (
                <SelectItem key={olasilik.deger} value={olasilik.deger.toString()}>
                  {olasilik.etiket}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.olasilik && (
            <p className="text-sm text-red-500">
              {form.formState.errors.olasilik.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/firsatlar")}
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