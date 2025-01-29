"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { IlgiliKisiler } from "@prisma/client"

interface IlgiliKisiSeciciProps {
  value?: number
  onValueChange: (value: number | undefined) => void
  ilgiliKisiler: IlgiliKisiler[]
  disabled?: boolean
}

export function IlgiliKisiSecici({ value, onValueChange, ilgiliKisiler, disabled }: IlgiliKisiSeciciProps) {
  const [open, setOpen] = useState(false)
  const selectedKisi = ilgiliKisiler.find((kisi) => kisi.id === value)

  const handleSelect = (kisi: IlgiliKisiler) => {
    onValueChange(kisi.id)
    setOpen(false)
  }

  const handleClear = () => {
    onValueChange(undefined)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || ilgiliKisiler.length === 0}
        >
          {selectedKisi ? (
            <>
              {selectedKisi.ad} {selectedKisi.soyad}
              {selectedKisi.unvan && ` - ${selectedKisi.unvan}`}
            </>
          ) : (
            "İlgili kişi seçin..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-4" align="start">
        <div className="max-h-[300px] overflow-auto space-y-2">
          <div
            className={cn(
              "flex items-start space-x-2 p-2 rounded-md cursor-pointer hover:bg-accent",
              !value && "bg-accent"
            )}
            onClick={handleClear}
          >
            <Check
              className={cn(
                "mt-1 h-4 w-4",
                !value ? "opacity-100" : "opacity-0"
              )}
            />
            <div className="flex flex-col">
              <span className="font-medium">İlgili kişi yok</span>
            </div>
          </div>
          {ilgiliKisiler.map((kisi) => (
            <div
              key={kisi.id}
              className={cn(
                "flex items-start space-x-2 p-2 rounded-md cursor-pointer hover:bg-accent",
                value === kisi.id && "bg-accent"
              )}
              onClick={() => handleSelect(kisi)}
            >
              <Check
                className={cn(
                  "mt-1 h-4 w-4",
                  value === kisi.id ? "opacity-100" : "opacity-0"
                )}
              />
              <div className="flex flex-col">
                <span className="font-medium">
                  {kisi.ad} {kisi.soyad}
                </span>
                {kisi.unvan && (
                  <span className="text-sm text-gray-500">
                    {kisi.unvan}
                  </span>
                )}
                {kisi.telefon && (
                  <span className="text-sm text-gray-500">
                    Tel: {kisi.telefon}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
} 