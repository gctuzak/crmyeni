"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { searchMusteriler } from "@/lib/actions/musteri"
import type { Musteriler, IlgiliKisiler, Kullanicilar } from "@prisma/client"

interface MusteriAramaProps {
  onSelect: (musteri: Musteriler & {
    ilgiliKisiler: IlgiliKisiler[]
    temsilci?: Kullanicilar
    kullanici: Kullanicilar
  }) => void
}

export function MusteriArama({ onSelect }: MusteriAramaProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<(Musteriler & {
    ilgiliKisiler: IlgiliKisiler[]
    temsilci?: Kullanicilar
    kullanici: Kullanicilar
  })[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Dışarı tıklandığında sonuçları kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Arama işlemi
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 3) {
        setIsLoading(true)
        const { musteriler, error } = await searchMusteriler(query)
        if (musteriler) {
          setResults(musteriler)
          setShowResults(true)
        }
        setIsLoading(false)
      } else {
        setResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Input
          type="text"
          placeholder="Müşteri veya ilgili kişi ara (en az 3 karakter)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      </div>

      {showResults && (
        <div className="absolute mt-1 w-full rounded-md border bg-white shadow-lg">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Aranıyor...</div>
          ) : results.length > 0 ? (
            <ul className="max-h-60 overflow-auto py-2">
              {results.map((musteri) => (
                <li
                  key={musteri.id}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    onSelect(musteri)
                    setShowResults(false)
                    setQuery("")
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {musteri.musteriTipi === "BIREYSEL"
                        ? `${musteri.ad} ${musteri.soyad}`
                        : musteri.firmaAdi}
                    </span>
                    <span className="text-sm text-gray-500">
                      {musteri.musteriTipi === "BIREYSEL"
                        ? musteri.tcKimlik
                        : `${musteri.vergiDairesi} - ${musteri.vergiNo}`}
                    </span>
                    {musteri.telefon && (
                      <span className="text-sm text-gray-500">
                        Tel: {musteri.telefon}
                      </span>
                    )}
                    {musteri.ilgiliKisiler.length > 0 && (
                      <div className="mt-2 border-t pt-2">
                        <span className="text-xs font-medium text-gray-500">
                          İlgili Kişiler:
                        </span>
                        <ul className="mt-1 space-y-1">
                          {musteri.ilgiliKisiler.map((kisi) => (
                            <li key={kisi.id} className="text-sm">
                              <span className="font-medium">
                                {kisi.ad} {kisi.soyad}
                              </span>
                              {kisi.unvan && (
                                <span className="text-gray-500"> - {kisi.unvan}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Sonuç bulunamadı.
            </div>
          )}
        </div>
      )}
    </div>
  )
} 