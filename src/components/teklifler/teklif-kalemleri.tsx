"use client"

import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type TeklifKalemiForm, BIRIMLER, KDV_ORANLARI } from "@/lib/validations/teklif"

interface TeklifKalemleriProps {
  value: TeklifKalemiForm[]
  onChange: (value: TeklifKalemiForm[]) => void
  error?: string
}

export function TeklifKalemleri({ value, onChange, error }: TeklifKalemleriProps) {
  function handleAdd() {
    onChange([
      ...value,
      {
        urunAdi: "",
        miktar: 1,
        birim: "Adet",
        birimFiyat: 0,
        kdvOrani: 18,
        aciklama: "",
      },
    ])
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function handleChange(index: number, field: keyof TeklifKalemiForm, fieldValue: any) {
    onChange(
      value.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: fieldValue,
            }
          : item
      )
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Teklif Kalemleri</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni Kalem Ekle
        </Button>
      </div>

      {value.map((kalem, index) => (
        <div
          key={index}
          className="p-4 border rounded-lg space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Kalem #{index + 1}</h3>
            {index > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Ürün Adı</Label>
              <Input
                value={kalem.urunAdi}
                onChange={(e) => handleChange(index, "urunAdi", e.target.value)}
                placeholder="Ürün/hizmet adı"
              />
            </div>

            <div className="space-y-2">
              <Label>Miktar</Label>
              <Input
                type="number"
                min="1"
                value={kalem.miktar}
                onChange={(e) => handleChange(index, "miktar", parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Birim</Label>
              <Select
                value={kalem.birim}
                onValueChange={(value) => handleChange(index, "birim", value)}
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
            </div>

            <div className="space-y-2">
              <Label>Birim Fiyat</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={kalem.birimFiyat}
                onChange={(e) => handleChange(index, "birimFiyat", parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>KDV Oranı (%)</Label>
              <Select
                value={kalem.kdvOrani.toString()}
                onValueChange={(value) => handleChange(index, "kdvOrani", parseInt(value))}
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
            </div>

            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Input
                value={kalem.aciklama}
                onChange={(e) => handleChange(index, "aciklama", e.target.value)}
                placeholder="Ürün/hizmet açıklaması"
              />
            </div>
          </div>
        </div>
      ))}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
} 