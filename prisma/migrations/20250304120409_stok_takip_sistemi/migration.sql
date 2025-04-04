-- CreateTable
CREATE TABLE "StokHareketleri" (
    "HareketID" SERIAL NOT NULL,
    "UrunID" INTEGER NOT NULL,
    "HareketTipi" VARCHAR(20) NOT NULL,
    "Miktar" INTEGER NOT NULL,
    "BirimFiyat" DECIMAL(10,2) NOT NULL,
    "ToplamTutar" DECIMAL(10,2) NOT NULL,
    "BelgeNo" VARCHAR(50),
    "IslemTuru" VARCHAR(50) NOT NULL,
    "ReferansID" INTEGER,
    "Aciklama" TEXT,
    "Tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "KullaniciID" INTEGER NOT NULL,

    CONSTRAINT "StokHareketleri_pkey" PRIMARY KEY ("HareketID")
);

-- CreateTable
CREATE TABLE "StokDurumu" (
    "StokDurumuID" SERIAL NOT NULL,
    "UrunID" INTEGER NOT NULL,
    "MevcutMiktar" INTEGER NOT NULL DEFAULT 0,
    "MinStokSeviyesi" INTEGER,
    "MaxStokSeviyesi" INTEGER,
    "OrtalamaAlimFiyati" DECIMAL(10,2),
    "SonGuncellemeTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StokDurumu_pkey" PRIMARY KEY ("StokDurumuID")
);

-- CreateIndex
CREATE INDEX "StokHareketleri_UrunID_idx" ON "StokHareketleri"("UrunID");

-- CreateIndex
CREATE INDEX "StokHareketleri_KullaniciID_idx" ON "StokHareketleri"("KullaniciID");

-- CreateIndex
CREATE INDEX "StokHareketleri_Tarih_idx" ON "StokHareketleri"("Tarih");

-- CreateIndex
CREATE INDEX "StokHareketleri_IslemTuru_idx" ON "StokHareketleri"("IslemTuru");

-- CreateIndex
CREATE UNIQUE INDEX "StokDurumu_UrunID_key" ON "StokDurumu"("UrunID");

-- AddForeignKey
ALTER TABLE "StokHareketleri" ADD CONSTRAINT "StokHareketleri_UrunID_fkey" FOREIGN KEY ("UrunID") REFERENCES "Urunler"("UrunID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StokHareketleri" ADD CONSTRAINT "StokHareketleri_KullaniciID_fkey" FOREIGN KEY ("KullaniciID") REFERENCES "Kullanicilar"("KullaniciID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StokDurumu" ADD CONSTRAINT "StokDurumu_UrunID_fkey" FOREIGN KEY ("UrunID") REFERENCES "Urunler"("UrunID") ON DELETE RESTRICT ON UPDATE CASCADE;
