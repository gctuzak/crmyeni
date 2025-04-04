/*
  Warnings:

  - You are about to drop the `StokDurumu` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StokHareketleri` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StokDurumu" DROP CONSTRAINT "StokDurumu_UrunID_fkey";

-- DropForeignKey
ALTER TABLE "StokHareketleri" DROP CONSTRAINT "StokHareketleri_KullaniciID_fkey";

-- DropForeignKey
ALTER TABLE "StokHareketleri" DROP CONSTRAINT "StokHareketleri_UrunID_fkey";

-- DropTable
DROP TABLE "StokDurumu";

-- DropTable
DROP TABLE "StokHareketleri";
