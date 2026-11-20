// Deutsch fuer Mustafa (Stand A2, Ziel B1): Wortschatz in drei Bereichen.
//   alltag   - Leben in Deutschland: Wohnung, Einkaufen, Arzt, Aemter, Verkehr, Freizeit
//   beruf    - Arbeit: Bewerbung, Arbeitsplatz, Vertrag, Kunden, Termine
//   pruefung - was in DTZ und Goethe B1 immer wieder vorkommt: Briefe, Meinung, Redemittel
//
// Spalten: [key, bereich, thema, artikel, wort, form, tuerkisch, beispiel]
//   artikel  "der" | "die" | "die (Pl.)" fuer reine Pluralwoerter | "" fuer alles ausser Nomen
//   form     Nomen: Pluralendung oder ganze Pluralform ("–" = kein Plural)
//            Verben: 3. Person und Perfekt, damit beides mitgelernt wird
//
// Beim Aendern: Schluessel nie umbenennen, sonst geht der Lernstand der Karte verloren.

const ROWS = [
  // ---------- Alltag: Wohnung ----------
  ["wohnung", "alltag", "Wohnung", "die", "Wohnung", "die Wohnungen", "ev, daire", "Wir suchen eine Wohnung mit drei Zimmern."],
  ["miete", "alltag", "Wohnung", "die", "Miete", "die Mieten", "kira", "Die Miete muss bis zum dritten des Monats bezahlt werden."],
  ["vermieter", "alltag", "Wohnung", "der", "Vermieter", "die Vermieter", "ev sahibi (kiraya veren)", "Ich habe den Vermieter wegen der Heizung angerufen."],
  ["nebenkosten", "alltag", "Wohnung", "die (Pl.)", "Nebenkosten", "–", "yan giderler (ısınma, su vb.)", "Die Nebenkosten sind dieses Jahr gestiegen."],
  ["kaution", "alltag", "Wohnung", "die", "Kaution", "die Kautionen", "depozito", "Die Kaution beträgt drei Monatsmieten."],
  ["mietvertrag", "alltag", "Wohnung", "der", "Mietvertrag", "die Mietverträge", "kira sözleşmesi", "Bitte lesen Sie den Mietvertrag genau."],
  ["heizung", "alltag", "Wohnung", "die", "Heizung", "die Heizungen", "kalorifer, ısıtma", "Die Heizung funktioniert seit gestern nicht."],
  ["muell", "alltag", "Wohnung", "der", "Müll", "–", "çöp", "Den Müll bringen wir am Abend raus."],
  ["nachbar", "alltag", "Wohnung", "der", "Nachbar", "die Nachbarn", "komşu", "Unser Nachbar hilft uns beim Umzug."],
  ["umziehen", "alltag", "Wohnung", "", "umziehen", "zieht um – ist umgezogen", "taşınmak", "Im Mai ziehen wir nach Bochum um."],

  // ---------- Alltag: Einkaufen ----------
  ["angebot", "alltag", "Einkaufen", "das", "Angebot", "die Angebote", "indirim, kampanya; teklif", "Die Äpfel sind diese Woche im Angebot."],
  ["quittung", "alltag", "Einkaufen", "die", "Quittung", "die Quittungen", "fiş, makbuz", "Ohne Quittung können Sie die Ware nicht umtauschen."],
  ["kasse", "alltag", "Einkaufen", "die", "Kasse", "die Kassen", "kasa", "Bitte zahlen Sie an der Kasse."],
  ["umtauschen", "alltag", "Einkaufen", "", "umtauschen", "tauscht um – hat umgetauscht", "(ürünü) değiştirmek", "Kann ich die Jacke umtauschen? Sie ist zu klein."],
  ["guenstig", "alltag", "Einkaufen", "", "günstig", "günstiger – am günstigsten", "uygun fiyatlı, ucuz", "Im Discounter ist das Gemüse günstiger."],
  ["lebensmittel", "alltag", "Einkaufen", "die (Pl.)", "Lebensmittel", "–", "gıda, yiyecek", "Lebensmittel kaufe ich meistens am Samstag."],
  ["tuete", "alltag", "Einkaufen", "die", "Tüte", "die Tüten", "poşet", "Brauchen Sie eine Tüte?"],

  // ---------- Alltag: Arzt ----------
  ["termin", "alltag", "Arzt", "der", "Termin", "die Termine", "randevu", "Ich möchte einen Termin beim Zahnarzt machen."],
  ["praxis", "alltag", "Arzt", "die", "Praxis", "die Praxen", "muayenehane", "Die Praxis ist mittwochs nachmittags geschlossen."],
  ["rezept", "alltag", "Arzt", "das", "Rezept", "die Rezepte", "reçete", "Für dieses Medikament brauchen Sie ein Rezept."],
  ["krankenkasse", "alltag", "Arzt", "die", "Krankenkasse", "die Krankenkassen", "sağlık sigortası (kurumu)", "Die Krankenkasse bezahlt die Behandlung."],
  ["versichertenkarte", "alltag", "Arzt", "die", "Versichertenkarte", "die Versichertenkarten", "sağlık sigortası kartı", "Bitte bringen Sie Ihre Versichertenkarte mit."],
  ["krankschreiben", "alltag", "Arzt", "", "krankschreiben", "schreibt krank – hat krankgeschrieben", "rapor vermek (hasta yazmak)", "Der Arzt hat mich für drei Tage krankgeschrieben."],
  ["apotheke", "alltag", "Arzt", "die", "Apotheke", "die Apotheken", "eczane", "Die nächste Apotheke ist am Bahnhof."],
  ["schmerz", "alltag", "Arzt", "der", "Schmerz", "die Schmerzen", "ağrı", "Ich habe seit zwei Tagen starke Schmerzen im Rücken."],
  ["fieber", "alltag", "Arzt", "das", "Fieber", "–", "ateş", "Mein Sohn hat hohes Fieber."],

  // ---------- Alltag: Aemter ----------
  ["amt", "alltag", "Ämter", "das", "Amt", "die Ämter", "resmi daire", "Für den Antrag müssen Sie zum Amt gehen."],
  ["antrag", "alltag", "Ämter", "der", "Antrag", "die Anträge", "başvuru (dilekçe)", "Ich habe einen Antrag auf Kindergeld gestellt."],
  ["formular", "alltag", "Ämter", "das", "Formular", "die Formulare", "form", "Das Formular finden Sie auch im Internet."],
  ["ausfuellen", "alltag", "Ämter", "", "ausfüllen", "füllt aus – hat ausgefüllt", "(form) doldurmak", "Bitte füllen Sie das Formular vollständig aus."],
  ["unterschrift", "alltag", "Ämter", "die", "Unterschrift", "die Unterschriften", "imza", "Hier fehlt noch Ihre Unterschrift."],
  ["ausweis", "alltag", "Ämter", "der", "Ausweis", "die Ausweise", "kimlik", "Zeigen Sie bitte Ihren Ausweis."],
  ["anmelden", "alltag", "Ämter", "", "sich anmelden", "meldet sich an – hat sich angemeldet", "(adres/kurs) kaydı yaptırmak", "Nach dem Umzug muss man sich beim Bürgeramt anmelden."],
  ["frist", "alltag", "Ämter", "die", "Frist", "die Fristen", "süre, son tarih", "Die Frist endet am 30. Juni."],
  ["bescheinigung", "alltag", "Ämter", "die", "Bescheinigung", "die Bescheinigungen", "belge, onay yazısı", "Ich brauche eine Bescheinigung von meinem Arbeitgeber."],

  // ---------- Alltag: Verkehr ----------
  ["haltestelle", "alltag", "Verkehr", "die", "Haltestelle", "die Haltestellen", "durak", "An der nächsten Haltestelle müssen wir aussteigen."],
  ["fahrkarte", "alltag", "Verkehr", "die", "Fahrkarte", "die Fahrkarten", "bilet", "Die Fahrkarte kann man auch in der App kaufen."],
  ["umsteigen", "alltag", "Verkehr", "", "umsteigen", "steigt um – ist umgestiegen", "aktarma yapmak", "In Essen müssen Sie in die S-Bahn umsteigen."],
  ["verspaetung", "alltag", "Verkehr", "die", "Verspätung", "die Verspätungen", "gecikme, rötar", "Der Zug hat zwanzig Minuten Verspätung."],
  ["fuehrerschein", "alltag", "Verkehr", "der", "Führerschein", "die Führerscheine", "ehliyet", "Meinen Führerschein habe ich in der Türkei gemacht."],

  // ---------- Alltag: Freizeit und Familie ----------
  ["verein", "alltag", "Freizeit", "der", "Verein", "die Vereine", "dernek, kulüp", "Mein Sohn spielt in einem Fußballverein."],
  ["kindergarten", "alltag", "Freizeit", "der", "Kindergarten", "die Kindergärten", "anaokulu", "Die Kinder gehen bis drei Uhr in den Kindergarten."],
  ["einladung", "alltag", "Freizeit", "die", "Einladung", "die Einladungen", "davet", "Vielen Dank für die Einladung zu deinem Geburtstag!"],
  ["verabreden", "alltag", "Freizeit", "", "sich verabreden", "verabredet sich – hat sich verabredet", "buluşmak için sözleşmek", "Wir haben uns für Samstag im Café verabredet."],
  ["ausflug", "alltag", "Freizeit", "der", "Ausflug", "die Ausflüge", "gezi, günübirlik gezi", "Am Sonntag machen wir einen Ausflug an den See."],

  // ---------- Beruf: Bewerbung ----------
  ["stelle", "beruf", "Bewerbung", "die", "Stelle", "die Stellen", "iş pozisyonu, kadro", "Ich habe eine neue Stelle als Lagerist gefunden."],
  ["bewerbung", "beruf", "Bewerbung", "die", "Bewerbung", "die Bewerbungen", "iş başvurusu", "Ich schicke meine Bewerbung per E-Mail."],
  ["lebenslauf", "beruf", "Bewerbung", "der", "Lebenslauf", "die Lebensläufe", "özgeçmiş (CV)", "Im Lebenslauf stehen alle Stationen meiner Arbeit."],
  ["vorstellungsgespraech", "beruf", "Bewerbung", "das", "Vorstellungsgespräch", "die Vorstellungsgespräche", "iş görüşmesi (mülakat)", "Morgen habe ich ein Vorstellungsgespräch."],
  ["erfahrung", "beruf", "Bewerbung", "die", "Erfahrung", "die Erfahrungen", "deneyim, tecrübe", "Ich habe fünf Jahre Erfahrung im Verkauf."],
  ["ausbildung", "beruf", "Bewerbung", "die", "Ausbildung", "die Ausbildungen", "meslek eğitimi", "Sie macht eine Ausbildung als Krankenpflegerin."],
  ["weiterbildung", "beruf", "Bewerbung", "die", "Weiterbildung", "die Weiterbildungen", "mesleki gelişim kursu", "Die Firma bezahlt eine Weiterbildung für mich."],

  // ---------- Beruf: Arbeitsplatz ----------
  ["arbeitgeber", "beruf", "Arbeitsplatz", "der", "Arbeitgeber", "die Arbeitgeber", "işveren", "Mein Arbeitgeber ist sehr zufrieden mit mir."],
  ["arbeitnehmer", "beruf", "Arbeitsplatz", "der", "Arbeitnehmer", "die Arbeitnehmer", "çalışan, işçi", "Jeder Arbeitnehmer hat Anspruch auf Urlaub."],
  ["kollege", "beruf", "Arbeitsplatz", "der", "Kollege", "die Kollegen", "iş arkadaşı (erkek)", "Mein Kollege übernimmt heute meine Schicht."],
  ["kollegin", "beruf", "Arbeitsplatz", "die", "Kollegin", "die Kolleginnen", "iş arkadaşı (kadın)", "Frag doch die Kollegin aus der Buchhaltung."],
  ["chef", "beruf", "Arbeitsplatz", "der", "Chef", "die Chefs", "şef, patron", "Der Chef ist heute nicht im Büro."],
  ["abteilung", "beruf", "Arbeitsplatz", "die", "Abteilung", "die Abteilungen", "bölüm, departman", "In welcher Abteilung arbeiten Sie?"],
  ["besprechung", "beruf", "Arbeitsplatz", "die", "Besprechung", "die Besprechungen", "toplantı", "Die Besprechung beginnt um neun Uhr."],
  ["schicht", "beruf", "Arbeitsplatz", "die", "Schicht", "die Schichten", "vardiya", "Nächste Woche arbeite ich in der Spätschicht."],
  ["ueberstunde", "beruf", "Arbeitsplatz", "die", "Überstunde", "die Überstunden", "fazla mesai (saati)", "Diesen Monat habe ich zehn Überstunden gemacht."],
  ["feierabend", "beruf", "Arbeitsplatz", "der", "Feierabend", "die Feierabende", "mesai bitimi", "Nach Feierabend gehe ich ins Fitnessstudio."],
  ["arbeitszeit", "beruf", "Arbeitsplatz", "die", "Arbeitszeit", "die Arbeitszeiten", "çalışma saati", "Meine Arbeitszeit ist von acht bis halb fünf."],
  ["puenktlich", "beruf", "Arbeitsplatz", "", "pünktlich", "–", "dakik, zamanında", "Bitte seien Sie morgen pünktlich."],

  // ---------- Beruf: Vertrag und Geld ----------
  ["vertrag", "beruf", "Vertrag", "der", "Vertrag", "die Verträge", "sözleşme", "Ich habe den Vertrag heute unterschrieben."],
  ["befristet", "beruf", "Vertrag", "", "befristet", "–", "süreli (belirli süreli)", "Der Vertrag ist auf ein Jahr befristet."],
  ["unbefristet", "beruf", "Vertrag", "", "unbefristet", "–", "süresiz (belirsiz süreli)", "Nach der Probezeit bekomme ich einen unbefristeten Vertrag."],
  ["probezeit", "beruf", "Vertrag", "die", "Probezeit", "die Probezeiten", "deneme süresi", "Die Probezeit dauert sechs Monate."],
  ["gehalt", "beruf", "Vertrag", "das", "Gehalt", "die Gehälter", "maaş", "Das Gehalt kommt immer am Monatsende."],
  ["lohn", "beruf", "Vertrag", "der", "Lohn", "die Löhne", "ücret (saatlik/haftalık)", "Der Lohn wird pro Stunde bezahlt."],
  ["gehaltsabrechnung", "beruf", "Vertrag", "die", "Gehaltsabrechnung", "die Gehaltsabrechnungen", "maaş bordrosu", "Auf der Gehaltsabrechnung stehen auch die Steuern."],
  ["urlaub", "beruf", "Vertrag", "der", "Urlaub", "die Urlaube", "yıllık izin, tatil", "Ich habe im August zwei Wochen Urlaub."],
  ["kuendigen", "beruf", "Vertrag", "", "kündigen", "kündigt – hat gekündigt", "istifa etmek; (sözleşmeyi) feshetmek", "Er hat seine Stelle zum Monatsende gekündigt."],
  ["kuendigung", "beruf", "Vertrag", "die", "Kündigung", "die Kündigungen", "fesih, işten çıkarma/istifa", "Die Kündigung muss schriftlich sein."],
  ["krankmelden", "beruf", "Vertrag", "", "sich krankmelden", "meldet sich krank – hat sich krankgemeldet", "hasta olduğunu bildirmek", "Ich muss mich heute leider krankmelden."],
  ["krankmeldung", "beruf", "Vertrag", "die", "Krankmeldung", "die Krankmeldungen", "hastalık bildirimi, rapor", "Schicken Sie die Krankmeldung bitte an die Personalabteilung."],

  // ---------- Beruf: Kunden und Termine ----------
  ["kunde", "beruf", "Kunden", "der", "Kunde", "die Kunden", "müşteri (erkek)", "Der Kunde wartet schon seit zehn Minuten."],
  ["auftrag", "beruf", "Kunden", "der", "Auftrag", "die Aufträge", "sipariş, iş emri", "Wir haben einen großen Auftrag bekommen."],
  ["aufgabe", "beruf", "Kunden", "die", "Aufgabe", "die Aufgaben", "görev", "Zu meinen Aufgaben gehört auch die Kontrolle der Ware."],
  ["rechnung", "beruf", "Kunden", "die", "Rechnung", "die Rechnungen", "fatura", "Die Rechnung schicken wir Ihnen per Post."],
  ["lieferung", "beruf", "Kunden", "die", "Lieferung", "die Lieferungen", "teslimat", "Die Lieferung kommt erst am Donnerstag."],
  ["erledigen", "beruf", "Kunden", "", "erledigen", "erledigt – hat erledigt", "halletmek, bitirmek", "Ich erledige das sofort."],
  ["zustaendig", "beruf", "Kunden", "", "zuständig sein (für)", "ist zuständig – ist zuständig gewesen", "(-den) sorumlu olmak", "Wer ist für die Bestellungen zuständig?"],
  ["vereinbaren", "beruf", "Kunden", "", "vereinbaren", "vereinbart – hat vereinbart", "kararlaştırmak, (randevu) ayarlamak", "Können wir einen Termin vereinbaren?"],
  ["verschieben", "beruf", "Kunden", "", "verschieben", "verschiebt – hat verschoben", "ertelemek, kaydırmak", "Wir müssen die Besprechung auf Freitag verschieben."],
  ["absagen", "beruf", "Kunden", "", "absagen", "sagt ab – hat abgesagt", "iptal etmek (randevu vb.)", "Leider muss ich den Termin absagen."],
  ["bescheid", "beruf", "Kunden", "", "Bescheid geben", "gibt Bescheid – hat Bescheid gegeben", "haber vermek", "Geben Sie mir bitte Bescheid, wenn die Ware da ist."],

  // ---------- Pruefung: Briefe ----------
  ["beschwerde", "pruefung", "Briefe", "die", "Beschwerde", "die Beschwerden", "şikayet", "Ich schreibe Ihnen eine Beschwerde wegen der Lieferung."],
  ["beschweren", "pruefung", "Briefe", "", "sich beschweren (über)", "beschwert sich – hat sich beschwert", "(-den) şikayet etmek", "Ich möchte mich über den Lärm beschweren."],
  ["anfrage", "pruefung", "Briefe", "die", "Anfrage", "die Anfragen", "bilgi talebi, soru", "Vielen Dank für Ihre Anfrage."],
  ["erkundigen", "pruefung", "Briefe", "", "sich erkundigen (nach)", "erkundigt sich – hat sich erkundigt", "(hakkında) bilgi almak", "Ich möchte mich nach dem Deutschkurs erkundigen."],
  ["entschuldigen", "pruefung", "Briefe", "", "sich entschuldigen (für)", "entschuldigt sich – hat sich entschuldigt", "(için) özür dilemek", "Ich entschuldige mich für die späte Antwort."],
  ["anmeldung", "pruefung", "Briefe", "die", "Anmeldung", "die Anmeldungen", "kayıt, başvuru", "Die Anmeldung für den Kurs ist bis Freitag möglich."],
  ["gebuehr", "pruefung", "Briefe", "die", "Gebühr", "die Gebühren", "harç, ücret", "Die Gebühr für die Prüfung beträgt 120 Euro."],
  ["erstatten", "pruefung", "Briefe", "", "erstatten", "erstattet – hat erstattet", "(parayı) iade etmek", "Wir erstatten Ihnen den vollen Preis."],
  ["anrede", "pruefung", "Briefe", "", "Sehr geehrte Damen und Herren,", "–", "Sayın yetkili (resmi mektup girişi)", "Sehr geehrte Damen und Herren, ich interessiere mich für Ihr Angebot."],
  ["gruss", "pruefung", "Briefe", "", "Mit freundlichen Grüßen", "–", "Saygılarımla (resmi kapanış)", "Mit freundlichen Grüßen, Mustafa Arslan"],
  ["antwortfreuen", "pruefung", "Briefe", "", "Ich freue mich auf Ihre Antwort.", "–", "Cevabınızı bekliyorum.", "Ich freue mich auf Ihre Antwort und verbleibe mit freundlichen Grüßen."],
  ["koenntensie", "pruefung", "Briefe", "", "Könnten Sie mir bitte … ?", "–", "Bana … yapabilir misiniz? (kibar rica)", "Könnten Sie mir bitte weitere Informationen schicken?"],
  ["imvoraus", "pruefung", "Briefe", "", "im Voraus", "–", "önceden, şimdiden", "Vielen Dank im Voraus für Ihre Hilfe."],

  // ---------- Pruefung: Meinung ----------
  ["meinung", "pruefung", "Meinung", "die", "Meinung", "die Meinungen", "fikir, görüş", "Was ist Ihre Meinung zu diesem Thema?"],
  ["meinernach", "pruefung", "Meinung", "", "meiner Meinung nach", "–", "bence, bana göre", "Meiner Meinung nach ist das Angebot zu teuer."],
  ["einerseits", "pruefung", "Meinung", "", "einerseits … andererseits", "–", "bir yandan … öte yandan", "Einerseits ist die Stadt teuer, andererseits gibt es viele Jobs."],
  ["vorteil", "pruefung", "Meinung", "der", "Vorteil", "die Vorteile", "avantaj", "Ein Vorteil von Homeoffice ist die Zeit."],
  ["nachteil", "pruefung", "Meinung", "der", "Nachteil", "die Nachteile", "dezavantaj", "Der Nachteil ist, dass man wenig Kontakt hat."],
  ["zustimmen", "pruefung", "Meinung", "", "zustimmen", "stimmt zu – hat zugestimmt", "katılmak, onaylamak", "Da stimme ich Ihnen zu."],
  ["ablehnen", "pruefung", "Meinung", "", "ablehnen", "lehnt ab – hat abgelehnt", "reddetmek", "Die Firma hat meinen Vorschlag abgelehnt."],
  ["vorschlag", "pruefung", "Meinung", "der", "Vorschlag", "die Vorschläge", "öneri", "Ich habe einen Vorschlag: Wir treffen uns am Samstag."],
  ["vorschlagen", "pruefung", "Meinung", "", "vorschlagen", "schlägt vor – hat vorgeschlagen", "önermek", "Ich schlage vor, dass wir früher anfangen."],
  ["grund", "pruefung", "Meinung", "der", "Grund", "die Gründe", "sebep, neden", "Aus diesem Grund kann ich nicht kommen."],

  // ---------- Pruefung: Verbinden ----------
  ["deshalb", "pruefung", "Verbinden", "", "deshalb", "–", "bu yüzden", "Der Bus kam nicht, deshalb war ich zu spät."],
  ["trotzdem", "pruefung", "Verbinden", "", "trotzdem", "–", "yine de, buna rağmen", "Es regnet, trotzdem gehen wir spazieren."],
  ["ausserdem", "pruefung", "Verbinden", "", "außerdem", "–", "ayrıca, bunun yanında", "Die Wohnung ist hell. Außerdem hat sie einen Balkon."],
  ["leider", "pruefung", "Verbinden", "", "leider", "–", "maalesef", "Leider kann ich am Montag nicht kommen."],
  ["moeglichkeit", "pruefung", "Verbinden", "die", "Möglichkeit", "die Möglichkeiten", "imkan, olanak", "Gibt es die Möglichkeit, später zu zahlen?"],
  ["voraussetzung", "pruefung", "Verbinden", "die", "Voraussetzung", "die Voraussetzungen", "ön koşul, şart", "Eine Voraussetzung ist der Führerschein."],
  ["teilnehmen", "pruefung", "Verbinden", "", "teilnehmen (an)", "nimmt teil – hat teilgenommen", "(-e) katılmak", "Ich möchte an dem Kurs teilnehmen."],
  ["anzeige", "pruefung", "Verbinden", "die", "Anzeige", "die Anzeigen", "ilan", "Ich habe Ihre Anzeige in der Zeitung gelesen."],
  ["durchsage", "pruefung", "Verbinden", "die", "Durchsage", "die Durchsagen", "anons", "Achtung, eine Durchsage: Der Zug fällt heute aus."],
];

const BEREICHE = {
  alltag: { name: "Alltag", beschreibung: "Wohnung, Einkaufen, Arzt, Ämter, Verkehr und Freizeit" },
  beruf: { name: "Beruf", beschreibung: "Bewerbung, Arbeitsplatz, Vertrag, Kunden und Termine" },
  pruefung: { name: "Prüfung", beschreibung: "Briefe, Meinung und Redemittel für DTZ und Goethe B1" },
};

const woerter = ROWS.map(([key, bereich, thema, artikel, wort, form, tr, beispiel]) => ({
  key: "de:w:" + key, bereich, thema, artikel, wort, form, tr, beispiel,
  // Mit Artikel, so wie man das Wort lernen soll
  voll: artikel && artikel !== "die (Pl.)" ? artikel + " " + wort : wort,
  nomen: artikel === "der" || artikel === "die" || artikel === "das",
}));

const byKey = new Map(woerter.map((w) => [w.key, w]));
if (byKey.size !== woerter.length) throw new Error("Wortschatz: doppelter Schlüssel");

module.exports = { woerter, byKey, BEREICHE };
