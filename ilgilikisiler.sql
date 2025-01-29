\x on

-- Kalan kayıtları göster
SELECT 
  i."IlgiliKisiID",
  m."Ad" as "Müşteri Adı",
  m."Soyad" as "Müşteri Soyadı",
  i."Ad" as "İlgili Kişi Adı",
  i."Soyad" as "İlgili Kişi Soyadı",
  i."Unvan" as "Ünvan",
  i."Telefon" as "Telefon",
  i."Email" as "E-posta"
FROM "IlgiliKisiler" i
JOIN "Musteriler" m ON i."MusteriID" = m."MusteriID"
ORDER BY i."IlgiliKisiID";

-- Tekrarlanan kayıtları göster
WITH DuplicateRecords AS (
  SELECT 
    "MusteriID",
    "Ad",
    "Soyad",
    "Unvan",
    "Telefon",
    "Email",
    COUNT(*) as tekrar_sayisi,
    MIN("IlgiliKisiID") as ilk_kayit_id
  FROM "IlgiliKisiler"
  GROUP BY "MusteriID", "Ad", "Soyad", "Unvan", "Telefon", "Email"
  HAVING COUNT(*) > 1
)
SELECT 
  i.*,
  m."Ad" as "Müşteri Adı"
FROM "IlgiliKisiler" i
JOIN DuplicateRecords d ON 
  i."MusteriID" = d."MusteriID" AND
  i."Ad" = d."Ad" AND
  i."Soyad" = d."Soyad" AND
  i."Unvan" = d."Unvan" AND
  i."Telefon" = d."Telefon" AND
  i."Email" = d."Email"
JOIN "Musteriler" m ON i."MusteriID" = m."MusteriID"
ORDER BY i."MusteriID", i."Ad", i."Soyad", i."IlgiliKisiID";

-- Tekrarlanan kayıtları sil
DELETE FROM "IlgiliKisiler"
WHERE "IlgiliKisiID" IN (
  SELECT i."IlgiliKisiID"
  FROM "IlgiliKisiler" i
  JOIN (
    SELECT 
      "MusteriID",
      "Ad",
      "Soyad",
      "Unvan",
      "Telefon",
      "Email",
      MIN("IlgiliKisiID") as ilk_kayit_id
    FROM "IlgiliKisiler"
    GROUP BY "MusteriID", "Ad", "Soyad", "Unvan", "Telefon", "Email"
    HAVING COUNT(*) > 1
  ) d ON 
    i."MusteriID" = d."MusteriID" AND
    i."Ad" = d."Ad" AND
    i."Soyad" = d."Soyad" AND
    i."Unvan" = d."Unvan" AND
    i."Telefon" = d."Telefon" AND
    i."Email" = d."Email" AND
    i."IlgiliKisiID" > d.ilk_kayit_id
); 