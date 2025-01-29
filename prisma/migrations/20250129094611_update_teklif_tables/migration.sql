-- CreateTable
CREATE TABLE "Musteriler" (
    "MusteriID" SERIAL NOT NULL,
    "MusteriTipi" VARCHAR(50) NOT NULL,
    "Ad" VARCHAR(100) NOT NULL,
    "Soyad" VARCHAR(100),
    "VergiNo" VARCHAR(20),
    "Telefon" VARCHAR(20),
    "Email" VARCHAR(100),
    "Adres" TEXT,
    "KayitTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Musteriler_pkey" PRIMARY KEY ("MusteriID")
);

-- CreateTable
CREATE TABLE "IlgiliKisiler" (
    "IlgiliKisiID" SERIAL NOT NULL,
    "MusteriID" INTEGER NOT NULL,
    "Ad" VARCHAR(100) NOT NULL,
    "Soyad" VARCHAR(100),
    "Unvan" VARCHAR(100),
    "Telefon" VARCHAR(20),
    "Email" VARCHAR(100),

    CONSTRAINT "IlgiliKisiler_pkey" PRIMARY KEY ("IlgiliKisiID")
);

-- CreateTable
CREATE TABLE "Teklifler" (
    "TeklifID" SERIAL NOT NULL,
    "MusteriID" INTEGER NOT NULL,
    "TeklifNo" VARCHAR(50) NOT NULL,
    "Baslik" VARCHAR(200) NOT NULL,
    "Aciklama" TEXT,
    "ToplamTutar" DECIMAL(10,2) NOT NULL,
    "ParaBirimi" VARCHAR(10) NOT NULL,
    "Durum" VARCHAR(50) NOT NULL,
    "OlusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "SonGecerlilikTarihi" TIMESTAMP(3) NOT NULL,
    "KullaniciID" INTEGER NOT NULL,
    "Revizyon" INTEGER NOT NULL DEFAULT 1,
    "Notlar" TEXT,

    CONSTRAINT "Teklifler_pkey" PRIMARY KEY ("TeklifID")
);

-- CreateTable
CREATE TABLE "TeklifKalemleri" (
    "KalemID" SERIAL NOT NULL,
    "TeklifID" INTEGER NOT NULL,
    "UrunAdi" VARCHAR(200) NOT NULL,
    "Miktar" INTEGER NOT NULL,
    "Birim" VARCHAR(20) NOT NULL,
    "BirimFiyat" DECIMAL(10,2) NOT NULL,
    "KDVOrani" INTEGER NOT NULL,
    "Aciklama" TEXT,

    CONSTRAINT "TeklifKalemleri_pkey" PRIMARY KEY ("KalemID")
);

-- CreateTable
CREATE TABLE "Roller" (
    "RolID" SERIAL NOT NULL,
    "RolAdi" VARCHAR(100) NOT NULL,
    "Yetkiler" TEXT,

    CONSTRAINT "Roller_pkey" PRIMARY KEY ("RolID")
);

-- CreateTable
CREATE TABLE "Kullanicilar" (
    "KullaniciID" SERIAL NOT NULL,
    "Ad" VARCHAR(100) NOT NULL,
    "Soyad" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(100) NOT NULL,
    "SifreHash" VARCHAR(255) NOT NULL,
    "RolID" INTEGER NOT NULL,

    CONSTRAINT "Kullanicilar_pkey" PRIMARY KEY ("KullaniciID")
);

-- CreateTable
CREATE TABLE "Etkinlikler" (
    "EtkinlikID" SERIAL NOT NULL,
    "MusteriID" INTEGER NOT NULL,
    "EtkinlikTipi" VARCHAR(100) NOT NULL,
    "BaslangicTarihi" TIMESTAMP(3) NOT NULL,
    "BitisTarihi" TIMESTAMP(3),
    "Aciklama" TEXT,
    "KullaniciID" INTEGER NOT NULL,

    CONSTRAINT "Etkinlikler_pkey" PRIMARY KEY ("EtkinlikID")
);

-- CreateTable
CREATE TABLE "Asamalar" (
    "AsamaID" SERIAL NOT NULL,
    "AsamaAdi" VARCHAR(100) NOT NULL,
    "Sira" INTEGER NOT NULL,

    CONSTRAINT "Asamalar_pkey" PRIMARY KEY ("AsamaID")
);

