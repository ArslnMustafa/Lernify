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

## Soru resimleri

Her sorunun bir resmi olmalı. Katalogdaki 150 yapının resmi veri dosyasında
duruyor; Rückblick kartları, teori soruları ve epoch soruları için resimler
Wikipedia'dan aranır ve `server/data/bilder.json` dosyasında tutulur. Bu dosya
git'e girmez, böylece sunucuda `git pull` ile çakışmaz.

```bash
cd server
node scripts/fetch-images.js            # eksik resimleri arar (internet gerekir)
node scripts/fetch-images.js ersetzen   # Wikimedia dışı zayıf kaynakları da yeniler
node scripts/apply-images.js            # mevcut veritabanındaki sorulara işler
node scripts/check-images.js            # hangi soru resimsiz kaldı
```

`fetch-images.js` her bulduğu resmin hangi Wikipedia maddesinden geldiğini
yazar; tam başlık eşleşmesi yerine aramadan gelen sonuçları sonunda ayrıca
listeler, yanlış eşleşmeler orada görülür. `apply-images.js` sınavları yeniden
kurmadan sadece resimleri güncellediği için sonuçlar silinmez.
