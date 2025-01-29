"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MusteriSecici } from "./musteri-secici"
import { IlgiliKisiSecici } from "./ilgili-kisi-secici"
import { TeklifKalemleri } from "./teklif-kalemleri"
import { teklifSchema, type TeklifForm } from "@/lib/validations/teklif"
import { createTeklif, updateTeklif, generateTeklifNo } from "@/lib/actions/teklif"
import { PARA_BIRIMLERI, TEKLIF_DURUMLARI } from "@/lib/validations/teklif"
import type { Musteriler, IlgiliKisiler } from "@prisma/client"
import { getMusteri } from "@/lib/actions/musteri"

interface TeklifFormProps {
  initialData?: TeklifForm & { id: number }
  currentUser: {
    id: number
    rolId: number
  }
}

export function TeklifForm({ initialData, currentUser }: TeklifFormProps) {
  const router = useRouter()
  const [selectedMusteri, setSelectedMusteri] = useState<(Musteriler & {
    ilgiliKisiler: IlgiliKisiler[]
  }) | null>(null)
  const [teklifNo, setTeklifNo] = useState<string>("")

  const form = useForm<TeklifForm>({
    resolver: zodResolver(teklifSchema),
    defaultValues: initialData || {
      musteriId: undefined,
      ilgiliKisiId: undefined,
      baslik: "",
      aciklama: "",
      paraBirimi: "TRY",
      durum: "Taslak",
      sonGecerlilikTarihi: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün sonra
      notlar: "",
      teklifKalemleri: [],
    },
  })

  // Müşteri seçildiğinde teklif numarası oluştur
  useEffect(() => {
    async function loadTeklifNo() {
      const musteriId = form.watch("musteriId")
      if (musteriId) {
        const yeniTeklifNo = await generateTeklifNo(musteriId)
        setTeklifNo(yeniTeklifNo)
      } else {
        setTeklifNo("")
      }
    }
    loadTeklifNo()
  }, [form.watch("musteriId")])

  // Sayfa yüklendiğinde veya düzenleme modunda initialData varsa müşteri bilgilerini getir
  useEffect(() => {
    async function loadMusteri() {
      if (initialData?.musteriId) {
        const { musteri } = await getMusteri(initialData.musteriId)
        if (musteri) {
          setSelectedMusteri(musteri)
        }
      }
    }
    loadMusteri()
  }, [initialData?.musteriId])

  async function onSubmit(data: TeklifForm) {
    try {
      if (initialData) {
        const result = await updateTeklif(initialData.id, data)
        if (result.error) {
          console.error(result.error)
          return
        }
      } else {
        const result = await createTeklif(data)
        if (result.error) {
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
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Müşteri</Label>
          <MusteriSecici
            value={form.watch("musteriId")}
            onValueChange={(value, musteri) => {
              form.setValue("musteriId", value, { shouldValidate: true })
              form.setValue("ilgiliKisiId", undefined)
              setSelectedMusteri(musteri)
            }}
          />
          {form.formState.errors.musteriId && (
            <p className="text-sm text-red-500">
              {form.formState.errors.musteriId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>İlgili Kişi</Label>
          <IlgiliKisiSecici
            value={form.watch("ilgiliKisiId")}
            onValueChange={(value) => form.setValue("ilgiliKisiId", value)}
            ilgiliKisiler={selectedMusteri?.ilgiliKisiler || []}
            disabled={!selectedMusteri}
          />
        </div>

        <div className="space-y-2">
          <Label>Teklif No</Label>
          <Input
            value={teklifNo}
            readOnly
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="baslik">Başlık</Label>
          <Input
            id="baslik"
            {...form.register("baslik")}
            placeholder="Teklif başlığı"
          />
          {form.formState.errors.baslik && (
            <p className="text-sm text-red-500">
              {form.formState.errors.baslik.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sonGecerlilikTarihi">Son Geçerlilik Tarihi</Label>
          <Input
            id="sonGecerlilikTarihi"
            type="date"
            {...form.register("sonGecerlilikTarihi", {
              setValueAs: (value) => new Date(value),
            })}
          />
          {form.formState.errors.sonGecerlilikTarihi && (
            <p className="text-sm text-red-500">
              {form.formState.errors.sonGecerlilikTarihi.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Para Birimi</Label>
          <Select
            value={form.watch("paraBirimi")}
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
          <Label>Durum</Label>
          <Select
            value={form.watch("durum")}
            onValueChange={(value) => form.setValue("durum", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Durum seçin" />
            </SelectTrigger>
            <SelectContent>
              {TEKLIF_DURUMLARI.map((durum) => (
                <SelectItem key={durum} value={durum}>
                  {durum}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.durum && (
            <p className="text-sm text-red-500">
              {form.formState.errors.durum.message}
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

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notlar">Notlar</Label>
          <Textarea
            id="notlar"
            {...form.register("notlar")}
            placeholder="Özel notlar"
            rows={4}
          />
        </div>
      </div>

      <TeklifKalemleri
        value={form.watch("teklifKalemleri")}
        onChange={(value) => form.setValue("teklifKalemleri", value)}
        error={form.formState.errors.teklifKalemleri?.message}
      />

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/teklifler")}
        >
          İptal
        </Button>
        <Button type="submit">
          {initialData ? "Güncelle" : "Oluştur"}
        </Button>
      </div>
    </form>
  )
} 