-- CreateTable
CREATE TABLE "Firsatlar" (
    "FirsatID" SERIAL NOT NULL,
    "MusteriID" INTEGER NOT NULL,
    "Baslik" VARCHAR(200) NOT NULL,
    "BeklenenKapanisTarihi" TIMESTAMP(3),
    "AsamaID" INTEGER NOT NULL,
    "Olasilik" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "Firsatlar_pkey" PRIMARY KEY ("FirsatID")
);

-- CreateTable
CREATE TABLE "TeklifDosyalari" (
    "DosyaID" SERIAL NOT NULL,
    "TeklifID" INTEGER NOT NULL,
    "DosyaAdi" VARCHAR(255) NOT NULL,
    "DosyaYolu" VARCHAR(255) NOT NULL,
    "YuklemeTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeklifDosyalari_pkey" PRIMARY KEY ("DosyaID")
);

-- CreateTable
CREATE TABLE "IslemGecmisi" (
    "LogID" SERIAL NOT NULL,
    "TabloAdi" VARCHAR(100) NOT NULL,
    "KayitID" INTEGER NOT NULL,
    "DegisiklikDetayi" TEXT NOT NULL,
    "Tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "KullaniciID" INTEGER NOT NULL,

    CONSTRAINT "IslemGecmisi_pkey" PRIMARY KEY ("LogID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Teklifler_TeklifNo_key" ON "Teklifler"("TeklifNo");

-- CreateIndex
CREATE INDEX "Teklifler_MusteriID_idx" ON "Teklifler"("MusteriID");

-- CreateIndex
CREATE INDEX "Teklifler_KullaniciID_idx" ON "Teklifler"("KullaniciID");

-- CreateIndex
CREATE INDEX "TeklifKalemleri_TeklifID_idx" ON "TeklifKalemleri"("TeklifID");

-- CreateIndex
CREATE UNIQUE INDEX "Roller_RolAdi_key" ON "Roller"("RolAdi");

-- CreateIndex
CREATE UNIQUE INDEX "Kullanicilar_Email_key" ON "Kullanicilar"("Email");

-- CreateIndex
CREATE INDEX "TeklifDosyalari_TeklifID_idx" ON "TeklifDosyalari"("TeklifID");

-- AddForeignKey
ALTER TABLE "IlgiliKisiler" ADD CONSTRAINT "IlgiliKisiler_MusteriID_fkey" FOREIGN KEY ("MusteriID") REFERENCES "Musteriler"("MusteriID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teklifler" ADD CONSTRAINT "Teklifler_MusteriID_fkey" FOREIGN KEY ("MusteriID") REFERENCES "Musteriler"("MusteriID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teklifler" ADD CONSTRAINT "Teklifler_KullaniciID_fkey" FOREIGN KEY ("KullaniciID") REFERENCES "Kullanicilar"("KullaniciID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeklifKalemleri" ADD CONSTRAINT "TeklifKalemleri_TeklifID_fkey" FOREIGN KEY ("TeklifID") REFERENCES "Teklifler"("TeklifID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kullanicilar" ADD CONSTRAINT "Kullanicilar_RolID_fkey" FOREIGN KEY ("RolID") REFERENCES "Roller"("RolID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etkinlikler" ADD CONSTRAINT "Etkinlikler_MusteriID_fkey" FOREIGN KEY ("MusteriID") REFERENCES "Musteriler"("MusteriID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etkinlikler" ADD CONSTRAINT "Etkinlikler_KullaniciID_fkey" FOREIGN KEY ("KullaniciID") REFERENCES "Kullanicilar"("KullaniciID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Firsatlar" ADD CONSTRAINT "Firsatlar_MusteriID_fkey" FOREIGN KEY ("MusteriID") REFERENCES "Musteriler"("MusteriID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Firsatlar" ADD CONSTRAINT "Firsatlar_AsamaID_fkey" FOREIGN KEY ("AsamaID") REFERENCES "Asamalar"("AsamaID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeklifDosyalari" ADD CONSTRAINT "TeklifDosyalari_TeklifID_fkey" FOREIGN KEY ("TeklifID") REFERENCES "Teklifler"("TeklifID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IslemGecmisi" ADD CONSTRAINT "IslemGecmisi_KullaniciID_fkey" FOREIGN KEY ("KullaniciID") REFERENCES "Kullanicilar"("KullaniciID") ON DELETE RESTRICT ON UPDATE CASCADE;
