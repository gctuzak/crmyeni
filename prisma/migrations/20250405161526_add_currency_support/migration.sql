-- AlterTable
ALTER TABLE "Hizmetler" ADD COLUMN     "KurBazliFiyat" DECIMAL(10,2),
ADD COLUMN     "KurParaBirimi" VARCHAR(10),
ADD COLUMN     "ParaBirimi" VARCHAR(10) NOT NULL DEFAULT 'TRY';

-- AlterTable
ALTER TABLE "Teklifler" ADD COLUMN     "KurDegeri" DECIMAL(10,4),
ADD COLUMN     "KurTarihi" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Urunler" ADD COLUMN     "KurBazliFiyat" DECIMAL(10,2),
ADD COLUMN     "KurParaBirimi" VARCHAR(10),
ADD COLUMN     "ParaBirimi" VARCHAR(10) NOT NULL DEFAULT 'TRY';
