/*
  Warnings:

  - A unique constraint covering the columns `[ClerkID]` on the table `Kullanicilar` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Kullanicilar" ADD COLUMN     "ClerkID" VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "Kullanicilar_ClerkID_key" ON "Kullanicilar"("ClerkID");
