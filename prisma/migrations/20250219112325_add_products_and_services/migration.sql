/*
  Warnings:

  - You are about to drop the column `UrunAdi` on the `TeklifKalemleri` table. All the data in the column will be lost.
  - Added the required column `KalemTipi` to the `TeklifKalemleri` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TeklifKalemleri" DROP COLUMN "UrunAdi",
ADD COLUMN     "HizmetID" INTEGER,
ADD COLUMN     "KalemTipi" VARCHAR(20) NOT NULL,
ADD COLUMN     "UrunID" INTEGER;

-- CreateTable
CREATE TABLE "UrunHizmetGruplari" (
    "GrupID" SERIAL NOT NULL,
    "GrupTipi" VARCHAR(20) NOT NULL,
    "GrupKodu" VARCHAR(50) NOT NULL,
    "GrupAdi" VARCHAR(200) NOT NULL,
    "Aciklama" TEXT,
    "Aktif" BOOLEAN NOT NULL DEFAULT true,
    "Sira" INTEGER NOT NULL DEFAULT 0,
    "UstGrupID" INTEGER,

    CONSTRAINT "UrunHizmetGruplari_pkey" PRIMARY KEY ("GrupID")
);

-- CreateTable
CREATE TABLE "Urunler" (
    "UrunID" SERIAL NOT NULL,
    "UrunKodu" VARCHAR(50) NOT NULL,
    "UrunAdi" VARCHAR(200) NOT NULL,
    "GrupID" INTEGER NOT NULL,
    "Birim" VARCHAR(20) NOT NULL,
    "BirimFiyat" DECIMAL(10,2) NOT NULL,
    "KDVOrani" INTEGER NOT NULL,
    "Aciklama" TEXT,
    "Aktif" BOOLEAN NOT NULL DEFAULT true,
    "OlusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellenmeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Urunler_pkey" PRIMARY KEY ("UrunID")
);

-- CreateTable
CREATE TABLE "Hizmetler" (
    "HizmetID" SERIAL NOT NULL,
    "HizmetKodu" VARCHAR(50) NOT NULL,
    "HizmetAdi" VARCHAR(200) NOT NULL,
    "GrupID" INTEGER NOT NULL,
    "Birim" VARCHAR(20) NOT NULL,
    "BirimFiyat" DECIMAL(10,2) NOT NULL,
    "KDVOrani" INTEGER NOT NULL,
    "Aciklama" TEXT,
    "Aktif" BOOLEAN NOT NULL DEFAULT true,
    "OlusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "GuncellenmeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hizmetler_pkey" PRIMARY KEY ("HizmetID")
);

-- CreateIndex
CREATE UNIQUE INDEX "UrunHizmetGruplari_GrupKodu_key" ON "UrunHizmetGruplari"("GrupKodu");

-- CreateIndex
CREATE UNIQUE INDEX "Urunler_UrunKodu_key" ON "Urunler"("UrunKodu");

-- CreateIndex
CREATE INDEX "Urunler_GrupID_idx" ON "Urunler"("GrupID");

-- CreateIndex
CREATE UNIQUE INDEX "Hizmetler_HizmetKodu_key" ON "Hizmetler"("HizmetKodu");

-- CreateIndex
CREATE INDEX "Hizmetler_GrupID_idx" ON "Hizmetler"("GrupID");

-- CreateIndex
CREATE INDEX "TeklifKalemleri_UrunID_idx" ON "TeklifKalemleri"("UrunID");

-- CreateIndex
CREATE INDEX "TeklifKalemleri_HizmetID_idx" ON "TeklifKalemleri"("HizmetID");

-- AddForeignKey
ALTER TABLE "TeklifKalemleri" ADD CONSTRAINT "TeklifKalemleri_UrunID_fkey" FOREIGN KEY ("UrunID") REFERENCES "Urunler"("UrunID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeklifKalemleri" ADD CONSTRAINT "TeklifKalemleri_HizmetID_fkey" FOREIGN KEY ("HizmetID") REFERENCES "Hizmetler"("HizmetID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UrunHizmetGruplari" ADD CONSTRAINT "UrunHizmetGruplari_UstGrupID_fkey" FOREIGN KEY ("UstGrupID") REFERENCES "UrunHizmetGruplari"("GrupID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Urunler" ADD CONSTRAINT "Urunler_GrupID_fkey" FOREIGN KEY ("GrupID") REFERENCES "UrunHizmetGruplari"("GrupID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hizmetler" ADD CONSTRAINT "Hizmetler_GrupID_fkey" FOREIGN KEY ("GrupID") REFERENCES "UrunHizmetGruplari"("GrupID") ON DELETE RESTRICT ON UPDATE CASCADE;
