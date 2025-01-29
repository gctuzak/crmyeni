-- Varsayılan rol ekle
INSERT INTO "Roller" ("RolAdi", "Yetkiler")
SELECT 'Kullanıcı', '["musteri.okuma","musteri.yazma","musteri.silme"]'
WHERE NOT EXISTS (
  SELECT 1 FROM "Roller" WHERE "RolAdi" = 'Kullanıcı'
); 