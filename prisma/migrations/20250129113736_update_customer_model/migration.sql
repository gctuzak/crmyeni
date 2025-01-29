-- AlterTable
ALTER TABLE "Musteriler" ADD COLUMN     "FirmaAdi" VARCHAR(200),
ADD COLUMN     "TCKimlik" VARCHAR(11),
ADD COLUMN     "TemsilciID" INTEGER,
ADD COLUMN     "VergiDairesi" VARCHAR(100),
ALTER COLUMN "Ad" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Musteriler_TemsilciID_idx" ON "Musteriler"("TemsilciID");

-- AddForeignKey
ALTER TABLE "Musteriler" ADD CONSTRAINT "Musteriler_TemsilciID_fkey" FOREIGN KEY ("TemsilciID") REFERENCES "Kullanicilar"("KullaniciID") ON DELETE SET NULL ON UPDATE CASCADE;
