// Deutsch fuer Mustafa: Kaliplar (Redemittel) nach Situation.
// Jede Situation: fertige Saetze [deutsch, tuerkisch], dazu ein Tipp auf Tuerkisch.
// bereich: alltag | beruf | pruefung (fuer Filter und Farben)

const SITUATIONEN = [
  {
    key: "arzt", bereich: "alltag", titel: "Beim Arzt", kurz: "Doktorda",
    tipp: "Telefonda randevu alırken önce adını ve sigortanı söyle, sonra derdini kısaca anlat.",
    saetze: [
      ["Ich möchte einen Termin vereinbaren.", "Randevu almak istiyorum."],
      ["Ich bin bei der AOK versichert.", "AOK'de sigortalıyım."],
      ["Ich habe seit drei Tagen Halsschmerzen.", "Üç gündür boğazım ağrıyor."],
      ["Mir ist schwindelig.", "Başım dönüyor."],
      ["Wie oft muss ich die Tabletten nehmen?", "Tabletleri ne sıklıkla almalıyım?"],
      ["Können Sie mich krankschreiben?", "Bana rapor verebilir misiniz?"],
      ["Brauche ich eine Überweisung?", "Sevk kâğıdına ihtiyacım var mı?"],
    ],
  },
  {
    key: "amt", bereich: "alltag", titel: "Auf dem Amt", kurz: "Resmi dairede",
    tipp: "Anlamadığında çekinmeden sor: 'Können Sie das bitte langsamer sagen?' Memurlar buna alışıktır.",
    saetze: [
      ["Ich möchte mich ummelden.", "Adres değişikliği yapmak istiyorum."],
      ["Welche Unterlagen brauche ich?", "Hangi belgelere ihtiyacım var?"],
      ["Wo bekomme ich das Formular?", "Formu nereden alabilirim?"],
      ["Bis wann muss ich den Antrag abgeben?", "Başvuruyu ne zamana kadar vermeliyim?"],
      ["Können Sie das bitte langsamer sagen?", "Bunu lütfen daha yavaş söyleyebilir misiniz?"],
      ["Ich habe einen Termin um zehn Uhr.", "Saat onda randevum var."],
      ["Könnten Sie mir eine Kopie geben?", "Bana bir kopya verebilir misiniz?"],
    ],
  },
  {
    key: "telefon", bereich: "alltag", titel: "Am Telefon", kurz: "Telefonda",
    tipp: "Almanlar telefonu soyadıyla açar. Sen de 'Arslan, guten Tag' diyerek başlayabilirsin.",
    saetze: [
      ["Guten Tag, hier spricht Mustafa Arslan.", "İyi günler, ben Mustafa Arslan."],
      ["Ich rufe wegen … an.", "… için arıyorum."],
      ["Könnte ich bitte mit Frau Schmidt sprechen?", "Bayan Schmidt ile görüşebilir miyim?"],
      ["Können Sie mich bitte zurückrufen?", "Beni geri arayabilir misiniz?"],
      ["Die Verbindung ist schlecht.", "Bağlantı kötü."],
      ["Ich buchstabiere: A wie Anton, R wie Richard …", "Harf harf söylüyorum: A Anton gibi, R Richard gibi …"],
      ["Vielen Dank, auf Wiederhören!", "Çok teşekkürler, hoşça kalın! (telefonda)"],
    ],
  },
  {
    key: "bewerbung", bereich: "beruf", titel: "Vorstellungsgespräch", kurz: "İş görüşmesi",
    tipp: "Kendini tanıtırken geçmişten bugüne sırayla anlat: eğitim, deneyim, neden bu iş.",
    saetze: [
      ["Ich habe Ihre Anzeige gelesen und interessiere mich für die Stelle.", "İlanınızı okudum ve pozisyonla ilgileniyorum."],
      ["Ich habe fünf Jahre Erfahrung als Lagerist.", "Depo görevlisi olarak beş yıl deneyimim var."],
      ["Meine Stärken sind Zuverlässigkeit und Teamarbeit.", "Güçlü yönlerim güvenilirlik ve takım çalışması."],
      ["Ich arbeite gern im Team.", "Ekip içinde çalışmayı severim."],
      ["Ab wann könnte ich anfangen?", "Ne zaman başlayabilirim?"],
      ["Wie sind die Arbeitszeiten?", "Çalışma saatleri nasıl?"],
      ["Gibt es Möglichkeiten zur Weiterbildung?", "Mesleki gelişim imkânları var mı?"],
    ],
  },
  {
    key: "arbeit", bereich: "beruf", titel: "Im Büro und im Team", kurz: "İş yerinde",
    tipp: "İş yerinde 'Sie' ile başla. Biri 'Wir können uns duzen' derse 'du'ya geçebilirsin.",
    saetze: [
      ["Können wir kurz sprechen?", "Kısaca konuşabilir miyiz?"],
      ["Ich bin heute leider krank und kann nicht kommen.", "Bugün maalesef hastayım, gelemiyorum."],
      ["Bis wann soll das fertig sein?", "Bu ne zamana kadar bitmeli?"],
      ["Ich kümmere mich darum.", "Ben ilgileniyorum."],
      ["Das habe ich schon erledigt.", "Onu zaten hallettim."],
      ["Ich habe das nicht ganz verstanden. Können Sie es noch einmal erklären?", "Tam anlamadım. Tekrar açıklayabilir misiniz?"],
      ["Ich würde gern nächste Woche Urlaub nehmen.", "Gelecek hafta izin almak istiyorum."],
    ],
  },
  {
    key: "email", bereich: "beruf", titel: "E-Mails schreiben", kurz: "E-posta yazmak",
    tipp: "Resmi e-posta: Anrede (giriş), sebep, rica, kapanış. Her zaman 'Mit freundlichen Grüßen' ile bitir.",
    saetze: [
      ["Sehr geehrte Frau Weber,", "Sayın Bayan Weber,"],
      ["vielen Dank für Ihre E-Mail.", "e-postanız için çok teşekkürler."],
      ["ich schreibe Ihnen, weil …", "size … sebebiyle yazıyorum."],
      ["Im Anhang finden Sie …", "Ekte … bulabilirsiniz."],
      ["Könnten Sie mir bitte bis Freitag Bescheid geben?", "Cuma'ya kadar bana haber verebilir misiniz?"],
      ["Bei Fragen stehe ich Ihnen gern zur Verfügung.", "Sorularınız için memnuniyetle hizmetinizdeyim."],
      ["Mit freundlichen Grüßen", "Saygılarımla"],
    ],
  },
  {
    key: "beschwerde", bereich: "pruefung", titel: "Sich beschweren", kurz: "Şikayet etmek",
    tipp: "Sınavda şikayet mektubu: Ne oldu? Ne zaman? Ne istiyorsun? Sakin ve kibar kal, ama talebini net yaz.",
    saetze: [
      ["Ich möchte mich über … beschweren.", "… hakkında şikayette bulunmak istiyorum."],
      ["Leider bin ich mit … nicht zufrieden.", "Maalesef …'den memnun değilim."],
      ["Am 3. Mai habe ich bei Ihnen … bestellt.", "3 Mayıs'ta sizden … sipariş ettim."],
      ["Die Ware war beschädigt.", "Ürün hasarlıydı."],
      ["Ich bitte Sie, mir das Geld zurückzuerstatten.", "Paramı iade etmenizi rica ediyorum."],
      ["Ich erwarte Ihre Antwort bis …", "… tarihine kadar cevabınızı bekliyorum."],
    ],
  },
  {
    key: "meinung", bereich: "pruefung", titel: "Meinung sagen", kurz: "Fikir bildirmek",
    tipp: "B1'de fikir yazısı: kendi görüşün + bir avantaj + bir dezavantaj + sonuç. Bağlaçlarla bağla: einerseits, andererseits, deshalb.",
    saetze: [
      ["Meiner Meinung nach …", "Bence …"],
      ["Ich finde es gut, dass …", "… olmasını iyi buluyorum."],
      ["Ich bin dafür / dagegen, weil …", "… olduğu için lehindeyim / aleyhindeyim."],
      ["Einerseits …, andererseits …", "Bir yandan …, öte yandan …"],
      ["Ein Vorteil ist, dass …", "Bir avantajı, … olması."],
      ["Da stimme ich zu.", "Buna katılıyorum."],
      ["Da bin ich anderer Meinung.", "Bu konuda farklı düşünüyorum."],
    ],
  },
  {
    key: "planen", bereich: "pruefung", titel: "Gemeinsam planen", kurz: "Birlikte plan yapmak (sınav konuşma)",
    tipp: "DTZ ve B1 konuşma sınavında bir şeyi birlikte planlarsınız. Öneri yap, partnerinin önerisine tepki ver, sonunda karar ver.",
    saetze: [
      ["Was hältst du davon, wenn wir …?", "… yapsak ne dersin?"],
      ["Wie wäre es mit Samstag?", "Cumartesiye ne dersin?"],
      ["Das ist eine gute Idee.", "Bu iyi bir fikir."],
      ["Das passt mir leider nicht. Ich habe da keine Zeit.", "Bu bana uymuyor. O zaman vaktim yok."],
      ["Wer kümmert sich um …?", "… ile kim ilgilenecek?"],
      ["Dann machen wir es so.", "O zaman böyle yapalım."],
      ["Gut, dann treffen wir uns um drei vor dem Kino.", "Tamam, o zaman saat üçte sinemanın önünde buluşalım."],
    ],
  },
];

const byKey = new Map(SITUATIONEN.map((s) => [s.key, s]));
module.exports = { SITUATIONEN, byKey };
