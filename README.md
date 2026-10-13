# Lernify

Kullanıcı bazlı soru-cevap sınav uygulaması. Her kullanıcı giriş yapar ve
yalnızca kendisine atanmış sınavları görür/çözer.

## Yapı

- `server/` — Node.js + Express API. Kullanıcı girişi (JWT), kullanıcıya özel
  sınav listeleme, sınav çözme ve sonuç kaydetme. Veritabanı olarak Node'un
  yerleşik `node:sqlite` modülünü kullanır (ek native bağımlılık gerekmez).
- `client/` — React + Vite arayüzü. Giriş ekranı, sınav listesi, sınav çözme
  ve sonuç ekranı.
- `referans/` — Lernify'ı tasarlarken referans alınan örnek uygulama paketi.

## Geliştirme ortamını çalıştırma

```bash
# Backend
cd server
npm install
npm run seed   # örnek kullanıcıları ve sınavları oluşturur
npm run dev    # http://localhost:4000

# Frontend (başka bir terminalde)
cd client
npm install
npm run dev    # http://localhost:5173 (API isteklerini backend'e proxy'ler)
```

### Örnek kullanıcılar (seed sonrası)

| Kullanıcı adı | PIN  | Sınav               |
| -------------- | ---- | ------------------- |
| zeynep         | 5858 | Baugeschichte II    |
| mustafa        | 5858 | Genel Kültür Sınavı |

Bu PIN'ler herkese açık demo değerleridir; kurulumdan sonra değiştirin.

Üretim ortamında `server/.env` dosyasında güçlü bir `JWT_SECRET` tanımlanmalı
(bkz. `server/.env.example`).

## Bölümler

- **Training** — Führerschein usulü kutular (Leitner). Doğru cevaplanan kart kutusuna göre
  dinlenir (2. kutu 2 gün, 3. kutu 1 hafta) ve süresi dolunca geri gelir. Kutuların yanında
  iki ek yığın var: *Heute fällig* (süresi dolanlar) ve *Meine Fehler* (daha önce yanlış
  yapılanlar, en çok yanlış yapılan daha sık). Altta konu bazında doğruluk oranı.
- **Vergleich** — iki eseri karşılaştırma; her satır aynı zamanda "hangisi?" sorusu.
- **Karteikarten**, **Theorie** — eser kartları ve teori katalogu.
- **Simulation** — 20/30/40 karışık soruluk süreli deneme, sonunda değerlendirme ve geçmiş.
- **Karteikarten** ayrıca sözlük gibi çalışır: isim, yer, mimar veya stil ile arama.
- **Verwalten** — bauwerk düzeltme (resim adresi dahil), ilerleme sıfırlama, PIN değiştirme.


Probeklausur ve Schreiben bölümleri arayüzden kaldırıldı; sayfaları
(`client/src/pages/Dashboard.jsx`, `ExamTake.jsx`, `Schreiben.jsx`), verileri ve uç noktaları
(`/api/exams`, `/api/schreiben`) duruyor, geri eklemek birkaç satır.

Arayüz açık/koyu temayı destekler (üst bardaki düğme; seçim yapılmazsa telefonun ayarı
geçerli).

Günlük hatırlatma maili için sunucuda cron:

```
0 8 * * *  cd /home/mustafaarslan.com/Lernify/server && /usr/bin/node scripts/erinnerung.js >> /tmp/lernify-erinnerung.log 2>&1
```

Verwalten'deki düzeltmeler `server/data/aenderungen.json` dosyasına yazılır; bilder.json gibi
git'e girmez, `git pull` ile çakışmaz.

Uygulama telefona kurulabilir (PWA): ana ekrana eklenince tam ekran açılır, arayüz ve
görülen resimler önbellekte tutulur.

## Soru resimleri

Her sorunun bir resmi olmalı. Katalogdaki 150 yapının resmi veri dosyasında
duruyor; Rückblick kartları, teori soruları ve epoch soruları için resimler
Wikipedia'dan aranır ve `server/data/bilder.json` dosyasında tutulur. Bu dosya
git'e girmez, böylece sunucuda `git pull` ile çakışmaz.

```bash
cd server
node scripts/fetch-images.js            # eksik resimleri arar (internet gerekir)
node scripts/fetch-images.js pruefen    # arama çalışıyor mu, birkaç test sorgusu
node scripts/fetch-images.js ersetzen   # Wikimedia dışı zayıf kaynakları da yeniler
node scripts/apply-images.js            # mevcut veritabanındaki sorulara işler
node scripts/check-images.js            # hangi soru resimsiz kaldı
```

`fetch-images.js` her bulduğu resmin hangi Wikipedia maddesinden geldiğini
yazar; tam başlık eşleşmesi yerine aramadan gelen sonuçları sonunda ayrıca
listeler, yanlış eşleşmeler orada görülür. Resim bulunamazsa nedenini de yazar
(HTTP 403/429, zaman aşımı, "maddede resim yok"); üst üste 20 istek cevapsız
kalırsa çalışmayı durdurup `pruefen` komutunu önerir. Bulunanlar her seferinde
kaydedildiği için script'i tekrar çalıştırmak sadece eksikleri dener. `apply-images.js` sınavları yeniden
kurmadan sadece resimleri güncellediği için sonuçlar silinmez.
