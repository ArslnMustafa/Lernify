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

| Kullanıcı adı | Şifre        | Sınav              |
| -------------- | ------------ | ------------------ |
| zeynep         | zeynep123    | Mimarlık Tarihi II |
| mustafa        | mustafa123   | Genel Kültür Sınavı |

Üretim ortamında `server/.env` dosyasında güçlü bir `JWT_SECRET` tanımlanmalı
(bkz. `server/.env.example`).
