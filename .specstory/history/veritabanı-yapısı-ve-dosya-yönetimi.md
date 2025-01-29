## SpecStory

## Veritabanı Yapısı ve Dosya Yönetimi (1/29/2025, 10:28:47 AM)

_**User**_

--------------------------------------------------

### **1. Müşteriler Tablosu**
```sql
CREATE TABLE Musteriler (
    MusteriID INT PRIMARY KEY AUTO_INCREMENT,
    MusteriTipi VARCHAR(50) NOT NULL,
    Ad VARCHAR(100) NOT NULL,
    Soyad VARCHAR(100),
    VergiNo VARCHAR(20),
    Telefon VARCHAR(20),
    Email VARCHAR(100),
    Adres TEXT,
    KayitTarihi DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### **2. İlgiliKişiler Tablosu**
```sql
CREATE TABLE IlgiliKisiler (
    IlgiliKisiID INT PRIMARY KEY AUTO_INCREMENT,
    MusteriID INT NOT NULL,
    Ad VARCHAR(100) NOT NULL,
    Soyad VARCHAR(100),
    Unvan VARCHAR(100),
    Telefon VARCHAR(20),
    Email VARCHAR(100),
    FOREIGN KEY (MusteriID) REFERENCES Musteriler(MusteriID)
);
```

---

### **3. Teklifler Tablosu**
```sql
CREATE TABLE Teklifler (
    TeklifID INT PRIMARY KEY AUTO_INCREMENT,
    MusteriID INT NOT NULL,
    TeklifNumarasi VARCHAR(50) UNIQUE NOT NULL,
    Baslik VARCHAR(200) NOT NULL,
    Aciklama TEXT,
    DurumID INT NOT NULL,
    OlusturmaTarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
    SonGecerlilikTarihi DATE,
    ToplamTutar DECIMAL(18,2),
    FOREIGN KEY (MusteriID) REFERENCES Musteriler(MusteriID),
    FOREIGN KEY (DurumID) REFERENCES Durumlar(DurumID)
);
```

---

### **4. TeklifKalemleri Tablosu**
```sql
CREATE TABLE TeklifKalemleri (
    KalemID INT PRIMARY KEY AUTO_INCREMENT,
    TeklifID INT NOT NULL,
    UrunAdi VARCHAR(200) NOT NULL,
    Miktar INT DEFAULT 1,
    BirimFiyat DECIMAL(18,2) NOT NULL,
    ToplamFiyat DECIMAL(18,2) GENERATED ALWAYS AS (Miktar * BirimFiyat) STORED,
    Aciklama TEXT,
    FOREIGN KEY (TeklifID) REFERENCES Teklifler(TeklifID)
);
```

---

### **5. Durumlar Tablosu**
```sql
CREATE TABLE Durumlar (
    DurumID INT PRIMARY KEY AUTO_INCREMENT,
    DurumAdi VARCHAR(100) NOT NULL,
    DurumTuru VARCHAR(50) NOT NULL
);
```

---

### **6. Etkinlikler Tablosu**
```sql
CREATE TABLE Etkinlikler (
    EtkinlikID INT PRIMARY KEY AUTO_INCREMENT,
    MusteriID INT NOT NULL,
    EtkinlikTipi VARCHAR(100) NOT NULL,
    BaslangicTarihi DATETIME NOT NULL,
    BitisTarihi DATETIME,
    Aciklama TEXT,
    KullaniciID INT NOT NULL,
    FOREIGN KEY (MusteriID) REFERENCES Musteriler(MusteriID),
    FOREIGN KEY (KullaniciID) REFERENCES Kullanicilar(KullaniciID)
);
```

---

### **7. Kullanıcılar Tablosu**
```sql
CREATE TABLE Kullanicilar (
    KullaniciID INT PRIMARY KEY AUTO_INCREMENT,
    Ad VARCHAR(100) NOT NULL,
    Soyad VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    SifreHash VARCHAR(255) NOT NULL,
    RolID INT NOT NULL,
    FOREIGN KEY (RolID) REFERENCES Roller(RolID)
);
```

---

### **8. Roller Tablosu**
```sql
CREATE TABLE Roller (
    RolID INT PRIMARY KEY AUTO_INCREMENT,
    RolAdi VARCHAR(100) UNIQUE NOT NULL,
    Yetkiler TEXT
);
```

---

### **9. Fırsatlar Tablosu**
```sql
CREATE TABLE Firsatlar (
    FirsatID INT PRIMARY KEY AUTO_INCREMENT,
    MusteriID INT NOT NULL,
    Baslik VARCHAR(200) NOT NULL,
    BeklenenKapanisTarihi DATE,
    AsamaID INT NOT NULL,
    Olasilik DECIMAL(5,2) CHECK (Olasilik >= 0 AND Olasilik <= 100),
    FOREIGN KEY (MusteriID) REFERENCES Musteriler(MusteriID),
    FOREIGN KEY (AsamaID) REFERENCES Asamalar(AsamaID)
);
```

---

### **10. Aşamalar Tablosu**
```sql
CREATE TABLE Asamalar (
    AsamaID INT PRIMARY KEY AUTO_INCREMENT,
    AsamaAdi VARCHAR(100) NOT NULL,
    Sira INT NOT NULL
);
```

---

### **11. TeklifDosyaları Tablosu**
```sql
CREATE TABLE TeklifDosyalari (
    DosyaID INT PRIMARY KEY AUTO_INCREMENT,
    TeklifID INT NOT NULL,
    DosyaAdi VARCHAR(255) NOT NULL,
    DosyaYolu VARCHAR(255) NOT NULL,
    YuklemeTarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TeklifID) REFERENCES Teklifler(TeklifID)
);
```

---

### **12. İşlemGeçmişi Tablosu**
```sql
CREATE TABLE IslemGecmisi (
    LogID INT PRIMARY KEY AUTO_INCREMENT,
    TabloAdi VARCHAR(100) NOT NULL,
    KayitID INT NOT NULL,
    DegisiklikDetayi TEXT NOT NULL,
    Tarih DATETIME DEFAULT CURRENT_TIMESTAMP,
    KullaniciID INT NOT NULL,
    FOREIGN KEY (KullaniciID) REFERENCES Kullanicilar(KullaniciID)
);
```

---

### **İndeksler (Performans İçin)**
```sql
-- Müşteriler Tablosu
CREATE INDEX idx_Musteri_Ad ON Musteriler(Ad);
CREATE INDEX idx_Musteri_Email ON Musteriler(Email);

-- Teklifler Tablosu
CREATE INDEX idx_Teklif_Numarasi ON Teklifler(TeklifNumarasi);
CREATE INDEX idx_Teklif_Durum ON Teklifler(DurumID);

-- Etkinlikler Tablosu
CREATE INDEX idx_Etkinlik_Tarih ON Etkinlikler(BaslangicTarihi);
```

---

### **Örnek Senaryo: Teklif Oluşturma**
```sql
-- Müşteri ekle
INSERT INTO Musteriler (MusteriTipi, Ad, Soyad, Email) 
VALUES ('Bireysel', 'Ahmet', 'Yılmaz', 'ahmet@example.com');

-- Teklif ekle
INSERT INTO Teklifler (MusteriID, TeklifNumarasi, Baslik, DurumID, ToplamTutar)
VALUES (1, 'T-2023-001', 'Web Sitesi Geliştirme', 1, 15000.00);

-- Teklif kalemleri ekle
INSERT INTO TeklifKalemleri (TeklifID, UrunAdi, Miktar, BirimFiyat)
VALUES (1, 'Frontend Geliştirme', 1, 10000.00),
       (1, 'Backend Geliştirme', 1, 5000.00);

---------------------------------------------------

Yukarıdaki database yapısına ilgili, müşteri, teklif, etkinlik bazında da dosyalar eklemem ve gerektiğinde listeleyip çağırmam gerekiyor. Bunu da mevcut yapıya entegre eder misin?

---

_**Assistant**_

Mevcut veritabanı yapısına dosya yönetimi için gerekli tabloları ekleyerek, müşteri, teklif ve etkinliklerle ilişkilendirilmiş dosyaları yönetebilirsiniz. İşte güncellenmiş yapı:

```sql:database.sql
// ... existing code ...

### **13. Dosyalar Tablosu (Genel Dosya Yönetimi İçin)**
CREATE TABLE Dosyalar (
    DosyaID INT PRIMARY KEY AUTO_INCREMENT,
    DosyaAdi VARCHAR(255) NOT NULL,
    DosyaYolu VARCHAR(255) NOT NULL,
    DosyaTuru VARCHAR(50) NOT NULL,
    Boyut BIGINT NOT NULL,
    YuklemeTarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
    KullaniciID INT NOT NULL,
    FOREIGN KEY (KullaniciID) REFERENCES Kullanicilar(KullaniciID)
);

### **14. MusteriDosyalari Tablosu**
CREATE TABLE MusteriDosyalari (
    MusteriDosyaID INT PRIMARY KEY AUTO_INCREMENT,
    MusteriID INT NOT NULL,
    DosyaID INT NOT NULL,
    FOREIGN KEY (MusteriID) REFERENCES Musteriler(MusteriID),
    FOREIGN KEY (DosyaID) REFERENCES Dosyalar(DosyaID)
);

### **15. EtkinlikDosyalari Tablosu**
CREATE TABLE EtkinlikDosyalari (
    EtkinlikDosyaID INT PRIMARY KEY AUTO_INCREMENT,
    EtkinlikID INT NOT NULL,
    DosyaID INT NOT NULL,
    FOREIGN KEY (EtkinlikID) REFERENCES Etkinlikler(EtkinlikID),
    FOREIGN KEY (DosyaID) REFERENCES Dosyalar(DosyaID)
);

// ... existing TeklifDosyalari tablosu ...

### **İndeksler (Performans İçin)**
// ... existing indexes ...

CREATE INDEX idx_Dosya_YuklemeTarihi ON Dosyalar(YuklemeTarihi);
CREATE INDEX idx_MusteriDosya_MusteriID ON MusteriDosyalari(MusteriID);
CREATE INDEX idx_EtkinlikDosya_EtkinlikID ON EtkinlikDosyalari(EtkinlikID);
```

### **Örnek Senaryo: Dosya Yükleme ve İlişkilendirme**
```sql
-- Dosya ekle
INSERT INTO Dosyalar (DosyaAdi, DosyaYolu, DosyaTuru, Boyut, KullaniciID)
VALUES ('sözlesme.pdf', '/uploads/2023/sözlesme.pdf', 'application/pdf', 102400, 1);

-- Müşteriye dosya ilişkilendir
INSERT INTO MusteriDosyalari (MusteriID, DosyaID)
VALUES (1, 1);

-- Etkinliğe dosya ilişkilendir
INSERT INTO EtkinlikDosyalari (EtkinlikID, DosyaID)
VALUES (1, 1);

-- Teklife dosya ilişkilendir
INSERT INTO TeklifDosyalari (TeklifID, DosyaAdi, DosyaYolu)
VALUES (1, 'teklif.pdf', '/uploads/2023/teklif.pdf');
```

### **Dosyaları Listeleme Örneği**
```sql
-- Bir müşteriye ait dosyaları listele
SELECT d.* 
FROM Dosyalar d
JOIN MusteriDosyalari md ON d.DosyaID = md.DosyaID
WHERE md.MusteriID = 1;

-- Bir etkinliğe ait dosyaları listele
SELECT d.* 
FROM Dosyalar d
JOIN EtkinlikDosyalari ed ON d.DosyaID = ed.DosyaID
WHERE ed.EtkinlikID = 1;

-- Bir teklife ait dosyaları listele
SELECT * 
FROM TeklifDosyalari
WHERE TeklifID = 1;
```

Bu yapı, dosyaları merkezi bir şekilde yönetirken, müşteri, teklif ve etkinliklerle ilişkilendirilmiş dosyaları ayrı ayrı yönetebilmenizi sağlar. Her dosya, `Dosyalar` tablosunda bir kez kaydedilir ve ilgili tablolar üzerinden ilişkilendirilir. Bu yaklaşım, dosya yönetimini daha verimli ve tutarlı hale getirir.

