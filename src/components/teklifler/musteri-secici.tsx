"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { searchMusteriler } from "@/lib/actions/teklif"
import { getMusteri } from "@/lib/actions/musteri"
import type { Musteriler, IlgiliKisiler } from "@prisma/client"

interface MusteriSeciciProps {
  value?: number
  onValueChange: (value: number, musteri: Musteriler & {
    ilgiliKisiler: IlgiliKisiler[]
  }) => void
}

export function MusteriSecici({ value, onValueChange }: MusteriSeciciProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [musteriler, setMusteriler] = useState<(Musteriler & {
    ilgiliKisiler: IlgiliKisiler[]
  })[]>([])
  const [selectedMusteri, setSelectedMusteri] = useState<(Musteriler & {
    ilgiliKisiler: IlgiliKisiler[]
  }) | null>(null)

  // Başlangıçta veya value değiştiğinde seçili müşteriyi getir
  useEffect(() => {
    async function loadSelectedMusteri() {
      if (value) {
        const { musteri } = await getMusteri(value)
        if (musteri) {
          setSelectedMusteri(musteri)
        }
      } else {
        setSelectedMusteri(null)
      }
    }
    loadSelectedMusteri()
  }, [value])

  // Arama işlemi
  useEffect(() => {
    async function searchMusteri() {
      if (search.length >= 2) {
        const { musteriler, error } = await searchMusteriler(search)
        if (musteriler) {
          setMusteriler(musteriler)
        } else {
          setMusteriler([])
        }
      } else {
        setMusteriler([])
      }
    }

    const timer = setTimeout(searchMusteri, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleSelect = (musteri: Musteriler & { ilgiliKisiler: IlgiliKisiler[] }) => {
    setSelectedMusteri(musteri)
    onValueChange(musteri.id, musteri)
    setOpen(false)
    setSearch("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedMusteri ? (
            selectedMusteri.musteriTipi === "BIREYSEL" ? (
              `${selectedMusteri.ad} ${selectedMusteri.soyad}`
            ) : (
              selectedMusteri.firmaAdi
            )
          ) : (
            "Müşteri seçin..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-4" align="start">
        <div className="flex items-center border-b pb-4 mb-4">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Müşteri ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 focus-visible:ring-0"
          />
        </div>
        <div className="max-h-[300px] overflow-auto space-y-2">
          {musteriler.length === 0 && search.length >= 2 ? (
            <div className="text-center text-sm text-gray-500 py-2">
              Müşteri bulunamadı.
            </div>
          ) : (
            musteriler.map((musteri) => (
              <div
                key={musteri.id}
                className={cn(
                  "flex items-start space-x-2 p-2 rounded-md cursor-pointer hover:bg-accent",
                  value === musteri.id && "bg-accent"
                )}
                onClick={() => handleSelect(musteri)}
              >
                <Check
                  className={cn(
                    "mt-1 h-4 w-4",
                    value === musteri.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span className="font-medium">
                    {musteri.musteriTipi === "BIREYSEL"
                      ? `${musteri.ad} ${musteri.soyad}`
                      : musteri.firmaAdi}
                  </span>
                  {musteri.ilgiliKisiler.length > 0 && (
                    <span className="text-sm text-gray-500">
                      İlgili Kişiler: {musteri.ilgiliKisiler.map(k => k.ad + " " + k.soyad).join(", ")}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
} 