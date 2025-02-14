/*
  Warnings:

  - Changed the type of `EtkinlikTipi` on the `Etkinlikler` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EtkinlikTipi" AS ENUM ('Cari Hesap Bilgileri', 'Fatura Kesilecek', 'Gelen E-posta', 'Giden E-posta', 'İmalat', 'İşemri Oluşturulacak', 'Keşif', 'Montaj', 'Müşteri Ziyaret', 'Numune Gönderimi', 'Prim Hakedişi', 'Proje Çizim', 'Proje İnceleme', 'Sevkiyat', 'Şikayet/Arıza/Servis', 'Tahsilat Takibi', 'Teklif Durum Takibi', 'Teklif Gönderim Onayı', 'Teklif Onay Talebi', 'Teklif Verilecek', 'Teknik Servis', 'Telefon Görüşmesi', 'Toplantı', 'Toplu E-posta');

-- AlterTable
ALTER TABLE "Etkinlikler" ADD COLUMN     "Durum" TEXT NOT NULL DEFAULT 'BEKLIYOR',
ADD COLUMN     "IlgiliKisiID" INTEGER,
ADD COLUMN     "Oncelik" TEXT NOT NULL DEFAULT 'NORMAL',
DROP COLUMN "EtkinlikTipi",
ADD COLUMN     "EtkinlikTipi" "EtkinlikTipi" NOT NULL;

-- CreateIndex
CREATE INDEX "Etkinlikler_MusteriID_idx" ON "Etkinlikler"("MusteriID");

-- CreateIndex
CREATE INDEX "Etkinlikler_IlgiliKisiID_idx" ON "Etkinlikler"("IlgiliKisiID");

-- CreateIndex
CREATE INDEX "Etkinlikler_KullaniciID_idx" ON "Etkinlikler"("KullaniciID");

-- AddForeignKey
ALTER TABLE "Etkinlikler" ADD CONSTRAINT "Etkinlikler_IlgiliKisiID_fkey" FOREIGN KEY ("IlgiliKisiID") REFERENCES "IlgiliKisiler"("IlgiliKisiID") ON DELETE SET NULL ON UPDATE CASCADE;