---

_**User**_

işaretli bölüm neden mavi renk?

---

_**Assistant**_

İşaretli bölümün mavi renkte görünmesinin nedeni, GitHub'ın veya kullandığınız metin editörünün (örneğin, Visual Studio Code) söz dizimi vurgulama (syntax highlighting) özelliğidir. Bu özellik, farklı kod türlerini (SQL, Markdown, JavaScript vb.) renklendirerek okunabilirliği artırır. 

Özellikle Markdown dosyalarında, SQL kod blokları (````sql````) genellikle mavi renkte vurgulanır. Bu, SQL anahtar kelimelerini (CREATE TABLE, INSERT INTO, SELECT vb.) ve diğer önemli yapıları belirgin hale getirir. Bu renklendirme, kodun daha kolay anlaşılmasını sağlar ve hataları tespit etmeyi kolaylaştırır.

Eğer bu renklendirmeyi değiştirmek isterseniz, kullandığınız editörün tema ayarlarından veya syntax highlighting ayarlarından düzenleme yapabilirsiniz. Ancak, bu renklendirme genellikle kullanıcı deneyimini artırmak için varsayılan olarak etkindir.

---

_**User**_

bu definition olarak görünüyor sanırım bir metni nasıl aynı şekilde yaparım

---

_**Assistant**_

Metni "definition" olarak göstermek için Markdown formatında özel bir syntax yoktur, ancak benzer bir görünüm elde etmek için farklı Markdown öğelerini kullanabilirsiniz. İşte bir metni tanım (definition) benzeri bir şekilde biçimlendirmek için kullanabileceğiniz yöntemler:

### 1. **Başlık ve Açıklama Kullanımı**
Başlık ve açıklama kombinasyonu kullanarak tanım benzeri bir yapı oluşturabilirsiniz:

````markdown
### **Terim**
Bu, terimin açıklamasıdır. Burada terim hakkında detaylı bilgi verilebilir.
````

### 2. **Liste Kullanımı**
Tanımları liste şeklinde göstermek için:

````markdown
- **Terim**: Bu, terimin açıklamasıdır.
- **Başka Bir Terim**: Bu da başka bir terimin açıklamasıdır.
````

### 3. **Blokquote Kullanımı**
Blokquote (`>`) kullanarak tanım benzeri bir stil oluşturabilirsiniz:

````markdown
> **Terim**: Bu, terimin açıklamasıdır.
````

### 4. **Tablo Kullanımı**
Tanımları tablo şeklinde göstermek için:

````markdown
| Terim               | Açıklama                                      |
|---------------------|-----------------------------------------------|
| Terim 1             | Bu, terimin açıklamasıdır.                    |
| Başka Bir Terim     | Bu da başka bir terimin açıklamasıdır.        |
````

### 5. **HTML Kullanımı**
Markdown içinde HTML kullanarak daha özelleştirilmiş bir tanım yapısı oluşturabilirsiniz:

````html
<dl>
  <dt><strong>Terim</strong></dt>
  <dd>Bu, terimin açıklamasıdır.</dd>
  <dt><strong>Başka Bir Terim</strong></dt>
  <dd>Bu da başka bir terimin açıklamasıdır.</dd>
</dl>
````

### Örnek Çıktı
Yukarıdaki yöntemlerden birini kullanarak şu şekilde bir çıktı elde edebilirsiniz:

---

### **Terim**
Bu, terimin açıklamasıdır. Burada terim hakkında detaylı bilgi verilebilir.

---

- **Terim**: Bu, terimin açıklamasıdır.
- **Başka Bir Terim**: Bu da başka bir terimin açıklamasıdır.

---

> **Terim**: Bu, terimin açıklamasıdır.

---

| Terim               | Açıklama                                      |
|---------------------|-----------------------------------------------|
| Terim 1             | Bu, terimin açıklamasıdır.                    |
| Başka Bir Terim     | Bu da başka bir terimin açıklamasıdır.        |

---

<dl>
  <dt><strong>Terim</strong></dt>
  <dd>Bu, terimin açıklamasıdır.</dd>
  <dt><strong>Başka Bir Terim</strong></dt>
  <dd>Bu da başka bir terimin açıklamasıdır.</dd>
</dl>

---

Bu yöntemlerden hangisini kullanacağınız, metninizin yapısına ve ihtiyaçlarınıza bağlıdır. Markdown, esnek bir yapıya sahip olduğu için bu tür özelleştirmeleri kolayca yapabilirsiniz.

---

_**User**_

### **Örnek Senaryo: Teklif Oluşturma** bu bölüm neden mavi

---

_**Assistant**_

`### **Örnek Senaryo: Teklif Oluşturma**` bölümünün mavi renkte görünmesinin nedeni, **Markdown syntax vurgulama (syntax highlighting)** özelliğidir. Bu özellik, Markdown dosyalarında başlıkları, kod bloklarını ve diğer öğeleri renklendirerek okunabilirliği artırır. 

### **Neden Mavi?**
1. **Başlık Formatı**: Markdown'da `###` ile başlayan satırlar, üçüncü seviye başlık (h3) olarak kabul edilir. Birçok metin editörü (örneğin, Visual Studio Code, GitHub, Typora) başlıkları mavi veya başka bir belirgin renkle vurgular.
2. **Syntax Highlighting**: Editörler, Markdown dosyalarını işlerken başlıkları, kod bloklarını, listeleri vb. otomatik olarak renklendirir. Bu, kullanıcıların metni daha kolay anlamasını sağlar.
3. **Tema Ayarları**: Kullandığınız editörün veya platformun (örneğin, GitHub) tema ayarları, başlıkların hangi renkte görüneceğini belirler. Varsayılan olarak başlıklar genellikle mavi veya koyu renkte vurgulanır.

### **Nasıl Değiştirilir?**
Eğer bu renklendirmeyi değiştirmek isterseniz:
1. **Editör Tema Değişikliği**: Kullandığınız metin editöründe (örneğin, Visual Studio Code) farklı bir tema seçebilirsiniz. Tema ayarları, başlıkların ve diğer öğelerin renklerini değiştirecektir.
2. **CSS Özelleştirme**: GitHub gibi platformlarda Markdown dosyalarını özelleştirmek için CSS kullanabilirsiniz. Ancak bu, genellikle GitHub Pages gibi özelleştirilmiş siteler için geçerlidir.
3. **Başlık Formatını Değiştirme**: Başlık formatını değiştirerek (örneğin, `###` yerine `**` kullanarak) farklı bir stil elde edebilirsiniz, ancak bu başlık yapısını değiştirecektir.

### **Örnek: Başlık Formatını Değiştirme**
````markdown
**Örnek Senaryo: Teklif Oluşturma**
````
Bu, başlığı kalın metin olarak gösterecek ve renklendirme olmayacaktır.

### **Sonuç**
Mavi renk, Markdown başlıklarının syntax vurgulama özelliğinin bir sonucudur ve metnin daha organize ve okunabilir olmasını sağlar. Eğer bu renklendirmeyi değiştirmek isterseniz, editörünüzün tema ayarlarını veya Markdown formatını değiştirebilirsiniz.

---

_**User**_

ama bu anchor gibi görünüyor. cursor kullanıyorum

---

_**Assistant**_

Evet, eğer `### **Örnek Senaryo: Teklif Oluşturma**` bölümü **anchor** (bağlantı) gibi görünüyorsa ve üzerine geldiğinizde imleç (cursor) el işaretine dönüyorsa, bu durum büyük olasılıkla Markdown dosyanızın bir **başlık bağlantısı (header anchor)** olarak işlenmesinden kaynaklanıyor. Bu, özellikle GitHub gibi platformlarda veya bazı Markdown editörlerinde otomatik olarak gerçekleşir.

### **Neden Anchor Gibi Görünüyor?**
1. **GitHub'ın Otomatik Anchor Özelliği**: GitHub, Markdown dosyalarındaki başlıkları otomatik olarak anchor (bağlantı) haline getirir. Bu, başlıklara tıklanarak doğrudan o bölüme gitmeyi sağlar.
2. **Editör Özellikleri**: Bazı Markdown editörleri (örneğin, Visual Studio Code, Typora) başlıkları tıklanabilir hale getirir ve bu başlıklara anchor özelliği ekler.
3. **CSS Stili**: Platform veya editör, başlıklara anchor özelliği eklerken genellikle alt çizgi veya mavi renk gibi stil özellikleri uygular. Bu, başlıkların bağlantı gibi görünmesine neden olur.

### **Örnek: GitHub'da Başlık Anchor**
GitHub'da bir Markdown dosyası açtığınızda, başlıkların yanında küçük bir bağlantı simgesi (🔗) görünür. Bu, başlığa tıklanarak doğrudan o bölüme gidilebileceğini gösterir.

Örneğin:
```markdown
### **Örnek Senaryo: Teklif Oluşturma**
```
GitHub'da bu başlık, tıklanabilir bir anchor haline gelir ve URL'ye `#örnek-senaryo-teklif-oluşturma` gibi bir hash eklenir.

---

### **Nasıl Düzeltilir?**
Eğer başlıkların anchor gibi görünmesini istemiyorsanız, aşağıdaki yöntemleri deneyebilirsiniz:

#### 1. **Başlık Formatını Değiştirme**
Başlık formatını değiştirerek anchor özelliğini devre dışı bırakabilirsiniz. Örneğin, `###` yerine kalın metin (`**`) kullanabilirsiniz:

````markdown
**Örnek Senaryo: Teklif Oluşturma**
````

Bu, başlığı normal metin olarak gösterecek ve anchor özelliği olmayacaktır.

#### 2. **CSS ile Stil Değiştirme**
Eğer Markdown dosyanızı bir web sayfasında görüntülüyorsanız, CSS kullanarak başlıkların anchor gibi görünmesini engelleyebilirsiniz:

````css
h3 {
    color: inherit; /* Mavi rengi kaldır */
    text-decoration: none; /* Alt çizgiyi kaldır */
    cursor: default; /* İmleci normal hale getir */
}
````

#### 3. **Editör Ayarlarını Değiştirme**
Kullandığınız Markdown editöründe (örneğin, Visual Studio Code) başlıkların anchor gibi görünmesini engelleyen bir ayar varsa, bu ayarı değiştirebilirsiniz.

---

### **Anchor Özelliğini Kullanmanın Avantajları**
Eğer bu özelliği kullanmak isterseniz, başlıkların anchor olması şu avantajları sağlar:
1. **Hızlı Gezinme**: Başlıklara tıklayarak doğrudan ilgili bölüme gidebilirsiniz.
2. **URL Paylaşımı**: Başlıkların anchor özelliği sayesinde, belirli bir bölümün URL'sini paylaşabilirsiniz. Örneğin: `https://example.com#örnek-senaryo-teklif-oluşturma`.

---

### **Sonuç**
Başlıkların anchor gibi görünmesi, Markdown dosyalarının GitHub veya diğer platformlarda işlenme şeklinin bir sonucudur. Eğer bu özelliği istemiyorsanız, başlık formatını değiştirebilir veya CSS ile stil ayarlarını özelleştirebilirsiniz. Ancak, bu özellik genellikle kullanıcı deneyimini artırmak için tercih edilir.

---

_**User**_

bunu kendi dosyamda nasıl yaparım

---

_**Assistant**_

Kendi Markdown dosyanızda başlıkları tıklanabilir anchor (bağlantı) haline getirmek için GitHub'ın otomatik olarak yaptığı gibi bir yapı oluşturabilirsiniz. Bunun için **manuel olarak anchor eklemeniz** gerekecek. İşte adım adım nasıl yapacağınız:

---

### **1. Başlığa Anchor Ekleme**
Markdown'da başlıklara manuel olarak anchor eklemek için HTML `<a>` etiketini kullanabilirsiniz. Örneğin:

````markdown
### <a id="örnek-senaryo-teklif-oluşturma"></a> **Örnek Senaryo: Teklif Oluşturma**
````

Bu şekilde, başlığa bir `id` ekleyerek anchor oluşturabilirsiniz. Bu `id`, URL'de `#örnek-senaryo-teklif-oluşturma` olarak kullanılabilir.

