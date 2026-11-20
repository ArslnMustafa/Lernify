// Deutsch fuer Mustafa: Tueyolar -- allgemeine Tipps, die sich ueber alle Themen lohnen.
// [titel, text, beispiel]

const TIPPS = [
  ["Artikel: -ung, -heit, -keit, -ion → die", "Bu eklerle biten kelimeler HER ZAMAN dişildir (die). Bir kuralla yüzlerce kelimenin artikelini öğrenmiş olursun.", "die Wohnung, die Freiheit, die Möglichkeit, die Information"],
  ["Artikel: -chen, -lein, -ment, -um → das", "Küçültme ekleri (-chen, -lein) ve -ment, -um ile bitenler nötrdür.", "das Mädchen, das Dokument, das Zentrum"],
  ["Artikel: Meslek ve kişi → der (kadını -in, die)", "Erkek meslek adları der, kadın hali -in eki alır ve die olur.", "der Lehrer – die Lehrerin, der Kollege – die Kollegin"],
  ["Artikel: Günler, aylar, mevsimler → der", "Haftanın günleri, aylar ve mevsimler erildir.", "der Montag, der Mai, der Winter"],
  ["Artikel: -e ile bitenlerin çoğu → die", "Kesin kural değil ama -e ile biten kelimelerin büyük kısmı dişildir. Tahmin etmen gerekiyorsa die de.", "die Miete, die Kasse, die Schule (istisna: der Kunde, der Name)"],
  ["Kelimeyi her zaman artikeliyle öğren", "'Tisch' değil 'der Tisch' diye öğren. Kartlarında artikel hep kelimenin bir parçası olsun; renk de kullanabilirsin: der mavi, die kırmızı, das yeşil.", "der Tisch, die Lampe, das Fenster"],
  ["Fiil hep 2. sırada (ana cümle)", "Cümle ne ile başlarsa başlasın, çekimli fiil ikinci sıradadır. Zaman veya yer başa gelince özne fiilden sonraya geçer.", "Heute arbeite ich. / Morgen fahren wir nach Köln."],
  ["Zaman – sebep – şekil – yer (TeKaMoLo)", "Bir cümlede birden fazla bilgi varsa sıra: Temporal (ne zaman), Kausal (neden), Modal (nasıl), Lokal (nerede).", "Ich fahre morgen wegen der Arbeit mit dem Zug nach Berlin."],
  ["Sie mi du mu?", "Tanımadığın yetişkinlere, iş yerinde ve resmi yerlerde Sie. Arkadaş, aile ve çocuklara du. Karşı taraf du teklif ederse geçebilirsin.", "Können Sie mir helfen? / Kannst du mir helfen?"],
  ["Günde 15 dakika, her gün", "Haftada bir kez iki saat çalışmaktan çok daha etkili. Uygulamadaki günlük hedef ve seri tam bunun için var.", "Sabah kahvaltıda 10 kart, akşam bir konu."],
  ["Sesli tekrar et", "Her kelimeyi ve cümleyi 🔊 düğmesiyle dinle ve yüksek sesle tekrar et. Telaffuz ve hafıza birlikte gelişir.", "Kelimeyi duy → tekrar et → bir cümlede kullan."],
  ["Kendi cümleni kur", "Yeni bir kelimeyi öğrenince onunla kendi hayatından bir cümle kur. Örnek cümleyi ezberlemekten 3 kat daha kalıcıdır.", "die Schicht → 'Nächste Woche habe ich Frühschicht.'"],
  ["Sınavda: zamanını böl", "DTZ ve B1'de her bölüme bir süre ayır ve takılınca geç. Boş bırakmak yerine tahmin et: yanlış cevap puan götürmez.", "Önce kolay soruları cevapla, sonra zor olanlara dön."],
  ["Mektupta 3 nokta kuralı", "Sınav mektubunda verilen 3–4 noktanın HER BİRİNE en az bir-iki cümle yaz. Bir noktayı atlamak çok puan kaybettirir.", "Grund – Frage – Bitte – Gruß"],
];

module.exports = { TIPPS: TIPPS.map(([titel, text, beispiel], i) => ({ i, titel, text, beispiel })) };
