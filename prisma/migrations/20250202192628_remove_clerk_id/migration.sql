/*
  Warnings:

  - You are about to drop the column `ClerkID` on the `Kullanicilar` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Kullanicilar_ClerkID_key";

-- AlterTable
ALTER TABLE "Kullanicilar" DROP COLUMN "ClerkID";

-- CreateTable
CREATE TABLE "Ayarlar" (
    "AyarID" SERIAL NOT NULL,
    "Anahtar" VARCHAR(100) NOT NULL,
    "Deger" TEXT NOT NULL,
    "Aciklama" TEXT,

    CONSTRAINT "Ayarlar_pkey" PRIMARY KEY ("AyarID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ayarlar_Anahtar_key" ON "Ayarlar"("Anahtar");
