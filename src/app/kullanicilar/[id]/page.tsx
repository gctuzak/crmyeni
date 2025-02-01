"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { getKullanici, updateKullanici, deleteKullanici, getRoller } from "@/lib/actions/kullanici"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const formSchema = z.object({
  ad: z.string().min(2, "Ad en az 2 karakter olmalıdır."),
  soyad: z.string().min(2, "Soyad en az 2 karakter olmalıdır."),
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  rolId: z.string().transform(val => parseInt(val, 10))
})

export default function KullaniciDetayPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading: isAuthLoading } = useAuth()
  const [kullanici, setKullanici] = useState<any>(null)
  const [roller, setRoller] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ad: "",
      soyad: "",
      email: "",
      rolId: ""
    }
  })

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/sign-in")
    }
  }, [user, isAuthLoading, router])

  useEffect(() => {
    async function loadData() {
      try {
        const [kullaniciResult, rollerResult] = await Promise.all([
          getKullanici(parseInt(params.id, 10)),
          getRoller()
        ])

        if (kullaniciResult.error) {
          setError(kullaniciResult.error)
        } else {
          setKullanici(kullaniciResult.kullanici)
          form.reset({
            ad: kullaniciResult.kullanici.ad,
            soyad: kullaniciResult.kullanici.soyad,
            email: kullaniciResult.kullanici.email,
            rolId: kullaniciResult.kullanici.rolId.toString()
          })
        }

        if (rollerResult.error) {
          setError(rollerResult.error)
        } else {
          setRoller(rollerResult.roller)
        }
      } catch (error) {
        console.error("Veriler yüklenirken hata oluştu:", error)
        setError("Veriler yüklenirken bir hata oluştu.")
      } finally {
        setIsLoading(false)
      }
    }

    if (!isAuthLoading && user) {
      loadData()
    }
  }, [user, isAuthLoading, params.id, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await updateKullanici(parseInt(params.id, 10), values)
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: result.error
        })
      } else {
        toast({
          title: "Başarılı",
          description: "Kullanıcı bilgileri güncellendi."
        })
        router.refresh()
      }
    } catch (error) {
      console.error("Kullanıcı güncellenirken hata oluştu:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kullanıcı güncellenirken bir hata oluştu."
      })
    }
  }

  async function handleDelete() {
    try {
      const result = await deleteKullanici(parseInt(params.id, 10))
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: result.error
        })
      } else {
        toast({
          title: "Başarılı",
          description: "Kullanıcı silindi."
        })
        router.push("/kullanicilar")
      }
    } catch (error) {
      console.error("Kullanıcı silinirken hata oluştu:", error)
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Kullanıcı silinirken bir hata oluştu."
      })
    }
  }

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!user || !kullanici) {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kullanıcı Detayı</h1>
        {user.rolId === 1 && user.id !== kullanici.id && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Sil
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu işlem geri alınamaz. Kullanıcı ve ilişkili tüm veriler silinecektir.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Sil</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="soyad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Soyad</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {user.rolId === 1 && (
                <FormField
                  control={form.control}
                  name="rolId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Rol seçiniz" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roller.map((rol) => (
                            <SelectItem key={rol.id} value={rol.id.toString()}>
                              {rol.ad}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex justify-end">
                <Button type="submit">Kaydet</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Kaydettiği Müşteriler</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {kullanici.kayitliMusteriler.map((musteri: any) => (
                <li key={musteri.id} className="flex justify-between items-center">
                  <span>
                    {musteri.musteriTipi === "BIREYSEL"
                      ? `${musteri.ad} ${musteri.soyad}`
                      : musteri.firmaAdi}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => router.push(`/musteriler/${musteri.id}`)}
                  >
                    Detay
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Temsilcisi Olduğu Müşteriler</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {kullanici.temsilciMusteriler.map((musteri: any) => (
                <li key={musteri.id} className="flex justify-between items-center">
                  <span>
                    {musteri.musteriTipi === "BIREYSEL"
                      ? `${musteri.ad} ${musteri.soyad}`
                      : musteri.firmaAdi}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => router.push(`/musteriler/${musteri.id}`)}
                  >
                    Detay
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 