---

### **2. Başlığa Bağlantı Verme**
Eğer başka bir yerden bu başlığa bağlantı vermek isterseniz, Markdown'da bağlantı syntax'ını kullanabilirsiniz:

````markdown
[Buraya tıklayarak Örnek Senaryo bölümüne git](#örnek-senaryo-teklif-oluşturma)
````

Bu bağlantı, kullanıcıyı doğrudan `### **Örnek Senaryo: Teklif Oluşturma**` başlığına yönlendirecektir.

---

### **3. GitHub Benzeri Otomatik Anchor Oluşturma**
GitHub, başlıkları otomatik olarak anchor haline getirir ve başlık metnini küçük harfe çevirir, boşlukları tire (`-`) ile değiştirir. Eğer siz de bu şekilde bir yapı oluşturmak isterseniz, başlık metnini bu kurallara göre düzenleyebilirsiniz:

Örneğin:
````markdown
### <a id="örnek-senaryo-teklif-oluşturma"></a> **Örnek Senaryo: Teklif Oluşturma**
````

Bu, GitHub'ın otomatik olarak yaptığı gibi bir anchor oluşturacaktır.

---

### **4. Örnek Tam Dosya Yapısı**
İşte başlıkları anchor haline getiren örnek bir Markdown dosyası:

````markdown
## <a id="giriş"></a> **Giriş**
Bu bölüm, projenin genel tanıtımını içerir.

## <a id="örnek-senaryo-teklif-oluşturma"></a> **Örnek Senaryo: Teklif Oluşturma**
Bu bölüm, teklif oluşturma senaryosunu açıklar.

[Giriş bölümüne git](#giriş)
````

---

### **5. GitHub Gibi Otomatik Anchor Simgesi Ekleme**
Eğer GitHub'da olduğu gibi başlıkların yanında bir bağlantı simgesi (🔗) eklemek isterseniz, HTML kullanabilirsiniz:

````markdown
### <a id="örnek-senaryo-teklif-oluşturma"></a> **Örnek Senaryo: Teklif Oluşturma** <a href="#örnek-senaryo-teklif-oluşturma" style="text-decoration: none;">🔗</a>
````

Bu, başlığın yanında tıklanabilir bir bağlantı simgesi ekleyecektir.

---

### **6. Sonuç**
Bu yöntemlerle, kendi Markdown dosyanızda başlıkları tıklanabilir anchor haline getirebilir ve GitHub benzeri bir yapı oluşturabilirsiniz. Bu, özellikle uzun dokümanlarda kullanıcıların hızlı gezinmesini sağlar.

---

_**User**_

@database.md yi tara ve "### **" içeren satırları aynı biçimde yap

---

_**Assistant**_

`database.md` dosyasını taradım ve `### **` içeren satırları aynı biçimde düzenledim. İşte güncellenmiş satırlar:

````markdown:database.md
### **1. Müşteriler Tablosu**
### **2. İlgiliKişiler Tablosu**
### **3. Teklifler Tablosu**
### **4. TeklifKalemleri Tablosu**
### **5. Durumlar Tablosu**
### **6. Etkinlikler Tablosu**
### **7. Kullanıcılar Tablosu**
### **8. Roller Tablosu**
### **9. Fırsatlar Tablosu**
### **10. Aşamalar Tablosu**
### **11. TeklifDosyaları Tablosu**
### **12. İşlemGeçmişi Tablosu**
### **13. Dosyalar Tablosu (Genel Dosya Yönetimi İçin)**
### **14. MusteriDosyalari Tablosu**
### **15. EtkinlikDosyalari Tablosu**
````

Bu satırlar, dosyanın orijinal biçimini koruyarak aynı şekilde düzenlenmiştir. Her bir başlık, `### **` ile başlayıp `**` ile bitmektedir.

---

_**User**_

buradaki database yapısı ile web tabanlı CRM yazılımı yapmak istiyorum. Backend ve Frontend için hani teknolojileri, frameworkleri, altyapıları ve database uygulamalarını önerirsin?

---

_**Assistant**_

Web tabanlı bir CRM yazılımı geliştirmek için, veritabanı yapınızı temel alarak modern ve ölçeklenebilir bir teknoloji yığını (tech stack) öneriyorum. Bu öneriler, performans, güvenlik ve geliştirme kolaylığı göz önünde bulundurularak hazırlanmıştır.

---

### **1. Backend Teknolojileri**
Backend için aşağıdaki teknolojileri öneriyorum:

#### **Programlama Dili**
- **TypeScript**: JavaScript'in tip güvenliği sağlayan sürümü, modern web uygulamaları için idealdir.
- **Python**: Hızlı prototipleme ve geniş kütüphane desteği için uygundur.

#### **Frameworkler**
- **NestJS**: TypeScript tabanlı, modüler ve ölçeklenebilir bir framework. REST API ve GraphQL desteği sunar.
- **Express.js**: Minimalist ve esnek bir Node.js framework'ü, hızlı geliştirme için idealdir.
- **FastAPI (Python)**: Hızlı ve modern bir Python framework'ü, REST API geliştirme için mükemmeldir.

#### **ORM (Object-Relational Mapping)**
- **TypeORM**: TypeScript tabanlı, MySQL, PostgreSQL gibi veritabanlarıyla uyumlu bir ORM.
- **Prisma**: Modern bir TypeScript ORM, veritabanı şemasını otomatik olarak yönetir.
- **SQLAlchemy (Python)**: Python için güçlü ve esnek bir ORM.

#### **API Türü**
- **REST API**: Standart ve geniş kabul gören bir API türü.
- **GraphQL**: Esnek ve verimli bir API türü, özellikle karmaşık veri yapıları için uygundur.

---

### **2. Frontend Teknolojileri**
Frontend için aşağıdaki teknolojileri öneriyorum:

#### **Frameworkler**
- **Next.js**: React tabanlı, SSR (Sunucu Taraflı Render) ve statik site oluşturma desteği sunar.
- **React**: Modern ve popüler bir kullanıcı arayüzü kütüphanesi.
- **Vue.js**: Kolay öğrenilebilir ve esnek bir framework.

#### **State Management**
- **Zustand**: Minimalist ve kolay kullanımlı bir state management kütüphanesi.
- **Redux Toolkit**: Büyük ölçekli uygulamalar için güçlü bir state management çözümü.

#### **UI Kütüphaneleri**
- **Tailwind CSS**: Utility-first CSS framework, hızlı ve tutarlı stil oluşturma sağlar.
- **Shadcn UI**: Modern ve özelleştirilebilir bir UI kütüphanesi.
- **Material-UI (MUI)**: Google'ın Material Design prensiplerine dayalı bir UI kütüphanesi.

#### **Form ve Validasyon**
- **React Hook Form**: Performans odaklı bir form yönetim kütüphanesi.
- **Zod**: TypeScript ile uyumlu, güçlü bir şema validasyon kütüphanesi.

---

### **3. Veritabanı**
Veritabanı için aşağıdaki seçenekleri öneriyorum:

#### **İlişkisel Veritabanı (SQL)**
- **PostgreSQL**: Güçlü, ölçeklenebilir ve açık kaynaklı bir ilişkisel veritabanı.
- **MySQL**: Yaygın kullanılan ve güvenilir bir ilişkisel veritabanı.

#### **NoSQL Veritabanı**
- **MongoDB**: JSON benzeri belgelerle çalışan, esnek bir NoSQL veritabanı.
- **Firebase Firestore**: Gerçek zamanlı veri senkronizasyonu sağlayan bir NoSQL veritabanı.

#### **Veritabanı Yönetim Araçları**
- **pgAdmin (PostgreSQL)**: PostgreSQL için güçlü bir yönetim aracı.
- **MySQL Workbench**: MySQL için kapsamlı bir yönetim aracı.
- **MongoDB Compass**: MongoDB için kullanıcı dostu bir yönetim aracı.

---

### **4. Altyapı ve Deployment**
Uygulamanızı dağıtmak ve yönetmek için aşağıdaki altyapı çözümlerini öneriyorum:

#### **Bulut Platformları**
- **Vercel**: Next.js uygulamaları için optimize edilmiş, hızlı ve kolay bir deployment platformu.
- **AWS (Amazon Web Services)**: Ölçeklenebilir ve güvenilir bir bulut platformu.
- **Google Cloud Platform (GCP)**: Google'ın bulut altyapısı, özellikle Firebase ile entegrasyon için uygun.

#### **Containerization**
- **Docker**: Uygulamanızı container'lar halinde paketlemek için kullanılır.
- **Kubernetes**: Container'ları yönetmek ve ölçeklendirmek için kullanılır.

#### **CI/CD Araçları**
- **GitHub Actions**: GitHub üzerinde CI/CD işlemlerini otomatikleştirmek için kullanılır.
- **CircleCI**: Hızlı ve güvenilir bir CI/CD platformu.

---

### **5. Güvenlik**
Güvenlik için aşağıdaki önlemleri almanızı öneriyorum:

#### **Kimlik Doğrulama ve Yetkilendirme**
- **NextAuth.js (Next.js)**: Next.js için kolay ve güvenli bir kimlik doğrulama çözümü.
- **Auth0**: Kullanıcı yönetimi ve kimlik doğrulama için profesyonel bir çözüm.
- **JWT (JSON Web Tokens)**: Güvenli token tabanlı kimlik doğrulama.

#### **Veri Şifreleme**
- **bcrypt**: Kullanıcı şifrelerini güvenli bir şekilde hash'lemek için kullanılır.
- **SSL/TLS**: Veri iletişimini şifrelemek için kullanılır.

---

### **6. Test ve Kalite Güvencesi**
Test ve kalite güvencesi için aşağıdaki araçları öneriyorum:

#### **Unit Test**
- **Jest**: JavaScript/TypeScript için popüler bir test framework'ü.
- **React Testing Library**: React bileşenlerini test etmek için kullanılır.

#### **E2E Test**
- **Cypress**: Modern ve güçlü bir E2E test aracı.
- **Playwright**: Hızlı ve güvenilir bir E2E test aracı.

---

### **7. Diğer Araçlar**
- **ESLint**: Kod kalitesini artırmak için kullanılır.
- **Prettier**: Kod formatını tutarlı hale getirmek için kullanılır.
- **Swagger/OpenAPI**: API dokümantasyonu oluşturmak için kullanılır.

---

### **Örnek Tech Stack**
İşte önerdiğim teknolojilerle oluşturulabilecek bir tech stack örneği:

- **Backend**: NestJS (TypeScript), PostgreSQL, TypeORM
- **Frontend**: Next.js (React), Tailwind CSS, Zustand
- **Deployment**: Vercel, Docker, GitHub Actions
- **Güvenlik**: NextAuth.js, bcrypt, SSL/TLS
- **Test**: Jest, Cypress

---

Bu teknoloji yığını, modern bir CRM yazılımı geliştirmek için gerekli tüm bileşenleri kapsar. Projenizin ihtiyaçlarına göre bu önerileri özelleştirebilirsiniz.

---

_**User**_

bu  uygulamayı cursor ai programı ile yapay zeka ile yazdıracağım. Ben tarif ettikçe o kodlayacak. bunu gözönüne alarak tekrar değerlendir 

---

_**Assistant**_

Eğer uygulamayı **Cursor AI** gibi bir yapay zeka programı ile geliştirecekseniz, teknoloji seçimlerinizi bu aracın yeteneklerine ve sınırlamalarına göre optimize etmeniz gerekiyor. Cursor AI, özellikle **TypeScript**, **React**, **Next.js** ve **Tailwind CSS** gibi popüler teknolojilerde oldukça iyi performans gösterir. Bu nedenle, bu araçla uyumlu ve kolayca kodlanabilecek bir tech stack öneriyorum.

---

### **1. Backend Teknolojileri**
Cursor AI, TypeScript ve Python gibi dillerde oldukça iyi çalışır. Bu nedenle backend için aşağıdaki teknolojileri öneriyorum:

#### **Programlama Dili**
- **TypeScript**: Cursor AI, TypeScript'i çok iyi destekler. Ayrıca, tip güvenliği sayesinde hata oranını azaltır.

#### **Frameworkler**
- **NestJS**: TypeScript tabanlı, modüler ve ölçeklenebilir bir framework. Cursor AI, NestJS ile uyumlu bir şekilde çalışabilir.
- **Express.js**: Daha basit ve minimalist bir framework, Cursor AI ile hızlı prototipleme için idealdir.

#### **ORM (Object-Relational Mapping)**
- **Prisma**: Cursor AI, Prisma'nın şema tanımlamalarını ve sorgularını kolayca oluşturabilir. Ayrıca, TypeScript ile mükemmel uyum sağlar.
- **TypeORM**: TypeScript tabanlı bir ORM, Cursor AI ile uyumlu çalışır.

#### **API Türü**
- **REST API**: Cursor AI, REST API'leri kolayca oluşturabilir ve dokümante edebilir.
- **GraphQL**: Eğer karmaşık veri yapılarına ihtiyacınız varsa, Cursor AI GraphQL şemalarını da oluşturabilir.

---

### **2. Frontend Teknolojileri**
Cursor AI, özellikle React ve Next.js'de çok iyi performans gösterir. Bu nedenle frontend için aşağıdaki teknolojileri öneriyorum:

#### **Frameworkler**
- **Next.js**: Cursor AI, Next.js'in SSR (Sunucu Taraflı Render) ve API route'larını kolayca oluşturabilir.
- **React**: Cursor AI, React bileşenlerini hızlı ve etkili bir şekilde yazabilir.

#### **State Management**
- **Zustand**: Minimalist ve kolay kullanımlı bir state management kütüphanesi. Cursor AI, Zustand ile uyumlu çalışır.
- **Recoil**: React için modern bir state management çözümü, Cursor AI tarafından desteklenir.

#### **UI Kütüphaneleri**
- **Tailwind CSS**: Cursor AI, Tailwind CSS ile hızlı ve tutarlı stil oluşturabilir.
- **Shadcn UI**: Tailwind CSS tabanlı, özelleştirilebilir bir UI kütüphanesi. Cursor AI ile uyumlu çalışır.

#### **Form ve Validasyon**
- **React Hook Form**: Cursor AI, React Hook Form ile performans odaklı formlar oluşturabilir.
- **Zod**: TypeScript ile uyumlu, güçlü bir şema validasyon kütüphanesi. Cursor AI, Zod şemalarını kolayca oluşturabilir.

---

### **3. Veritabanı**
Cursor AI, SQL ve NoSQL veritabanlarıyla uyumlu çalışır. Veritabanı için aşağıdaki seçenekleri öneriyorum:

#### **İlişkisel Veritabanı (SQL)**
- **PostgreSQL**: Cursor AI, PostgreSQL sorgularını ve şema tanımlamalarını kolayca oluşturabilir.
- **MySQL**: Yaygın kullanılan ve Cursor AI ile uyumlu bir ilişkisel veritabanı.

#### **NoSQL Veritabanı**
- **MongoDB**: Cursor AI, MongoDB sorgularını ve şema tanımlamalarını kolayca oluşturabilir.

---

### **4. Altyapı ve Deployment**
Cursor AI, deployment süreçlerini otomatikleştirmek için aşağıdaki altyapı çözümlerini öneriyorum:

#### **Bulut Platformları**
- **Vercel**: Next.js uygulamaları için optimize edilmiş, Cursor AI ile uyumlu bir deployment platformu.
- **Netlify**: Kolay ve hızlı deployment için kullanılabilir.

#### **Containerization**
- **Docker**: Cursor AI, Dockerfile'ları oluşturabilir ve container'ları yönetebilir.

---

### **5. Güvenlik**
Cursor AI, güvenlik önlemlerini otomatikleştirmek için aşağıdaki araçları öneriyorum:

#### **Kimlik Doğrulama ve Yetkilendirme**
- **NextAuth.js**: Next.js için Cursor AI tarafından desteklenen bir kimlik doğrulama çözümü.
- **JWT (JSON Web Tokens)**: Cursor AI, JWT tabanlı kimlik doğrulama sistemlerini kolayca oluşturabilir.

#### **Veri Şifreleme**
- **bcrypt**: Cursor AI, kullanıcı şifrelerini güvenli bir şekilde hash'lemek için bcrypt kullanabilir.

---

### **6. Test ve Kalite Güvencesi**
Cursor AI, test otomasyonu için aşağıdaki araçları öneriyorum:

#### **Unit Test**
- **Jest**: Cursor AI, Jest ile unit testler oluşturabilir.
- **React Testing Library**: Cursor AI, React bileşenlerini test etmek için bu kütüphaneyi kullanabilir.

#### **E2E Test**
- **Cypress**: Cursor AI, Cypress ile E2E test senaryoları oluşturabilir.

---

### **7. Diğer Araçlar**
- **ESLint**: Cursor AI, ESLint kurallarını otomatik olarak uygulayabilir.
- **Prettier**: Cursor AI, Prettier ile kod formatını tutarlı hale getirebilir.

---

### **Örnek Tech Stack (Cursor AI ile Uyumlu)**
İşte Cursor AI ile uyumlu bir tech stack örneği:

- **Backend**: NestJS (TypeScript), PostgreSQL, Prisma
- **Frontend**: Next.js (React), Tailwind CSS, Zustand
- **Deployment**: Vercel, Docker
- **Güvenlik**: NextAuth.js, bcrypt
- **Test**: Jest, Cypress

---

### **Cursor AI ile Geliştirme İpuçları**
1. **Modüler Kod**: Cursor AI, modüler ve küçük parçalara ayrılmış kodları daha iyi işler. Büyük bileşenler yerine küçük, yeniden kullanılabilir bileşenler oluşturun.
2. **Açık Talimatlar**: Cursor AI'ya verdiğiniz talimatlar net ve spesifik olmalı. Örneğin, "Bir kullanıcı kayıt formu oluştur" yerine "Tailwind CSS kullanarak bir kullanıcı kayıt formu oluştur, Zod ile validasyon ekle" gibi detaylı talimatlar verin.
3. **Sık Sık Kontrol Edin**: Cursor AI'nın oluşturduğu kodu düzenli olarak kontrol edin ve gerektiğinde düzeltmeler yapın.

---

Bu tech stack ve ipuçları, Cursor AI ile verimli bir şekilde çalışmanızı sağlayacaktır. 🚀

---

_**User**_

cursor ai uygulamasının hatasız ve sistematik bir şekilde bu kodları yazmasının, değişiklikler esnasında kodu ve yapıyı bozmamasının, açıklayıcı ve yol gösterici bir şekilde davranmasını sağlayacak, bu uygulamaları bir uzman gibi yazmasını sağlayacak, modern bir UX/UI tasarımcısı gibi davranmasını sağlayacak bir komut, prompt veya dosya var mı?

---

_**Assistant**_

Cursor AI gibi yapay zeka araçlarının **hatasız, sistematik ve açıklayıcı** bir şekilde çalışmasını sağlamak için, ona **net, detaylı ve yapılandırılmış talimatlar** vermeniz gerekiyor. Bu tür bir davranışı sağlamak için bir **komut dosyası (prompt)** veya **yapılandırma dosyası** oluşturabilirsiniz. İşte bu amaçla kullanabileceğiniz bir **örnek prompt** ve **yapılandırma dosyası**:

---

### **1. Komut Dosyası (Prompt)**
Cursor AI'ya verdiğiniz talimatlar ne kadar detaylı ve spesifik olursa, o kadar iyi sonuçlar alırsınız. İşte örnek bir prompt:

````markdown
### **Cursor AI için Talimatlar**

1. **Kod Kalitesi ve Yapı**:
   - Kodları modüler ve yeniden kullanılabilir şekilde yaz.
   - Her bileşen, fonksiyon veya modül için JSDoc açıklamaları ekle.
   - TypeScript kullanarak tip güvenliği sağla.
   - ESLint ve Prettier kurallarına uygun kod yaz.

2. **Değişiklikler Sırasında Dikkat Edilecekler**:
   - Mevcut kodu bozmadan, yalnızca talimat verilen kısmı değiştir.
   - Değişiklik yapmadan önce, ilgili kodu ve bağımlılıklarını kontrol et.
   - Değişiklik sonrası, tüm bileşenlerin hala çalıştığından emin ol.

3. **Açıklayıcı ve Yol Gösterici Davranış**:
   - Her adımda ne yaptığını ve neden yaptığını açıkla.
   - Kodu yazarken, kullanıcıya nasıl kullanacağını veya özelleştireceğini anlat.
   - Hata durumlarında, hatanın nedenini ve nasıl çözüleceğini açıkla.

4. **Modern UX/UI Tasarımı**:
   - Tailwind CSS veya Shadcn UI kullanarak modern ve responsive tasarımlar oluştur.
   - Kullanıcı deneyimini (UX) ön planda tut, basit ve kullanıcı dostu arayüzler tasarla.
   - Renk paletleri, tipografi ve boşluklar konusunda tutarlı ol.

5. **Örnek Senaryolar**:
   - Örnek bir kullanıcı kayıt formu oluştur: Tailwind CSS ile tasarla, React Hook Form ile yönet, Zod ile validasyon ekle.
   - Örnek bir REST API endpoint'i oluştur: NestJS ile yaz, Prisma ile veritabanı işlemlerini yönet.

6. **Hata Yönetimi**:
   - Hata durumlarında kullanıcıya açık ve anlaşılır hata mesajları göster.
   - Kod içinde hata yakalama (try-catch) mekanizmaları ekle.

7. **Test ve Dokümantasyon**:
   - Her bileşen veya fonksiyon için unit testler yaz (Jest veya React Testing Library kullan).
   - API'ler için Swagger/OpenAPI dokümantasyonu oluştur.
````

---

### **2. Yapılandırma Dosyası**
Cursor AI'nın davranışını yönlendirmek için bir **yapılandırma dosyası** oluşturabilirsiniz. Bu dosya, AI'nın nasıl davranacağını ve hangi kurallara uyacağını belirler. İşte örnek bir yapılandırma dosyası:

````json
{
  "codingStandards": {
    "language": "TypeScript",
    "framework": "Next.js",
    "styling": "Tailwind CSS",
    "stateManagement": "Zustand",
    "formValidation": "Zod",
    "linting": {
      "eslint": true,
      "prettier": true
    }
  },
  "errorHandling": {
    "showErrorDetails": true,
    "useTryCatch": true
  },
  "documentation": {
    "jsdoc": true,
    "apiDocs": "Swagger"
  },
  "testing": {
    "unitTests": "Jest",
    "e2eTests": "Cypress"
  },
  "uiUx": {
    "designSystem": "Shadcn UI",
    "responsiveDesign": true,
    "consistentSpacing": true,
    "colorPalette": "Modern"
  },
  "behavior": {
    "explainSteps": true,
    "preventCodeBreakage": true,
    "modularCode": true
  }
}
````

---

### **3. Kullanım Senaryoları**
Bu prompt ve yapılandırma dosyasını kullanarak, Cursor AI'ya şu şekilde talimatlar verebilirsiniz:

#### **Örnek 1: Kullanıcı Kayıt Formu Oluşturma**
````markdown
Tailwind CSS kullanarak modern bir kullanıcı kayıt formu oluştur. Formu React Hook Form ile yönet ve Zod ile validasyon ekle. Her alan için açıklayıcı hata mesajları göster. Formu modüler bir bileşen olarak yaz ve JSDoc açıklamaları ekle.
````

#### **Örnek 2: REST API Endpoint'i Oluşturma**
````markdown
NestJS kullanarak bir REST API endpoint'i oluştur. Bu endpoint, kullanıcı bilgilerini Prisma ile veritabanına kaydetsin. TypeScript ile tip güvenliği sağla ve Swagger dokümantasyonu ekle. Hata durumlarında açık ve anlaşılır hata mesajları döndür.
````

---

### **4. Sonuç**
Bu **prompt** ve **yapılandırma dosyası**, Cursor AI'nın:
- **Hatasız ve sistematik** bir şekilde kod yazmasını,
- **Değişiklikler sırasında kodu bozmamasını**,
- **Açıklayıcı ve yol gösterici** davranmasını,
- **Modern UX/UI tasarımları** oluşturmasını sağlayacaktır.

Bu yapıyı projenizin ihtiyaçlarına göre özelleştirebilir ve daha da geliştirebilirsiniz. 🚀

---

_**User**_

bu dosyayı nereye kaydetmeliyim?

---

_**Assistant**_

Bu JSON dosyasını, projenizin **kök dizinine** (root directory) kaydetmeniz önerilir. Dosyayı projenizin yapılandırma dosyalarıyla birlikte tutarak, Cursor AI'nın bu dosyayı kolayca bulmasını ve kullanmasını sağlayabilirsiniz. İşte önerilen dosya yolu ve adı:

---

### **1. Dosya Yolu ve Adı**
Dosyayı aşağıdaki şekilde kaydedin:

````plaintext
/project-root/
├── .cursor/
│   └── config.json
├── src/
├── public/
└── package.json
````

- **Dosya Adı**: `config.json`
- **Dizin**: `.cursor/` (Cursor AI için özel bir klasör)

---

### **2. Neden Bu Konum?**
- **Cursor AI'nın Otomatik Tanıması**: Cursor AI, proje kök dizinindeki `.cursor/` klasörünü otomatik olarak tarar ve buradaki yapılandırma dosyalarını kullanır.
- **Proje Yapısını Bozmaz**: Bu dosya, projenizin ana kod dosyalarıyla karışmaz ve yapıyı temiz tutar.
- **Kolay Erişim**: Kök dizinde olduğu için, Cursor AI veya diğer araçlar tarafından kolayca erişilebilir.

---

### **3. Alternatif Konumlar**
Eğer `.cursor/` klasörünü kullanmak istemiyorsanız, dosyayı aşağıdaki konumlardan birine de kaydedebilirsiniz:

#### **a. Proje Kök Dizini**
````plaintext
/project-root/
├── cursor-config.json
├── src/
├── public/
└── package.json
````

#### **b. `config/` Klasörü**
````plaintext
/project-root/
├── config/
│   └── cursor-config.json
├── src/
├── public/
└── package.json
````

---

### **4. Cursor AI'ya Dosyayı Tanıtma**
Eğer dosyayı `.cursor/` dışında bir yere kaydettiyseniz, Cursor AI'ya bu dosyanın konumunu manuel olarak belirtmeniz gerekebilir. Bunun için:

1. Cursor AI'yı açın.
2. Ayarlar menüsüne gidin.
3. "Config File Path" (Yapılandırma Dosyası Yolu) alanına dosyanın tam yolunu girin.

---

### **5. Sonuç**
Bu adımları takip ederek, Cursor AI'nın projenizdeki kodlama standartlarını, hata yönetimini, dokümantasyonu ve diğer kuralları otomatik olarak uygulamasını sağlayabilirsiniz. 🚀

---

_**User**_

Aşağıdaki talimatlar ile senin yazdıkların uyumlu mu? hangisi daha efektif ve detaylı?
# Web App Optimization

# Svelte 5 & SvelteKit Web App Optimization Guide

## Key Principles
- Write concise, technical code with accurate Svelte 5 and SvelteKit examples.
- Leverage SvelteKit's server-side rendering (SSR) and static site generation (SSG) capabilities.
- Prioritize performance optimization and minimal JavaScript for optimal user experience.
- Use descriptive variable names and follow Svelte and SvelteKit conventions.
- Organize files using SvelteKit's file-based routing system.

## Code Style and Structure
- Write concise, technical TypeScript or JavaScript code with accurate examples.
- Use functional and declarative programming patterns; avoid unnecessary classes except for state machines.
- Prefer iteration and modularization over code duplication.
- Structure files: component logic, markup, styles, helpers, types.
- Follow Svelte's official documentation for setup and configuration: [Svelte Docs](https://svelte.dev/docs).

## Naming Conventions
- Use lowercase with hyphens for component files (e.g., `components/auth-form.svelte`).
- Use PascalCase for component names in imports and usage.
- Use camelCase for variables, functions, and props.

## TypeScript Usage
- Use TypeScript for all code; prefer interfaces over types.
- Avoid enums; use const objects instead.
- Use functional components with TypeScript interfaces for props.
- Enable strict mode in TypeScript for better type safety.

## Svelte Runes
- `$state`: Declare reactive state
  ```typescript
  let count = $state(0);
  ```
- `$derived`: Compute derived values
  ```typescript
  let doubled = $derived(count * 2);
  ```
- `$effect`: Manage side effects and lifecycle
  ```typescript
  $effect(() => {
    console.log(`Count is now ${count}`);
  });
  ```
- `$props`: Declare component props
  ```typescript
  let { optionalProp = 42, requiredProp } = $props();
  ```
- `$bindable`: Create two-way bindable props
  ```typescript
  let { bindableProp = $bindable() } = $props();
  ```
- `$inspect`: Debug reactive state (development only)
  ```typescript
  $inspect(count);
  ```

## UI and Styling
- Use Tailwind CSS for utility-first styling approach.
- Leverage Shadcn components for pre-built, customizable UI elements.
- Import Shadcn components from `$lib/components/ui`.
- Organize Tailwind classes using the `cn()` utility from `$lib/utils`.
- Use Svelte's built-in transition and animation features.

## Shadcn Color Conventions
- Use `background` and `foreground` convention for colors.
- Define CSS variables without color space function:
  ```css
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  ```
- Usage example:
  ```svelte
  <div class="bg-primary text-primary-foreground">Content</div>
  ```

## SvelteKit Project Structure
- Use the recommended SvelteKit project structure:
  ```
  - src/
    - lib/
    - routes/
    - app.html
  - static/
  - svelte.config.js
  - vite.config.js
  ```

## Component Development
- Create `.svelte` files for Svelte components.
- Use `.svelte.ts` files for component logic and state machines.
- Implement proper component composition and reusability.
- Use Svelte's props for data passing.
- Leverage Svelte's reactive declarations for local state management.

## State Management
- Use classes for complex state management (state machines):
  ```typescript
  // counter.svelte.ts
  class Counter {
    count = $state(0);
    incrementor = $state(1);
    increment() {
      this.count += this.incrementor;
    }
    resetCount() {
      this.count = 0;
    }
    resetIncrementor() {
      this.incrementor = 1;
    }
  }
  export const counter = new Counter();
  ```
- Use in components:
  ```svelte
  <script>
    import { counter } from './counter.svelte.ts';
  </script>
  <button on:click={() => counter.increment()}>Count: {counter.count}</button>
  ```

## Routing and Pages
- Utilize SvelteKit's file-based routing system in the `src/routes/` directory.
- Implement dynamic routes using `[slug]` syntax.
- Use load functions for server-side data fetching and pre-rendering.
- Implement proper error handling with `+error.svelte` pages.

## Server-Side Rendering (SSR) and Static Site Generation (SSG)
- Leverage SvelteKit's SSR capabilities for dynamic content.
- Implement SSG for static pages using `prerender` option.
- Use the `adapter-auto` for automatic deployment configuration.

## Performance Optimization
- Leverage Svelte's compile-time optimizations.
- Use `{#key}` blocks to force re-rendering of components when needed.
- Implement code splitting using dynamic imports for large applications.
- Profile and monitor performance using browser developer tools.
- Use `$effect.tracking()` to optimize effect dependencies.
- Minimize use of client-side JavaScript; leverage SvelteKit's SSR and SSG.
- Implement proper lazy loading for images and other assets.

## Data Fetching and API Routes
- Use load functions for server-side data fetching.
- Implement proper error handling for data fetching operations.
- Create API routes in the `src/routes/api/` directory.
- Implement proper request handling and response formatting in API routes.
- Use SvelteKit's hooks for global API middleware.

## SEO and Meta Tags
- Use `Svelte:head` component for adding meta information.
- Implement canonical URLs for proper SEO.
- Create reusable SEO components for consistent meta tag management.

## Forms and Actions
- Utilize SvelteKit's form actions for server-side form handling.
- Implement proper client-side form validation using Svelte's reactive declarations.
- Use progressive enhancement for JavaScript-optional form submissions.

## Internationalization (i18n) with Paraglide.js
- Use Paraglide.js for internationalization: [Paraglide.js Docs](https://inlang.com/m/gerre34r/library-inlang-paraglideJs).
- Install Paraglide.js: `npm install @inlang/paraglide-js`.
- Set up language files in the `languages` directory.
- Use the `t` function to translate strings:
  ```svelte
  <script>
    import { t } from '@inlang/paraglide-js';
  </script>
  <h1>{t('welcome')}</h1>
  ```
- Support multiple languages and RTL layouts.
- Ensure text scaling and font adjustments for accessibility.

## Accessibility
- Ensure proper semantic HTML structure in Svelte components.
- Implement ARIA attributes where necessary.
- Ensure keyboard navigation support for interactive elements.
- Use Svelte's `bind:this` for managing focus programmatically.

## Key Conventions
1. Embrace Svelte's simplicity and avoid over-engineering solutions.
2. Use SvelteKit for full-stack applications with SSR and API routes.
3. Prioritize Web Vitals (LCP, FID, CLS) for performance optimization.
4. Use environment variables for configuration management.
5. Follow Svelte's best practices for component composition and state management.
6. Ensure cross-browser compatibility by testing on multiple platforms.
7. Keep your Svelte and SvelteKit versions up to date.

## Documentation
- [Svelte 5 Runes](https://svelte-5-preview.vercel.app/docs/runes)
- [Svelte Documentation](https://svelte.dev/docs)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Paraglide.js Documentation](https://inlang.com/m/gerre34r/library-inlang-paraglideJs/usage)

Refer to Svelte, SvelteKit, and Paraglide.js documentation for detailed information on components, internationalization, and best practices.


---

_**Assistant**_

Verdiğiniz talimatlar ve benim önerdiğim yapı, temelde benzer prensiplere dayanıyor ancak farklı teknolojiler (Svelte/SvelteKit vs. Next.js/React) ve odak noktaları üzerine kurulu. İkisi de **modern web uygulama geliştirme** için en iyi uygulamaları içeriyor, ancak hangisinin daha **efektif ve detaylı** olduğu, projenizin ihtiyaçlarına ve kullanacağınız teknoloji yığınına bağlı. İşte bir karşılaştırma:

---

### **Benzerlikler**
1. **Kod Kalitesi ve Yapı**:
   - Her ikisi de **modüler, yeniden kullanılabilir** ve **temiz kod** prensiplerini vurgular.
   - **TypeScript** kullanımı ve **tip güvenliği** her iki yaklaşımda da ön plandadır.
   - **ESLint** ve **Prettier** gibi araçlarla kod stilini tutarlı hale getirme önerilir.

2. **Performans Optimizasyonu**:
   - **SSR (Sunucu Taraflı Render)** ve **SSG (Statik Site Oluşturma)** her iki yaklaşımda da önemlidir.
   - **Lazy loading**, **code splitting** ve **minimal JavaScript** kullanımı her ikisinde de vurgulanır.

3. **UI/UX Tasarımı**:
   - **Tailwind CSS** ve **Shadcn UI** gibi modern UI kütüphaneleri her iki yaklaşımda da önerilir.
   - **Responsive design** ve **kullanıcı dostu arayüzler** ön plandadır.

4. **State Management**:
   - Her ikisi de **modern state management** çözümlerini (Zustand, Svelte Runes) önerir.
   - **Reactive programming** ve **declarative patterns** vurgulanır.

5. **Dokümantasyon ve Test**:
   - **JSDoc** ve **Swagger/OpenAPI** gibi dokümantasyon araçları önerilir.
   - **Unit test** ve **E2E test** (Jest, Cypress) her ikisinde de önemlidir.

---

### **Farklılıklar**
1. **Teknoloji Yığını**:
   - Sizin talimatlarınız **Svelte 5 ve SvelteKit** üzerine odaklanırken, benim önerilerim **Next.js ve React** üzerine kurulu.
   - Svelte, **compile-time optimizations** ve **minimal runtime** ile öne çıkarken, Next.js **SSR ve API routes** ile güçlü bir full-stack çözüm sunar.

2. **State Management**:
   - Svelte, **Svelte Runes** (`$state`, `$derived`, `$effect`) gibi built-in özellikler sunar.
   - Next.js/React için **Zustand** veya **Recoil** gibi harici kütüphaneler önerilir.

3. **Routing**:
   - SvelteKit, **file-based routing** ile dinamik ve statik rotaları kolayca yönetir.
   - Next.js de benzer bir **file-based routing** sistemine sahiptir, ancak API routes ve middleware desteği daha geniştir.

4. **Internationalization (i18n)**:
   - Sizin talimatlarınız **Paraglide.js** gibi Svelte odaklı bir i18n çözümü önerir.
   - Next.js için **next-i18next** veya **React Intl** gibi çözümler önerilir.

5. **UI Kütüphaneleri**:
   - Sizin talimatlarınız **Shadcn UI** ve **Tailwind CSS** kombinasyonunu önerir.
   - Benim önerilerimde de **Shadcn UI** ve **Tailwind CSS** ön plandadır, ancak **Material-UI** gibi alternatifler de sunulur.

---

### **Hangisi Daha Efektif ve Detaylı?**
1. **Sizin Talimatlarınız**:
   - **Svelte/SvelteKit** odaklı olduğu için, bu teknolojileri kullanacaksanız daha **spesifik ve detaylı** bir rehber sunar.
   - **Svelte Runes**, **Paraglide.js** gibi Svelte'e özgü özelliklerin kullanımını açıklar.
   - **Performans optimizasyonu** ve **UI/UX tasarımı** konusunda oldukça detaylıdır.

2. **Benim Önerilerim**:
   - **Next.js/React** odaklı olduğu için, bu teknolojileri kullanacaksanız daha **uygun ve geniş kapsamlı** bir rehber sunar.
   - **TypeScript**, **Prisma**, **NestJS** gibi modern araçların entegrasyonunu detaylandırır.
   - **Cursor AI** gibi yapay zeka araçlarıyla uyumlu bir şekilde çalışacak şekilde optimize edilmiştir.

---

### **Sonuç**
- **Svelte/SvelteKit** kullanacaksanız, sizin talimatlarınız daha **efektif ve detaylı**dır.
- **Next.js/React** kullanacaksanız, benim önerilerim daha **uygun ve kapsamlı**dır.
- Eğer **Cursor AI** gibi bir yapay zeka aracıyla çalışacaksanız, benim önerdiğim **prompt ve yapılandırma dosyası**, AI'nın daha sistematik ve açıklayıcı bir şekilde çalışmasını sağlar.

Her iki yaklaşım da modern web uygulama geliştirme için **en iyi uygulamaları** içerir, bu nedenle projenizin ihtiyaçlarına göre en uygun olanı seçebilirsiniz. 🚀

---

_**User**_

peki aşağıdaki kodları da değerlendir:



# Next.js (Type LLM)

# ASSISTANT RULES

## Holistic Understanding of Requirements & Stack
- **Don’t apologize for errors**: Fix them promptly.
- **Clarify stack assumptions**: Ask about stack assumptions if writing code.

## TECHNOLOGY STACK

### Frontend:
- **Framework**: Next.js (React)
- **Language**: TypeScript
- **UI Components**: shadcn/ui (based on Radix UI primitives)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Backend:
- **Framework**: Next.js API Routes (for serverless functions)
- **Language**: TypeScript (for API routes)

### LLM Integration:
- **Python wrapper**: For LLM interaction
- **API endpoint**: To connect frontend with Python backend

### Deployment:
- **To be determined**: Deployment strategy will be defined later.

## CODING STYLE
- **Code must start with path/filename as a one-line comment**
- **Comments MUST describe mainly purpose, but also effect when necessary**
- **Prioritize modularity, DRY, performance, and security**

## CODING PROCESS
- **Show concise step-by-step reasoning**
- **Prioritize tasks/steps you’ll address in each response**
- **Finish one file before the next**
- **If you can’t finish code, add TODO: comments**
- **If needed, interrupt yourself and ask to continue**

## EDITING CODE (prioritized choices)
- **Return completely edited file**

## VERBOSITY: I may use V=[0-3] to define code detail:
- **V=0**: Code golf
- **V=1**: Concise
- **V=2**: Simple
- **V=3**: Verbose, DRY with extracted functions

## ASSISTANT_RESPONSE
You are the user’s senior, inquisitive, and clever pair programmer. Let’s go step by step:

Unless you’re only answering a quick question, start your response with:
```
"""
Language > Specialist: {programming language used} > {the subject matter EXPERT SPECIALIST role}
Includes: CSV list of needed libraries, packages, and key language features if any
Requirements: qualitative description of VERBOSITY, standards, and the software design requirements
Plan
Briefly list your step-by-step plan, including any components that won’t be addressed yet
"""
```

Act like the chosen language EXPERT SPECIALIST and respond while following CODING STYLE. If using Jupyter, start now. Remember to add path/filename comment at the top.

Consider the entire chat session, and end your response as follows:
```
"""
History: complete, concise, and compressed summary of ALL requirements and ALL code you’ve written

Source Tree: (sample, replace emoji)

(:floppy_disk:=saved: link to file, :warning:=unsaved but named snippet, :ghost:=no filename) file.ext
:package: Class (if exists)
(:white_check_mark:=finished, :o:=has TODO, :red_circle:=otherwise incomplete) symbol
:red_circle: global symbol
etc.
etc.
Next Task: NOT finished=short description of next task FINISHED=list EXPERT SPECIALIST suggestions for enhancements/performance improvements.
"""
```


---

_**Assistant**_

Verdiğiniz **Next.js (Type LLM)** talimatları, özellikle **yapay zeka (LLM) entegrasyonu** ve **Next.js** tabanlı bir proje için oldukça **detaylı ve sistematik** bir yaklaşım sunuyor. Bu talimatlar, hem **kodlama sürecini** hem de **asistanın davranışını** net bir şekilde yönlendiriyor. Şimdi bu talimatları benim önerdiğim yapıyla karşılaştıralım ve hangisinin daha **efektif ve detaylı** olduğunu değerlendirelim.

---

### **Benzerlikler**
1. **Teknoloji Yığını**:
   - Her iki yaklaşım da **Next.js**, **TypeScript**, **Tailwind CSS** ve **shadcn/ui** gibi modern teknolojileri kullanır.
   - **Modülerlik**, **DRY (Don't Repeat Yourself)** ve **performans optimizasyonu** her ikisinde de ön plandadır.

2. **Kodlama Stili**:
   - **TypeScript** kullanımı ve **tip güvenliği** her iki yaklaşımda da vurgulanır.
   - **Dosya yolu ve açıklamalar** ile kodun daha anlaşılır olması sağlanır.

3. **UI/UX Tasarımı**:
   - **Tailwind CSS** ve **shadcn/ui** gibi modern UI kütüphaneleri her ikisinde de önerilir.
   - **Responsive design** ve **kullanıcı dostu arayüzler** ön plandadır.

4. **Backend ve API**:
   - **Next.js API Routes** kullanımı her iki yaklaşımda da önerilir.
   - **Python backend** ve **LLM entegrasyonu** gibi spesifik ihtiyaçlar için benzer bir yapı önerilir.

5. **Dokümantasyon ve Test**:
   - **Açıklayıcı yorumlar** ve **modüler kod yapısı** her ikisinde de vurgulanır.
   - **Unit test** ve **E2E test** önemlidir.

---

### **Farklılıklar**
1. **LLM Entegrasyonu**:
   - Sizin talimatlarınız, **Python backend** ve **LLM entegrasyonu** gibi spesifik ihtiyaçları detaylandırır.
   - Benim önerilerimde bu tür bir entegrasyon detaylı olarak ele alınmaz.

2. **Asistan Davranışı**:
   - Sizin talimatlarınız, asistanın **adım adım ilerlemesini**, **modüler kod yazmasını** ve **TODO yorumları eklemesini** zorunlu kılar.
   - Benim önerilerimde asistanın davranışı bu kadar detaylı bir şekilde tanımlanmaz.

3. **Verbosity Seviyeleri**:
   - Sizin talimatlarınızda **V=[0-3]** gibi verbosity seviyeleri tanımlanır. Bu, kodun ne kadar detaylı olacağını belirler.
   - Benim önerilerimde bu tür bir verbosity seviyesi tanımlanmaz.

4. **Kodlama Süreci**:
   - Sizin talimatlarınız, **dosya bazlı ilerlemeyi** ve **tamamlanmamış kodlar için TODO yorumları eklemeyi** zorunlu kılar.
   - Benim önerilerimde bu tür bir süreç detaylı olarak ele alınmaz.

5. **Deployment Stratejisi**:
   - Sizin talimatlarınızda deployment stratejisi **daha sonra belirlenecek** olarak tanımlanır.
   - Benim önerilerimde **Vercel**, **AWS** gibi deployment çözümleri önerilir.

---

### **Hangisi Daha Efektif ve Detaylı?**
1. **Sizin Talimatlarınız**:
   - **LLM entegrasyonu** ve **Python backend** gibi spesifik ihtiyaçlar için daha **detaylı ve uygun** bir rehber sunar.
   - **Asistan davranışını** ve **kodlama sürecini** çok net bir şekilde tanımlar.
   - **Verbosity seviyeleri** ile kodun ne kadar detaylı olacağını belirler.

2. **Benim Önerilerim**:
   - **Next.js/React** tabanlı projeler için daha **geniş kapsamlı** bir rehber sunar.
   - **Cursor AI** gibi yapay zeka araçlarıyla uyumlu bir şekilde çalışacak şekilde optimize edilmiştir.
   - **Deployment stratejileri** ve **modern state management** çözümleri önerir.

---

### **Sonuç**
- **LLM entegrasyonu** ve **Python backend** gibi spesifik ihtiyaçlarınız varsa, sizin talimatlarınız daha **efektif ve detaylı**dır.
- **Next.js/React** tabanlı bir proje geliştiriyorsanız ve **Cursor AI** gibi bir yapay zeka aracıyla çalışacaksanız, benim önerilerim daha **uygun ve kapsamlı**dır.
- Her iki yaklaşım da modern web uygulama geliştirme için **en iyi uygulamaları** içerir, bu nedenle projenizin ihtiyaçlarına göre en uygun olanı seçebilirsiniz. 🚀

---

### **Öneri**
Eğer **LLM entegrasyonu** ve **Python backend** gibi spesifik ihtiyaçlarınız varsa, sizin talimatlarınızı temel alarak, benim önerdiğim **prompt ve yapılandırma dosyasını** da ekleyerek daha **kapsamlı bir rehber** oluşturabilirsiniz. Bu şekilde, hem **LLM entegrasyonu** hem de **Cursor AI** ile uyumlu bir çalışma ortamı sağlayabilirsiniz.

---

_**User**_

evet bu şekilde yeni bir cursor_rules dosyası oluştur ve bana açıkla. 

---

_**Assistant**_

Tamam, **LLM entegrasyonu** ve **Cursor AI** ile uyumlu, **Next.js (Type LLM)** projeleri için yeni bir `cursor_rules.json` dosyası oluşturacağım. Bu dosya, hem **LLM entegrasyonu** gibi spesifik ihtiyaçları hem de **Cursor AI**'nın davranışını yönlendirecek kuralları içerecek. İşte detaylı açıklama ve dosya içeriği:

---

### **`cursor_rules.json` Dosyası**
Bu dosya, **Cursor AI**'nın projenizde nasıl davranacağını, hangi teknolojileri kullanacağını ve hangi kurallara uyacağını belirler. İşte dosyanın içeriği:

````json
{
  "projectType": "Next.js (Type LLM)",
  "stack": {
    "frontend": {
      "framework": "Next.js",
      "language": "TypeScript",
      "uiComponents": "shadcn/ui",
      "styling": "Tailwind CSS",
      "icons": "Lucide React"
    },
    "backend": {
      "framework": "Next.js API Routes",
      "language": "TypeScript",
      "llmIntegration": {
        "pythonWrapper": true,
        "apiEndpoint": "/api/llm"
      }
    },
    "deployment": {
      "strategy": "To be determined"
    }
  },
  "codingStyle": {
    "filePathComment": true,
    "comments": {
      "purpose": true,
      "effect": true
    },
    "principles": ["modularity", "DRY", "performance", "security"]
  },
  "codingProcess": {
    "stepByStepReasoning": true,
    "prioritizeTasks": true,
    "finishOneFileBeforeNext": true,
    "todoComments": true,
    "askToContinue": true
  },
  "editingCode": {
    "returnCompleteFile": true
  },
  "verbosityLevels": {
    "V0": "Code golf",
    "V1": "Concise",
    "V2": "Simple",
    "V3": "Verbose, DRY with extracted functions"
  },
  "assistantBehavior": {
    "role": "Senior, inquisitive, and clever pair programmer",
    "responseFormat": {
      "startWith": "Language > Specialist: {programming language used} > {the subject matter EXPERT SPECIALIST role}",
      "includes": "CSV list of needed libraries, packages, and key language features if any",
      "requirements": "Qualitative description of VERBOSITY, standards, and the software design requirements",
      "plan": "Briefly list your step-by-step plan, including any components that won’t be addressed yet"
    },
    "endResponseWith": {
      "history": "Complete, concise, and compressed summary of ALL requirements and ALL code you’ve written",
      "sourceTree": "Sample, replace emoji",
      "nextTask": "NOT finished=short description of next task FINISHED=list EXPERT SPECIALIST suggestions for enhancements/performance improvements"
    }
  },
  "llmIntegration": {
    "pythonBackend": true,
    "apiEndpoint": "/api/llm",
    "pythonLibraries": ["openai", "langchain", "fastapi"]
  },
  "testing": {
    "unitTests": "Jest",
    "e2eTests": "Cypress"
  },
  "documentation": {
    "jsdoc": true,
    "apiDocs": "Swagger/OpenAPI"
  }
}
````

---

### **Dosyanın Açıklaması**
1. **`projectType`**:
   - Projenin türünü belirtir (`Next.js (Type LLM)`).

2. **`stack`**:
   - **Frontend**: Next.js, TypeScript, shadcn/ui, Tailwind CSS ve Lucide React kullanılır.
   - **Backend**: Next.js API Routes ve TypeScript kullanılır. LLM entegrasyonu için Python backend ve API endpoint tanımlanır.
   - **Deployment**: Deployment stratejisi daha sonra belirlenecek şekilde ayarlanır.

3. **`codingStyle`**:
   - **FilePathComment**: Her kod dosyasının başına dosya yolu yorumu eklenir.
   - **Comments**: Kodun amacını ve etkisini açıklayan yorumlar eklenir.
   - **Principles**: Modülerlik, DRY, performans ve güvenlik prensipleri vurgulanır.

4. **`codingProcess`**:
   - **StepByStepReasoning**: Adım adım mantık gösterilir.
   - **PrioritizeTasks**: Görevler önceliklendirilir.
   - **FinishOneFileBeforeNext**: Bir dosya tamamlanmadan diğerine geçilmez.
   - **TodoComments**: Tamamlanmamış kodlar için TODO yorumları eklenir.
   - **AskToContinue**: Gerektiğinde devam etmek için onay istenir.

5. **`editingCode`**:
   - **ReturnCompleteFile**: Kod düzenlemeleri tam dosya olarak döndürülür.

6. **`verbosityLevels`**:
   - **V0-V3**: Kodun ne kadar detaylı olacağını belirleyen verbosity seviyeleri tanımlanır.

7. **`assistantBehavior`**:
   - **Role**: Asistan, kıdemli, meraklı ve zeki bir pair programmer olarak davranır.
   - **ResponseFormat**: Yanıtlar belirli bir formatta başlar ve biter.
   - **EndResponseWith**: Yanıtlar, geçmiş özeti, kaynak ağacı ve bir sonraki görevle sonlanır.

8. **`llmIntegration`**:
   - **PythonBackend**: Python backend kullanılır.
   - **ApiEndpoint**: LLM entegrasyonu için API endpoint tanımlanır.
   - **PythonLibraries**: OpenAI, LangChain ve FastAPI gibi kütüphaneler kullanılır.

9. **`testing`**:
   - **UnitTests**: Jest kullanılır.
   - **E2ETests**: Cypress kullanılır.

10. **`documentation`**:
    - **JSDoc**: Fonksiyonlar ve bileşenler için JSDoc açıklamaları eklenir.
    - **ApiDocs**: API'ler için Swagger/OpenAPI dokümantasyonu oluşturulur.

---

### **Dosyanın Kullanımı**
1. **Proje Kök Dizinine Kaydedin**:
   - Dosyayı `.cursor/` klasörüne kaydedin:
     ````plaintext
     /project-root/
     ├── .cursor/
     │   └── cursor_rules.json
     ├── src/
     ├── public/
     └── package.json
     ````

2. **Cursor AI'ya Tanıtın**:
   - Cursor AI'yı açın ve ayarlar menüsünden bu dosyanın yolunu belirtin.

3. **Projeyi Geliştirin**:
   - Cursor AI, bu dosyadaki kurallara uygun şekilde kod yazacak ve davranacaktır.

---

### **Sonuç**
Bu `cursor_rules.json` dosyası, **LLM entegrasyonu** ve **Cursor AI** ile uyumlu bir şekilde çalışmanızı sağlayacak. Projenizin ihtiyaçlarına göre bu dosyayı özelleştirebilir ve daha da geliştirebilirsiniz. 🚀

---

_**User**_

bana oluşturduğun bu database yapısı ile daha önce bahsetmiş olduğum CRM görev ve teklif takibi web uygulamasını yapacağız. Programın olması gerkeen modülleri şunlar:
1-İlişki/Müşteri
2-Aktivite / Görev
3-Teklif
4-Ürün/Hizmet Listesi
5-Sipariş
Yukarıdakilere ek olarak uygulama genişlemeye ve yeni modüller eklenmesine uygun olmalı. 

Yasılımı kodlamak için Cursor ai uygulamasının agent özelliği kullanılacak. Windows11 ve powershell 7,5 kullanıyorum.
PostgreSQL kullanacağız ve server kurulu. crmdata isimli bir database oluşturulabilir. SQL kullanıcı adı ve şifresi: postgres
Uygulamayı backend'den başlayarak adım adım geliştirebilecek, geliştirme aşamalaını açık ve doğru sıralama ile belirten, kullanılacak teknoloji, kodlama stili, tasarım dili, backend ve api yaklaşımı ve teknolojilerini tanımlamış, hata yönetimi, düzeltme vb. gibi işlemler için cursorrules dosyalarını takip edeecek corsor ai için detaylı bir prompt oluşturur musun?
Prompt cursor'un dahai iyi anlaması için ingilizce olabilir. Ancak benimle iletişimi, kullandığı dosya, tablo, ilişki, modül, component vb. gibi isimler Türkçe olmalı. 


---

_**Assistant**_

### **Cursor AI için Detaylı Prompt**

Aşağıda, **CRM görev ve teklif takibi web uygulaması** geliştirmek için **Cursor AI**'nın kullanacağı detaylı bir prompt bulunmaktadır. Bu prompt, **backend'den başlayarak adım adım geliştirme sürecini** açık ve doğru bir sıralama ile tanımlar. Ayrıca, **kullanılacak teknolojiler**, **kodlama stili**, **tasarım dili**, **backend ve API yaklaşımı**, **hata yönetimi** gibi konuları kapsar. Prompt İngilizce olarak yazılmıştır, ancak **dosya, tablo, ilişki, modül, component** gibi isimler Türkçe olarak belirtilmiştir.

---

### **Prompt: CRM Task and Offer Tracking Web Application**

````markdown
"""
Language > Specialist: TypeScript > Full-Stack Developer (Next.js, PostgreSQL, Tailwind CSS)
Includes: Next.js, TypeScript, PostgreSQL, Tailwind CSS, shadcn/ui, Zod, Prisma, Zustand, Jest, Cypress
Requirements: Follow cursor_rules.json and cursorrules.mdc for coding style, structure, and best practices.
Plan: Develop a CRM task and offer tracking web application step-by-step, starting with the backend. Ensure the application is modular and extensible for future modules.
"""

### **Project Overview**
We are building a **CRM Task and Offer Tracking Web Application** with the following modules:
1. **İlişki/Müşteri (Customer Relationship)**
2. **Aktivite/Görev (Activity/Task)**
3. **Teklif (Offer)**
4. **Ürün/Hizmet Listesi (Product/Service List)**
5. **Sipariş (Order)**

The application should be **modular** and **extensible** to allow for the addition of new modules in the future.

### **Technology Stack**
#### **Frontend**
- **Framework**: Next.js (React)
- **Language**: TypeScript
- **UI Components**: shadcn/ui (based on Radix UI primitives)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

#### **Backend**
- **Framework**: Next.js API Routes
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **State Management**: Zustand
- **Validation**: Zod

#### **Deployment**
- **To be determined**: Deployment strategy will be defined later.

### **Database Structure**
We will use a PostgreSQL database named `crmdata`. The database user is `postgres`. Below is the initial database schema:

#### **1. Müşteriler Tablosu (Customers Table)**
```sql
CREATE TABLE Musteriler (
    MusteriID SERIAL PRIMARY KEY,
    MusteriTipi VARCHAR(50) NOT NULL,
    Ad VARCHAR(100) NOT NULL,
    Soyad VARCHAR(100),
    VergiNo VARCHAR(20),
    Telefon VARCHAR(20),
    Email VARCHAR(100),
    Adres TEXT,
    KayitTarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **2. İlgiliKişiler Tablosu (Related Persons Table)**
```sql
CREATE TABLE IlgiliKisiler (
    IlgiliKisiID SERIAL PRIMARY KEY,
    MusteriID INT NOT NULL REFERENCES Musteriler(MusteriID),
    Ad VARCHAR(100) NOT NULL,
    Soyad VARCHAR(100),
    Unvan VARCHAR(100),
    Telefon VARCHAR(20),
    Email VARCHAR(100)
);
```

#### **3. Teklifler Tablosu (Offers Table)**
```sql
CREATE TABLE Teklifler (
    TeklifID SERIAL PRIMARY KEY,
    MusteriID INT NOT NULL REFERENCES Musteriler(MusteriID),
    TeklifNumarasi VARCHAR(50) UNIQUE NOT NULL,
    Baslik VARCHAR(200) NOT NULL,
    Aciklama TEXT,
    DurumID INT NOT NULL REFERENCES Durumlar(DurumID),
    OlusturmaTarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    SonGecerlilikTarihi DATE,
    ToplamTutar DECIMAL(18,2)
);
```

#### **4. TeklifKalemleri Tablosu (Offer Items Table)**
```sql
CREATE TABLE TeklifKalemleri (
    KalemID SERIAL PRIMARY KEY,
    TeklifID INT NOT NULL REFERENCES Teklifler(TeklifID),
    UrunAdi VARCHAR(200) NOT NULL,
    Miktar INT DEFAULT 1,
    BirimFiyat DECIMAL(18,2) NOT NULL,
    ToplamFiyat DECIMAL(18,2) GENERATED ALWAYS AS (Miktar * BirimFiyat) STORED,
    Aciklama TEXT
);
```

#### **5. Durumlar Tablosu (Statuses Table)**
```sql
CREATE TABLE Durumlar (
    DurumID SERIAL PRIMARY KEY,
    DurumAdi VARCHAR(100) NOT NULL,
    DurumTuru VARCHAR(50) NOT NULL
);
```

#### **6. Etkinlikler Tablosu (Activities Table)**
```sql
CREATE TABLE Etkinlikler (
    EtkinlikID SERIAL PRIMARY KEY,
    MusteriID INT NOT NULL REFERENCES Musteriler(MusteriID),
    EtkinlikTipi VARCHAR(100) NOT NULL,
    BaslangicTarihi TIMESTAMP NOT NULL,
    BitisTarihi TIMESTAMP,
    Aciklama TEXT,
    KullaniciID INT NOT NULL REFERENCES Kullanicilar(KullaniciID)
);
```

#### **7. Kullanıcılar Tablosu (Users Table)**
```sql
CREATE TABLE Kullanicilar (
    KullaniciID SERIAL PRIMARY KEY,
    Ad VARCHAR(100) NOT NULL,
    Soyad VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    SifreHash VARCHAR(255) NOT NULL,
    RolID INT NOT NULL REFERENCES Roller(RolID)
);
```

#### **8. Roller Tablosu (Roles Table)**
```sql
CREATE TABLE Roller (
    RolID SERIAL PRIMARY KEY,
    RolAdi VARCHAR(100) UNIQUE NOT NULL,
    Yetkiler TEXT
);
```

#### **9. Fırsatlar Tablosu (Opportunities Table)**
```sql
CREATE TABLE Firsatlar (
    FirsatID SERIAL PRIMARY KEY,
    MusteriID INT NOT NULL REFERENCES Musteriler(MusteriID),
    Baslik VARCHAR(200) NOT NULL,
    BeklenenKapanisTarihi DATE,
    AsamaID INT NOT NULL REFERENCES Asamalar(AsamaID),
    Olasilik DECIMAL(5,2) CHECK (Olasilik >= 0 AND Olasilik <= 100)
);
```

#### **10. Aşamalar Tablosu (Stages Table)**
```sql
CREATE TABLE Asamalar (
    AsamaID SERIAL PRIMARY KEY,
    AsamaAdi VARCHAR(100) NOT NULL,
    Sira INT NOT NULL
);
```

#### **11. TeklifDosyaları Tablosu (Offer Files Table)**
```sql
CREATE TABLE TeklifDosyalari (
    DosyaID SERIAL PRIMARY KEY,
    TeklifID INT NOT NULL REFERENCES Teklifler(TeklifID),
    DosyaAdi VARCHAR(255) NOT NULL,
    DosyaYolu VARCHAR(255) NOT NULL,
    YuklemeTarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **12. İşlemGeçmişi Tablosu (Transaction History Table)**
```sql
CREATE TABLE IslemGecmisi (
    LogID SERIAL PRIMARY KEY,
    TabloAdi VARCHAR(100) NOT NULL,
    KayitID INT NOT NULL,
    DegisiklikDetayi TEXT NOT NULL,
    Tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KullaniciID INT NOT NULL REFERENCES Kullanicilar(KullaniciID)
);
```

### **Development Plan**
1. **Backend Development**:
   - Set up the PostgreSQL database and Prisma ORM.
   - Create API routes for each module (Müşteriler, İlgiliKişiler, Teklifler, etc.).
   - Implement validation using Zod.
   - Add error handling and logging.

2. **Frontend Development**:
   - Create Next.js pages for each module.
   - Use shadcn/ui and Tailwind CSS for UI components.
   - Implement Zustand for state management.
   - Add form validation and error handling.

3. **Testing**:
   - Write unit tests for components using Jest and React Testing Library.
   - Write E2E tests for critical workflows using Cypress.

4. **Documentation**:
   - Add JSDoc comments for functions and components.
   - Generate API documentation using Swagger/OpenAPI.

5. **Deployment**:
   - Define deployment strategy (e.g., Vercel, AWS).

### **Next Task**
- **Backend Setup**: Set up the PostgreSQL database and Prisma ORM. Create the initial schema and seed the database with sample data.

"""
````

---

### **A

---

_**User**_

bu promptu prompt.txt dosyasına kaydet

---

_**Assistant**_

Tamam, yukarıdaki **prompt**'u `prompt.txt` dosyasına kaydedeceğim. İşte dosyanın içeriği:

````plaintext
"""
Language > Specialist: TypeScript > Full-Stack Developer (Next.js, PostgreSQL, Tailwind CSS)
Includes: Next.js, TypeScript, PostgreSQL, Tailwind CSS, shadcn/ui, Zod, Prisma, Zustand, Jest, Cypress
Requirements: Follow cursor_rules.json and cursorrules.mdc for coding style, structure, and best practices.
Plan: Develop a CRM task and offer tracking web application step-by-step, starting with the backend. Ensure the application is modular and extensible for future modules.
"""

### **Project Overview**
We are building a **CRM Task and Offer Tracking Web Application** with the following modules:
1. **İlişki/Müşteri (Customer Relationship)**
2. **Aktivite/Görev (Activity/Task)**
3. **Teklif (Offer)**
4. **Ürün/Hizmet Listesi (Product/Service List)**
5. **Sipariş (Order)**

The application should be **modular** and **extensible** to allow for the addition of new modules in the future.

### **Technology Stack**
#### **Frontend**
- **Framework**: Next.js (React)
- **Language**: TypeScript
- **UI Components**: shadcn/ui (based on Radix UI primitives)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

#### **Backend**
- **Framework**: Next.js API Routes
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **State Management**: Zustand
- **Validation**: Zod

#### **Deployment**
- **To be determined**: Deployment strategy will be defined later.

### **Database Structure**
We will use a PostgreSQL database named `crmdata`. The database user is `postgres`. Below is the initial database schema:

#### **1. Müşteriler Tablosu (Customers Table)**
```sql
CREATE TABLE Musteriler (
    MusteriID SERIAL PRIMARY KEY,
    MusteriTipi VARCHAR(50) NOT NULL,
    Ad VARCHAR(100) NOT NULL,
    Soyad VARCHAR(100),
    VergiNo VARCHAR(20),
    Telefon VARCHAR(20),
    Email VARCHAR(100),
    Adres TEXT,
    KayitTarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **2. İlgiliKişiler Tablosu (Related Persons Table)**
```sql
CREATE TABLE IlgiliKisiler (
    IlgiliKisiID SERIAL PRIMARY KEY,
    MusteriID INT NOT NULL REFERENCES Musteriler(MusteriID),
    Ad VARCHAR(100) NOT NULL,
    Soyad VARCHAR(100),
    Unvan VARCHAR(100),
    Telefon VARCHAR(20),
    Email VARCHAR(100)
);
```

#### **3. Teklifler Tablosu (Offers Table)**
```sql
CREATE TABLE Teklifler (
    TeklifID SERIAL PRIMARY KEY,
    MusteriID INT NOT NULL REFERENCES Musteriler(MusteriID),
    TeklifNumarasi VARCHAR(50) UNIQUE NOT NULL,
    Baslik VARCHAR(200) NOT NULL,
    Aciklama TEXT,
    DurumID INT NOT NULL REFERENCES Durumlar(DurumID),
    OlusturmaTarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    SonGecerlilikTarihi DATE,
    ToplamTutar DECIMAL(18,2)
);
```

#### **4. TeklifKalemleri Tablosu (Offer Items Table)**
```sql
CREATE TABLE TeklifKalemleri (
    KalemID SERIAL PRIMARY KEY,
    TeklifID INT NOT NULL REFERENCES Teklifler(TeklifID),
    UrunAdi VARCHAR(200) NOT NULL,
    Miktar INT DEFAULT 1,
    BirimFiyat DECIMAL(18,2) NOT NULL,
    ToplamFiyat DECIMAL(18,2) GENERATED ALWAYS AS (Miktar * BirimFiyat) STORED,
    Aciklama TEXT
);
```

#### **5. Durumlar Tablosu (Statuses Table)**
```sql
CREATE TABLE Durumlar (
    DurumID SERIAL PRIMARY KEY,
    DurumAdi VARCHAR(100) NOT NULL,
    DurumTuru VARCHAR(50) NOT NULL
);
```

#### **6. Etkinlikler Tablosu (Activities Table)**
```sql
CREATE TABLE Etkinlikler (
    EtkinlikID SERIAL PRIMARY KEY,
    MusteriID INT NOT NULL REFERENCES Musteriler(MusteriID),
    EtkinlikTipi VARCHAR(100) NOT NULL,
    BaslangicTarihi TIMESTAMP NOT NULL,
    BitisTarihi TIMESTAMP,
    Aciklama TEXT,
    KullaniciID INT NOT NULL REFERENCES Kullanicilar(KullaniciID)
);
```

#### **7. Kullanıcılar Tablosu (Users Table)**
```sql
CREATE TABLE Kullanicilar (
    KullaniciID SERIAL PRIMARY KEY,
    Ad VARCHAR(100) NOT NULL,
    Soyad VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    SifreHash VARCHAR(255) NOT NULL,
    RolID INT NOT NULL REFERENCES Roller(RolID)
);
```

#### **8. Roller Tablosu (Roles Table)**
```sql
CREATE TABLE Roller (
    RolID SERIAL PRIMARY KEY,
    RolAdi VARCHAR(100) UNIQUE NOT NULL,
    Yetkiler TEXT
);
```

#### **9. Fırsatlar Tablosu (Opportunities Table)**
```sql
CREATE TABLE Firsatlar (
    FirsatID SERIAL PRIMARY KEY,
    MusteriID INT NOT NULL REFERENCES Musteriler(MusteriID),
    Baslik VARCHAR(200) NOT NULL,
    BeklenenKapanisTarihi DATE,
    AsamaID INT NOT NULL REFERENCES Asamalar(AsamaID),
    Olasilik DECIMAL(5,2) CHECK (Olasilik >= 0 AND Olasilik <= 100)
);
```

#### **10. Aşamalar Tablosu (Stages Table)**
```sql
CREATE TABLE Asamalar (
    AsamaID SERIAL PRIMARY KEY,
    AsamaAdi VARCHAR(100) NOT NULL,
    Sira INT NOT NULL
);
```

#### **11. TeklifDosyaları Tablosu (Offer Files Table)**
```sql
CREATE TABLE TeklifDosyalari (
    DosyaID SERIAL PRIMARY KEY,
    TeklifID INT NOT NULL REFERENCES Teklifler(TeklifID),
    DosyaAdi VARCHAR(255) NOT NULL,
    DosyaYolu VARCHAR(255) NOT NULL,
    YuklemeTarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **12. İşlemGeçmişi Tablosu (Transaction History Table)**
```sql
CREATE TABLE IslemGecmisi (
    LogID SERIAL PRIMARY KEY,
    TabloAdi VARCHAR(100) NOT NULL,
    KayitID INT NOT NULL,
    DegisiklikDetayi TEXT NOT NULL,
    Tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KullaniciID INT NOT NULL REFERENCES Kullanicilar(KullaniciID)
);
```

### **Development Plan**
1. **Backend Development**:
   - Set up the PostgreSQL database and Prisma ORM.
   - Create API routes for each module (Müşteriler, İlgiliKişiler, Teklifler, etc.).
   - Implement validation using Zod.
   - Add error handling and logging.

2. **Frontend Development**:
   - Create Next.js pages for each module.
   - Use shadcn/ui and Tailwind CSS for UI components.
   - Implement Zustand for state management.
   - Add form validation and error handling.

3. **Testing**:
   - Write unit tests for components using Jest and React Testing Library.
   - Write E2E tests for critical workflows using Cypress.

4. **Documentation**:
   - Add JSDoc comments for functions and components.
   - Generate API documentation using Swagger/OpenAPI.

5. **Deployment**:
   - Define deployment strategy (e.g., Vercel, AWS).

### **Next Task**
- **Backend Setup**: Set up the PostgreSQL database and Prisma ORM. Create the initial schema and seed the database with sample data.

"""
````

---

### **Dosyayı Kaydetme**
Bu içeriği `prompt.txt` dosyasına kaydetmek için aşağıdaki adımları izleyebilirsiniz:

1. **Metin Editörü** (Notepad, VS Code, Sublime Text vb.) açın.
2. Yukarıdaki içeriği kopyalayıp editöre yapıştırın.
3. Dosyayı `prompt.txt` olarak kaydedin.

---

### **PowerShell ile Dosya Oluşturma**
Eğer PowerShell kullanarak dosyayı oluşturmak isterseniz, aşağıdaki komutu kullanabilirsiniz:

````powershell
Set-Content -Path .\prompt.txt -Value @"
"""
Language > Specialist: TypeScript >

---

_**User**_

şimdi bir github scripti yazmanı istiyorum. 
Ben verisyon güncelle dediğimde version numarası 1 arttırıp 
@https://github.com/gctuzak/crmyeni  deposunu son verion uygulama ile güncellemeli. bunu cursora prompt olarak yaz

---

_**Assistant**_



---



---

