/*
  Warnings:

  - Added the required column `KullaniciID` to the `Musteriler` table without a default value. This is not possible if the table is not empty.

*/
-- Önce varsayılan rol oluştur
INSERT INTO "Roller" ("RolAdi", "Yetkiler")
SELECT 'Kullanıcı', '["musteri.okuma","musteri.yazma","musteri.silme"]'
WHERE NOT EXISTS (
  SELECT 1 FROM "Roller" WHERE "RolAdi" = 'Kullanıcı'
);

-- Varsayılan rolün ID'sini al
DO $$ 
DECLARE
  default_role_id INTEGER;
BEGIN
  SELECT "RolID" INTO default_role_id FROM "Roller" WHERE "RolAdi" = 'Kullanıcı' LIMIT 1;

  -- Varsayılan kullanıcı oluştur
  INSERT INTO "Kullanicilar" ("Ad", "Soyad", "Email", "SifreHash", "RolID")
  SELECT 'Admin', 'User', 'admin@example.com', 'hash123', default_role_id
  WHERE NOT EXISTS (
    SELECT 1 FROM "Kullanicilar" WHERE "Email" = 'admin@example.com'
  );

  -- Varsayılan kullanıcının ID'sini al
  DECLARE
    default_user_id INTEGER;
  BEGIN
    SELECT "KullaniciID" INTO default_user_id FROM "Kullanicilar" WHERE "Email" = 'admin@example.com' LIMIT 1;

    -- KullaniciID sütununu ekle ve varsayılan değer ata
    ALTER TABLE "Musteriler" ADD COLUMN "KullaniciID" INTEGER;
    UPDATE "Musteriler" SET "KullaniciID" = default_user_id WHERE "KullaniciID" IS NULL;
    ALTER TABLE "Musteriler" ALTER COLUMN "KullaniciID" SET NOT NULL;
    
    -- Foreign key ve index ekle
    ALTER TABLE "Musteriler" ADD CONSTRAINT "Musteriler_KullaniciID_fkey" FOREIGN KEY ("KullaniciID") REFERENCES "Kullanicilar"("KullaniciID") ON DELETE RESTRICT ON UPDATE CASCADE;
    CREATE INDEX "Musteriler_KullaniciID_idx" ON "Musteriler"("KullaniciID");
  END;
END $$;
