"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { firsatSchema, type FirsatForm as FirsatFormType, FIRSAT_ASAMALARI, OLASILIK_DEGERLERI } from "@/lib/validations/firsat"
import { createFirsat, updateFirsat, getAsamalar } from "@/lib/actions/firsat"

interface FirsatFormProps {
  initialData?: FirsatFormType & { id: number }
}

export function FirsatForm({ initialData }: FirsatFormProps) {
  const router = useRouter()
  const [dbAsamalar, setDbAsamalar] = useState<{id: number, asamaAdi: string, sira: number}[]>([]);
  const [asamaYukleniyor, setAsamaYukleniyor] = useState(true);
  
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

  // Aşamaları veritabanından yükleme
  useEffect(() => {
    async function asamalariYukle() {
      try {
        setAsamaYukleniyor(true);
        const sonuc = await getAsamalar();
        if (sonuc.asamalar) {
          console.log("Veritabanından gelen aşamalar:", sonuc.asamalar);
          setDbAsamalar(sonuc.asamalar);
        } else if (sonuc.error) {
          console.error("Aşamalar yüklenirken hata:", sonuc.error);
          // Hata durumunda sabit değerleri kullan
          setDbAsamalar([...FIRSAT_ASAMALARI] as any[]);
        }
      } catch (err) {
        console.error("Aşama yükleme hatası:", err);
        setDbAsamalar([...FIRSAT_ASAMALARI] as any[]);
      } finally {
        setAsamaYukleniyor(false);
      }
    }
    
    asamalariYukle();
  }, []);

  // Form başlangıcında değerlerin doğru ayarlandığından emin olalım
  useEffect(() => {
    if (initialData) {
      console.log("Form başlangıç değerleri:", initialData);
      // Form değerlerini manuel olarak ayarla
      Object.entries(initialData).forEach(([key, value]) => {
        if (key !== 'id') { // id form alanı değil
          form.setValue(key as any, value);
        }
      });
    }
  }, [initialData, form]);

  async function onSubmit(data: FirsatFormType) {
    try {
      console.log("Form gönderiliyor:", data);
      console.log("Form hataları:", form.formState.errors);
      
      // Form verilerini doğrula
      if (!data.musteriId || !data.baslik || !data.beklenenKapanisTarihi) {
        console.error("Eksik form alanları:", {
          musteriId: !data.musteriId,
          baslik: !data.baslik,
          beklenenKapanisTarihi: !data.beklenenKapanisTarihi
        });
        alert("Lütfen tüm zorunlu alanları doldurun.");
        return;
      }
      
      if (initialData) {
        console.log("Güncelleme işlemi başlatılıyor, ID:", initialData.id);
        // Tüm değerlerin tiplerini kontrol et
        console.log("Veri tipleri:", {
          musteriId: typeof data.musteriId,
          baslik: typeof data.baslik, 
          beklenenKapanisTarihi: typeof data.beklenenKapanisTarihi,
          asamaId: typeof data.asamaId,
          olasilik: typeof data.olasilik
        });
        
        // ID'nin sayı olduğundan emin ol
        const id = Number(initialData.id);
        if (isNaN(id)) {
          throw new Error("Geçersiz ID: " + initialData.id);
        }
        
        const result = await updateFirsat(id, {
          musteriId: Number(data.musteriId),
          baslik: String(data.baslik),
          beklenenKapanisTarihi: String(data.beklenenKapanisTarihi),
          asamaId: Number(data.asamaId),
          olasilik: Number(data.olasilik)
        });
        
        console.log("Güncelleme sonucu:", result);
        
        if (result.error) {
          console.error("Güncelleme hatası:", result.error);
          alert(`Güncelleme hatası: ${result.error}`);
          return;
        }
      } else {
        const result = await createFirsat(data);
        if (result.error) {
          console.error("Oluşturma hatası:", result.error);
          alert(`Oluşturma hatası: ${result.error}`);
          return;
        }
      }
      
      router.push("/firsatlar");
    } catch (error) {
      console.error("Form gönderilirken bir hata oluştu:", error);
      alert(`İşlem sırasında bir hata oluştu: ${error instanceof Error ? error.message : String(error)}`);
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
            defaultValue={form.getValues("musteriId")}
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
            defaultValue={form.getValues("baslik")}
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
            defaultValue={form.getValues("beklenenKapanisTarihi")}
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
          {asamaYukleniyor ? (
            <div className="text-sm text-gray-500">Aşamalar yükleniyor...</div>
          ) : (
            <Select
              value={form.getValues("asamaId").toString()}
              onValueChange={(value) => {
                console.log("Aşama değişti:", value);
                form.setValue("asamaId", parseInt(value), { shouldValidate: true });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Aşama seçin" />
              </SelectTrigger>
              <SelectContent>
                {dbAsamalar.map((asama) => (
                  <SelectItem key={asama.id} value={asama.id.toString()}>
                    {asama.asamaAdi}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {form.formState.errors.asamaId && (
            <p className="text-sm text-red-500">
              {form.formState.errors.asamaId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="olasilik">Olasılık</Label>
          <Select
            value={form.getValues("olasilik").toString()}
            onValueChange={(value) => {
              console.log("Olasılık değişti:", value);
              form.setValue("olasilik", parseInt(value), { shouldValidate: true });
            }}
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