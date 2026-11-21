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

## Telefondan değişiklik yapmak

Claude uygulamasının **Code** sekmesinden (ya da claude.ai/code) bu depoya bir oturum açıp ne
istediğini yazabilirsin; değişiklik GitHub'a gider. Sunucunun bunu kendiliğinden alması için
cron:

```
*/2 * * * * /home/mustafaarslan.com/Lernify/deploy/auto-update.sh >> /var/log/lernify-update.log 2>&1
```

Kurulduktan sonra kontrol:

```
crontab -l | tail -2                      # satır yerinde mi
tail -f /var/log/lernify-update.log       # güncellemeleri canlı izle
bash deploy/auto-update.sh                # elle bir tur çalıştır
```

`auto-update.sh` yeni commit yoksa hiçbir şey yazmaz. Yeni commit varsa çeker, gerekiyorsa
`npm install` yapar, PM2'yi yeniden başlatır ve `/api/health` ile kontrol eder. Site cevap
vermezse **eski commit'e geri döner** ve tekrar başlatır; log'a da yazar. Canlı dizinde elle
yapılmış değişiklik varsa hiç dokunmaz.

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

## Deutsch (A2 → B2)

Eigener Bereich unter `/deutsch`, sichtbar nur für die Benutzernamen in
`DEUTSCH_FUER` (Umgebungsvariable, durch Komma getrennt; Standard: `mustafa`).
Für diese Benutzer ist `/deutsch` auch die Startseite.

- Inhalte: `server/src/deutsch/wortschatz.js` (Wörter in den Bereichen Alltag,
  Beruf und Prüfung, mit Artikel, Plural bzw. Perfekt, Türkisch und Beispielsatz)
  und `server/src/deutsch/grammatik.js` (Themen mit türkischer Erklärung und Übungen).
- Häufige Wörter zuerst: `server/src/deutsch/haeufig.js` (die häufigsten Verben,
  kleinen Wörter, Bindewörter, Adjektive und Nomen, je Thema nach Häufigkeit
  sortiert). Neue Karten kommen zu zwei Dritteln von dort; Aufbauwortschatz B2
  (`server/src/deutsch/b2.js`) erst, wenn die häufigen durch sind. Jedes Wort hat
  ein Niveau (A1–B2); eine Bedeutung darf nur einmal vorkommen (wird beim Start geprüft).
- Fragearten: Bedeutung, Deutsch, Artikel und Lücke im Beispielsatz (Infinitiv,
  3. Person oder Partizip; Ablenker in derselben Form aus anderen Themen).
  „Kenne ich schon" schiebt ein neues Wort direkt in die letzte Box.
- Grammatik B1/B2 mit Lektion in `server/src/deutsch/grammatik-aufbau.js`; der
  Lernpfad ist nach Niveau sortiert.
- Prüfungssimulation: `server/src/deutsch/pruefungen.js` (Modelltests im Stil von
  DTZ / Goethe B1 und B2, eigene Texte; Teile `rf`, `mc`, `zuordnen`). Lesen mit
  Zeitlimit und ohne Zurück, Hörtexte liest der Browser vor (je Sprecher eine eigene
  Stimme/Tonhöhe, höchstens zweimal). Die Lösungen verlassen den Server erst bei der
  Abgabe; Ergebnisse in der Tabelle `deutsch_pruefung`. Bestanden je Modul ab 60 %.
  Der Zwischenstand liegt im Browser (localStorage), ein Neuladen kostet nichts.
- Telegram-Bot von mustafaarslan.com: dieselben Deutsch-Routen unter `/api/bot/deutsch`,
  Zugang per `X-Bot-Key` (Umgebungsvariable `BOT_KEY`, ohne sie ist der Weg aus) und
  `X-Bot-User` (Lernify-Benutzername). Siehe `server/src/middleware/bot.js`.
- Lernstand im selben Karteikasten wie der Trainer (`trainer_progress`),
  Schlüssel beginnen mit `de:`. Das Zurücksetzen des Trainers lässt sie stehen.
- Lektionen: `server/src/deutsch/lektionen.js` (zu jedem Grammatikthema
  Einstieg, Tabelle, typische Fehler, Tüyolar, Kalıplar und Özet). Die Seite
  führt in fünf Schritten durch: Konu → Hatalar & tüyolar → Kalıplar → Alıştırma → Özet.
- Kalıplar nach Situation: `server/src/deutsch/redemittel.js`; Tüyolar: `server/src/deutsch/tipps.js`.
- Punkte und Serie: Tabelle `deutsch_xp` (XP pro Tag, Tagesziel 50, Tag nach deutscher Zeit).
- Vorlesen über die Sprachausgabe des Browsers (`client/src/deutsch/ui.jsx`), kein Dienst nötig.
- API: `/api/deutsch/uebersicht`, `/karten/next`, `/karten/answer`, `/karten/kenne`, `/woerter`,
  `/lektion/:thema`, `/lektion/:thema/gelesen`, `/grammatik/answer`, `/kaliplar`,
  `/tipps`, `/wiederholung`, `/pruefungen`, `/pruefungen/:key`, `/pruefungen/:key/abgabe`.
- Schlüssel von Wörtern und Reihenfolge der Übungen nicht ändern, sonst geht
  der Lernstand dieser Karten verloren.
