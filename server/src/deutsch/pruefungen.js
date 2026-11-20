// Pruefungssimulation: Modelltests im Stil von DTZ / Goethe B1 und Goethe B2.
// Alle Texte sind eigens geschrieben (keine echten Pruefungsaufgaben).
// Lesen hat ein Zeitlimit; Hoertexte liest der Browser vor, jeder hoechstens zweimal.
// Schreiben und Sprechen kommen mit dem Schreibtraining dazu.
//
// Teil-Typen:
//   rf        Aussagen richtig/falsch          fragen: [{ id, text, loesung: true|false, erklaerung }]
//   mc        Mehrfachauswahl a/b/c            fragen: [{ id, text, optionen: [...], loesung: index, erklaerung, hoertext? }]
//   zuordnen  Situationen zu Texten (A, B …)   texte: [{ id, titel, text }], fragen: [{ id, text, loesung: textId | "0" }]
// Hoertexte: [[sprecher, satz], ...]; bei "mc" im Hoeren kann jede Frage ihren eigenen haben.
// Erklaerungen auf Tuerkisch: wo im Text steht die Loesung.
//
// Beim Aendern: Frage-IDs nicht umbenennen, sonst passen alte Ergebnisse nicht mehr.

const PRUEFUNGEN = [
  // ================================================================
  {
    key: "b1-1",
    niveau: "B1",
    titel: "Modelltest 1",
    thema: "Wohnen, Nachbarn, Freizeit",
    minuten: { lesen: 35 },
    teile: [
      {
        id: "l1", modul: "lesen", typ: "rf", titel: "Lesen Teil 1",
        aufgabe: "Lesen Sie die E-Mail. Sind die Aussagen richtig oder falsch?",
        tr: "E-postayı oku. İfadeler doğru mu (richtig), yanlış mı (falsch)?",
        text: {
          titel: "E-Mail von Selin",
          absaetze: [
            "Liebe Dilek,",
            "endlich habe ich Zeit, dir zu schreiben! Wie du weißt, sind wir Anfang März von Dortmund nach Herne gezogen. Der Umzug war anstrengend, aber zum Glück haben uns Kemals Kollegen geholfen. Ohne sie hätten wir den großen Schrank nie in den vierten Stock bekommen – einen Aufzug gibt es nämlich nicht.",
            "Die neue Wohnung ist kleiner als die alte, aber viel heller, und sie hat einen Balkon. Die Miete ist fast gleich, dafür sind die Nebenkosten niedriger, weil das Haus erst vor zwei Jahren renoviert wurde. Die Kinder haben jetzt jeder ein eigenes Zimmer und streiten viel weniger.",
            "Unsere Nachbarn sind sehr freundlich. Frau Becker von gegenüber hat uns am ersten Tag einen Kuchen gebracht. Nur der Mann unter uns beschwert sich manchmal, wenn die Kinder abends laut sind. Wir versuchen jetzt, ab acht Uhr leiser zu sein.",
            "Mein Weg zur Arbeit ist leider länger geworden: Ich fahre jetzt 40 Minuten mit der Straßenbahn statt 15 Minuten mit dem Fahrrad. Aber ich nutze die Zeit zum Lesen. Kemal hat Glück, seine Firma ist nur zehn Minuten entfernt.",
            "Hast du Lust, uns im Mai zu besuchen? Am 18. Mai feiern wir eine kleine Einweihungsparty. Sag mir einfach bis Ende April Bescheid.",
            "Liebe Grüße, Selin",
          ],
        },
        fragen: [
          { id: "1", text: "Selin und ihre Familie haben den Umzug ohne Hilfe gemacht.", loesung: false, erklaerung: "Metin: „zum Glück haben uns Kemals Kollegen geholfen“ → yardım aldılar." },
          { id: "2", text: "Im Haus gibt es keinen Aufzug.", loesung: true, erklaerung: "„einen Aufzug gibt es nämlich nicht“." },
          { id: "3", text: "Die neue Wohnung kostet insgesamt weniger als die alte.", loesung: true, erklaerung: "Kira hemen hemen aynı, ama yan giderler daha düşük → toplamda daha ucuz." },
          { id: "4", text: "Alle Nachbarn sind mit der Familie zufrieden.", loesung: false, erklaerung: "Alttaki adam çocuklar gürültü yapınca şikâyet ediyor → herkes memnun değil." },
          { id: "5", text: "Selin fährt jetzt mit dem Fahrrad zur Arbeit.", loesung: false, erklaerung: "Artık 40 dakika tramvayla gidiyor; bisiklet eskiden." },
          { id: "6", text: "Dilek soll bis Ende April antworten.", loesung: true, erklaerung: "„Sag mir einfach bis Ende April Bescheid.“" },
        ],
      },
      {
        id: "l2", modul: "lesen", typ: "mc", titel: "Lesen Teil 2",
        aufgabe: "Lesen Sie den Zeitungsartikel. Welche Lösung (a, b oder c) ist richtig?",
        tr: "Gazete yazısını oku. Hangi şık (a, b, c) doğru?",
        text: {
          titel: "Reparieren statt wegwerfen: Das Repair-Café in Herne",
          absaetze: [
            "Jeden ersten Samstag im Monat ist im Gemeindehaus an der Bahnhofstraße viel los. Von 11 bis 15 Uhr bringen Bürgerinnen und Bürger kaputte Toaster, Lampen, Fahrräder oder Kleidung mit. Ehrenamtliche Helfer schauen sich die Sachen an und reparieren sie – gemeinsam mit den Besitzern.",
            "„Wir wollen nicht einfach Dinge für die Leute reparieren“, sagt Organisator Jürgen Kranz, ein pensionierter Elektriker. „Die Besucher sollen dabei sein und lernen, wie es geht. Viele sind überrascht, wie einfach manche Reparaturen sind.“",
            "Die Reparatur selbst ist kostenlos. Nur Ersatzteile muss man bezahlen, wenn welche nötig sind. Außerdem freut sich das Team über eine kleine Spende für Werkzeug und Kaffee. Eine Anmeldung ist nicht nötig, aber wer früh kommt, muss weniger warten.",
            "Im letzten Jahr wurden rund 600 Geräte repariert, etwa zwei Drittel aller mitgebrachten Sachen. „Das ist gut für die Umwelt und für den Geldbeutel“, meint Kranz. Das Team sucht übrigens dringend Verstärkung, vor allem Menschen, die nähen können.",
          ],
        },
        fragen: [
          { id: "7", text: "Im Repair-Café …", optionen: ["reparieren Fachleute die Geräte allein.", "reparieren Helfer und Besitzer zusammen.", "lernen Helfer, wie man Geräte repariert."], loesung: 1, erklaerung: "„reparieren sie – gemeinsam mit den Besitzern“ ve „Die Besucher sollen dabei sein“." },
          { id: "8", text: "Was muss man bezahlen?", optionen: ["Nichts, auch keine Ersatzteile.", "Einen festen Preis pro Reparatur.", "Nur Ersatzteile, wenn man sie braucht."], loesung: 2, erklaerung: "„Nur Ersatzteile muss man bezahlen, wenn welche nötig sind.“ Bağış isteğe bağlı." },
          { id: "9", text: "Wer ins Repair-Café kommen möchte, …", optionen: ["muss sich vorher anmelden.", "sollte früh kommen, um nicht lange zu warten.", "kann nur einmal im Jahr kommen."], loesung: 1, erklaerung: "„Eine Anmeldung ist nicht nötig, aber wer früh kommt, muss weniger warten.“" },
          { id: "10", text: "Das Team sucht vor allem Leute, …", optionen: ["die gut nähen können.", "die Elektriker sind.", "die Kaffee kochen."], loesung: 0, erklaerung: "„vor allem Menschen, die nähen können“." },
        ],
      },
      {
        id: "l3", modul: "lesen", typ: "zuordnen", titel: "Lesen Teil 3",
        aufgabe: "Lesen Sie die Situationen und die Anzeigen. Welche Anzeige passt? Für eine Situation gibt es keine passende Anzeige: Wählen Sie dann 0.",
        tr: "Durumları ve ilanları oku. Her duruma uyan ilanı seç. Bir durum için uygun ilan yok: o zaman 0 seç.",
        texte: [
          { id: "a", titel: "Deutschkurs am Abend", text: "Volkshochschule Herne: Deutsch B1 für Berufstätige, Di und Do 18:30–20:45 Uhr, Beginn 4. März. Kursgebühr 120 € (Ermäßigung möglich)." },
          { id: "b", titel: "Kinderflohmarkt", text: "Kleidung, Spielzeug und Kinderwagen günstig kaufen und verkaufen! Samstag 10–14 Uhr, Turnhalle der Grundschule am Park. Standgebühr 5 €." },
          { id: "c", titel: "Schwimmkurs für Erwachsene", text: "Nie schwimmen gelernt? Kein Problem! Kleine Gruppen, nur Frauen, Sonntag 9 Uhr, Hallenbad Mitte. 10 Termine 60 €." },
          { id: "d", titel: "Umzugshilfe", text: "Zwei starke Studenten helfen beim Umzug. Mit Transporter, auch am Wochenende. 25 € pro Stunde und Person. Tel. 0176 4455 210" },
          { id: "e", titel: "Fahrradwerkstatt", text: "Ihr Rad ist kaputt? Wir reparieren schnell und günstig. Mo–Fr 9–18 Uhr. Gebrauchte Fahrräder ab 80 €." },
          { id: "f", titel: "Nachhilfe Mathematik", text: "Lehrerin gibt Nachhilfe für Schüler der Klassen 5–10. Bei Ihnen zu Hause, nachmittags. 20 € pro Stunde." },
          { id: "g", titel: "Kochabend international", text: "Gemeinsam kochen und essen: Jeden Monat stellt ein Teilnehmer ein Gericht aus seiner Heimat vor. Freitag 19 Uhr, Familienzentrum. Kostenlos, Anmeldung erwünscht." },
        ],
        fragen: [
          { id: "11", text: "Ihre Tochter hat Probleme in Mathe und braucht Hilfe.", loesung: "f", erklaerung: "f: 5–10. sınıflar için matematik özel dersi." },
          { id: "12", text: "Sie möchten neue Leute kennenlernen und kochen gern.", loesung: "g", erklaerung: "g: birlikte yemek pişirme akşamı, ücretsiz." },
          { id: "13", text: "Sie arbeiten tagsüber und möchten Ihr Deutsch verbessern.", loesung: "a", erklaerung: "a: çalışanlar için akşam kursu." },
          { id: "14", text: "Ihr Sohn ist aus seiner Jacke herausgewachsen. Sie suchen eine günstige neue.", loesung: "b", erklaerung: "b: çocuk bit pazarı, ucuz kıyafet." },
          { id: "15", text: "Ihr Mann möchte am Wochenende schwimmen lernen.", loesung: "0", erklaerung: "c sadece kadınlar için → eşin için uygun ilan yok: 0." },
        ],
      },
      {
        id: "h1", modul: "hoeren", typ: "mc", titel: "Hören Teil 1",
        aufgabe: "Sie hören vier kurze Texte. Zu jedem Text gibt es eine Aufgabe. Sie hören jeden Text höchstens zweimal.",
        tr: "Dört kısa metin dinleyeceksin. Her metin için bir soru var. Her metni en fazla iki kez dinleyebilirsin.",
        fragen: [
          {
            id: "16", hoertext: [["Ansage", "Praxis Dr. Yilmaz, guten Tag. Unsere Praxis ist vom 12. bis 23. August wegen Urlaub geschlossen. In dringenden Fällen wenden Sie sich bitte an die Praxis Dr. Schulte in der Hauptstraße 14. Ab dem 26. August sind wir wieder wie gewohnt für Sie da."]],
            text: "Was sollen Patienten in dringenden Fällen tun?", optionen: ["Am 26. August wiederkommen.", "Zu einer anderen Praxis gehen.", "Eine Nachricht hinterlassen."], loesung: 1,
            erklaerung: "„In dringenden Fällen wenden Sie sich bitte an die Praxis Dr. Schulte“ → başka bir muayenehane.",
          },
          {
            id: "17", hoertext: [["Durchsage", "Achtung, eine Durchsage zu Gleis 5: Der Regionalexpress nach Düsseldorf, planmäßige Abfahrt 14 Uhr 32, fährt heute ausnahmsweise von Gleis 8. Wir bitten um Ihr Verständnis."]],
            text: "Der Zug nach Düsseldorf …", optionen: ["fällt heute aus.", "hat 32 Minuten Verspätung.", "fährt von einem anderen Gleis."], loesung: 2,
            erklaerung: "„fährt heute ausnahmsweise von Gleis 8“ (normalde 5. peron)."
          },
          {
            id: "18", hoertext: [["Mailbox", "Hallo Herr Demir, hier ist Frau Krüger von der Hausverwaltung. Der Techniker kann leider erst am Donnerstag zu Ihnen kommen, nicht am Mittwoch wie geplant. Er kommt zwischen acht und zwölf Uhr. Wenn Sie da nicht zu Hause sind, rufen Sie mich bitte zurück."]],
            text: "Wann kommt der Techniker?", optionen: ["Am Mittwoch vormittags.", "Am Donnerstag vormittags.", "Am Donnerstag nachmittags."], loesung: 1,
            erklaerung: "„erst am Donnerstag … zwischen acht und zwölf Uhr“ → perşembe öğleden önce."
          },
          {
            id: "19", hoertext: [["Durchsage", "Liebe Kundinnen und Kunden, nur heute: Alle Obst- und Gemüsesorten sind um zwanzig Prozent reduziert. Und an unserer Käsetheke bekommen Sie beim Kauf von zwei Stück Käse ein drittes gratis dazu."]],
            text: "Was gibt es heute im Supermarkt?", optionen: ["Billigeres Obst und Gemüse.", "Gratis Gemüse an der Käsetheke.", "Zwanzig Prozent auf alles."], loesung: 0,
            erklaerung: "Meyve ve sebze %20 indirimli; her şey değil, sadece meyve-sebze."
          },
        ],
      },
      {
        id: "h2", modul: "hoeren", typ: "rf", titel: "Hören Teil 2",
        aufgabe: "Sie hören ein Gespräch. Sind die Aussagen richtig oder falsch? Sie hören das Gespräch zweimal.",
        tr: "Bir konuşma dinleyeceksin. İfadeler doğru mu yanlış mı? Konuşmayı iki kez dinleyebilirsin.",
        hoertext: [
          ["Frau", "Hallo, ich bin wegen der Wohnung hier. Wir haben telefoniert, mein Name ist Aksoy."],
          ["Mann", "Ah ja, Frau Aksoy, kommen Sie rein. Die Wohnung hat drei Zimmer, Küche und Bad, insgesamt 78 Quadratmeter."],
          ["Frau", "Die Küche ist ja schön groß! Ist die Küche in der Miete dabei?"],
          ["Mann", "Ja, die Einbauküche gehört zur Wohnung, auch der Herd und der Kühlschrank. Eine Waschmaschine müssten Sie selbst mitbringen, die kommt dann ins Bad."],
          ["Frau", "Und wie hoch ist die Miete?"],
          ["Mann", "Die Kaltmiete beträgt 690 Euro, dazu kommen 180 Euro Nebenkosten. Die Kaution sind zwei Kaltmieten."],
          ["Frau", "Darf man hier Haustiere halten? Wir haben eine Katze."],
          ["Mann", "Eine Katze ist kein Problem. Nur Hunde möchte der Vermieter nicht."],
          ["Frau", "Gut. Und ab wann ist die Wohnung frei?"],
          ["Mann", "Ab dem ersten Juni. Wenn Sie Interesse haben, schicken Sie mir bitte bis Freitag eine Kopie Ihrer letzten drei Gehaltsabrechnungen."],
        ],
        fragen: [
          { id: "20", text: "Die Küche gehört zur Wohnung.", loesung: true, erklaerung: "„die Einbauküche gehört zur Wohnung“." },
          { id: "21", text: "In der Wohnung gibt es schon eine Waschmaschine.", loesung: false, erklaerung: "„Eine Waschmaschine müssten Sie selbst mitbringen“." },
          { id: "22", text: "Die Miete mit Nebenkosten beträgt 870 Euro.", loesung: true, erklaerung: "690 + 180 = 870 €." },
          { id: "23", text: "Haustiere sind in der Wohnung nicht erlaubt.", loesung: false, erklaerung: "Kedi sorun değil; sadece köpek istenmiyor." },
          { id: "24", text: "Frau Aksoy soll Unterlagen über ihr Einkommen schicken.", loesung: true, erklaerung: "„eine Kopie Ihrer letzten drei Gehaltsabrechnungen“ = maaş bordroları." },
        ],
      },
      {
        id: "h3", modul: "hoeren", typ: "mc", titel: "Hören Teil 3",
        aufgabe: "Sie hören ein Interview im Radio. Welche Lösung (a, b oder c) ist richtig? Sie hören das Interview zweimal.",
        tr: "Radyoda bir röportaj dinleyeceksin. Hangi şık doğru? Röportajı iki kez dinleyebilirsin.",
        hoertext: [
          ["Moderator", "Heute ist Frau Hoffmann bei uns, sie leitet seit zehn Jahren einen Gemeinschaftsgarten in Bochum. Frau Hoffmann, wie ist die Idee entstanden?"],
          ["Frau Hoffmann", "Ganz einfach: Viele Menschen in unserem Viertel wohnen in Wohnungen ohne Garten. Und neben der Schule lag eine Fläche, die niemand genutzt hat. Wir haben die Stadt gefragt, und sie hat uns das Grundstück kostenlos zur Verfügung gestellt."],
          ["Moderator", "Wer macht denn bei Ihnen mit?"],
          ["Frau Hoffmann", "Ganz unterschiedliche Leute: Rentner, junge Familien, Studenten. Inzwischen sind es fast sechzig Personen aus vierzehn Ländern. Viele bringen Samen aus ihrer Heimat mit. So wachsen bei uns heute auch Pflanzen, die man in Deutschland sonst kaum kennt."],
          ["Moderator", "Was ist für Sie das Schönste an dem Projekt?"],
          ["Frau Hoffmann", "Das Gemüse ist natürlich toll. Aber am wichtigsten ist mir, dass Nachbarn sich kennenlernen. Früher haben sich die Leute im Treppenhaus kaum gegrüßt, heute helfen sie sich gegenseitig."],
          ["Moderator", "Kann man einfach vorbeikommen?"],
          ["Frau Hoffmann", "Ja, jeden Samstag ab zehn Uhr. Man braucht keine Erfahrung und keine eigenen Werkzeuge. Nur feste Schuhe sollte man mitbringen."],
        ],
        fragen: [
          { id: "25", text: "Das Grundstück für den Garten …", optionen: ["hat die Schule gekauft.", "hat die Stadt kostenlos gegeben.", "gehört Frau Hoffmann."], loesung: 1, erklaerung: "„die Stadt … hat uns das Grundstück kostenlos zur Verfügung gestellt“." },
          { id: "26", text: "Im Garten …", optionen: ["arbeiten nur Rentner.", "wachsen auch Pflanzen aus anderen Ländern.", "gibt es Kurse für Studenten."], loesung: 1, erklaerung: "„Viele bringen Samen aus ihrer Heimat mit“ → başka ülkelerden bitkiler." },
          { id: "27", text: "Was ist Frau Hoffmann am wichtigsten?", optionen: ["Das frische Gemüse.", "Dass die Nachbarn Kontakt haben.", "Dass der Garten groß ist."], loesung: 1, erklaerung: "„am wichtigsten ist mir, dass Nachbarn sich kennenlernen“." },
          { id: "28", text: "Wer mitmachen möchte, …", optionen: ["braucht feste Schuhe.", "muss eigenes Werkzeug haben.", "sollte Erfahrung haben."], loesung: 0, erklaerung: "„Nur feste Schuhe sollte man mitbringen.“ Deneyim ve alet gerekmiyor." },
        ],
      },
    ],
  },

  // ================================================================
  {
    key: "b1-2",
    niveau: "B1",
    titel: "Modelltest 2",
    thema: "Arbeit, Beruf, Weiterbildung",
    minuten: { lesen: 35 },
    teile: [
      {
        id: "l1", modul: "lesen", typ: "rf", titel: "Lesen Teil 1",
        aufgabe: "Lesen Sie den Blogbeitrag. Sind die Aussagen richtig oder falsch?",
        tr: "Blog yazısını oku. İfadeler doğru mu yanlış mı?",
        text: {
          titel: "Murats Blog: Meine erste Woche im neuen Job",
          absaetze: [
            "Seit Montag arbeite ich als Lagerist bei einem großen Online-Händler in Bochum. Vorher war ich zwei Jahre Busfahrer, aber die Schichten am Wochenende waren für meine Familie schwierig. Jetzt arbeite ich nur von Montag bis Freitag – allerdings im Wechsel: eine Woche Frühschicht, eine Woche Spätschicht.",
            "Am ersten Tag war ich ziemlich nervös. Aber mein Teamleiter, Herr Wolff, hat mir alles in Ruhe gezeigt. Eine Kollegin, Jana, ist meine „Patin“: Sie beantwortet in den ersten vier Wochen alle meine Fragen. Das finde ich eine tolle Idee.",
            "Die Arbeit ist körperlich anstrengend, man läuft jeden Tag viele Kilometer. Abends tun mir die Füße weh. Die Firma hat mir deshalb gute Arbeitsschuhe bezahlt. Mittags essen wir in der Kantine, das Essen ist günstig und meistens lecker.",
            "Was mir noch schwerfällt, ist der Scanner: Damit muss ich jedes Paket registrieren, und er hat viele Funktionen. Nächste Woche bekomme ich eine Schulung dazu. Mein Ziel: In einem Jahr möchte ich den Gabelstaplerschein machen, dann verdiene ich mehr.",
          ],
        },
        fragen: [
          { id: "1", text: "Murat war früher Busfahrer.", loesung: true, erklaerung: "„Vorher war ich zwei Jahre Busfahrer“." },
          { id: "2", text: "Murat muss jetzt auch am Wochenende arbeiten.", loesung: false, erklaerung: "„Jetzt arbeite ich nur von Montag bis Freitag“." },
          { id: "3", text: "Jana hilft Murat in der ersten Zeit.", loesung: true, erklaerung: "Jana „Patin“: ilk dört hafta sorularını cevaplıyor." },
          { id: "4", text: "Murat hat seine Arbeitsschuhe selbst bezahlt.", loesung: false, erklaerung: "„Die Firma hat mir … gute Arbeitsschuhe bezahlt“." },
          { id: "5", text: "Murat hat schon eine Schulung für den Scanner gemacht.", loesung: false, erklaerung: "Eğitim gelecek hafta: „Nächste Woche bekomme ich eine Schulung“." },
          { id: "6", text: "Mit dem Gabelstaplerschein kann Murat mehr Geld verdienen.", loesung: true, erklaerung: "„dann verdiene ich mehr“." },
        ],
      },
      {
        id: "l2", modul: "lesen", typ: "mc", titel: "Lesen Teil 2",
        aufgabe: "Lesen Sie den Zeitungsartikel. Welche Lösung (a, b oder c) ist richtig?",
        tr: "Gazete yazısını oku. Hangi şık doğru?",
        text: {
          titel: "Vier Tage arbeiten, drei Tage frei?",
          absaetze: [
            "Ein Handwerksbetrieb aus Gelsenkirchen hat es ausprobiert: Seit einem Jahr arbeiten die 25 Mitarbeiter nur noch von Montag bis Donnerstag. Die Arbeitszeit pro Tag ist dafür von acht auf neun Stunden gestiegen, insgesamt arbeiten sie also 36 statt 40 Stunden pro Woche – bei gleichem Lohn.",
            "Chef Thomas Brandt war zuerst skeptisch. „Ich hatte Angst, dass wir Aufträge verlieren“, erzählt er. Doch das Gegenteil ist passiert: Die Mitarbeiter sind seltener krank, und es gibt weniger Fehler. Außerdem hat sich die Firma bei jungen Bewerbern einen Namen gemacht. „Früher hatten wir auf eine Stelle zwei Bewerbungen, heute sind es fünfzehn.“",
            "Ganz ohne Probleme läuft es aber nicht. Kunden, die am Freitag anrufen, erreichen nur einen Anrufbeantworter. Für Notfälle gibt es deshalb einen Bereitschaftsdienst, den die Mitarbeiter abwechselnd übernehmen.",
            "Experten sehen das Modell positiv, warnen aber: Nicht jede Branche kann es einfach übernehmen. In Krankenhäusern oder im Einzelhandel müsse man andere Lösungen finden.",
          ],
        },
        fragen: [
          { id: "7", text: "Die Mitarbeiter des Betriebs …", optionen: ["verdienen jetzt weniger.", "arbeiten pro Tag länger als früher.", "arbeiten weiterhin 40 Stunden."], loesung: 1, erklaerung: "Günde sekiz yerine dokuz saat; maaş aynı, haftada 36 saat." },
          { id: "8", text: "Was hat sich seit der Einführung verbessert?", optionen: ["Die Firma bekommt mehr Bewerbungen.", "Die Firma hat mehr Kunden am Freitag.", "Die Mitarbeiter machen mehr Überstunden."], loesung: 0, erklaerung: "„heute sind es fünfzehn“ başvuru (eskiden iki)." },
          { id: "9", text: "Wer am Freitag ein dringendes Problem hat, …", optionen: ["muss bis Montag warten.", "kann sich an einen Bereitschaftsdienst wenden.", "erreicht den Chef persönlich."], loesung: 1, erklaerung: "„Für Notfälle gibt es deshalb einen Bereitschaftsdienst“." },
          { id: "10", text: "Die Experten meinen, dass …", optionen: ["alle Firmen das Modell übernehmen sollten.", "das Modell nicht funktioniert.", "das Modell nicht für jede Branche passt."], loesung: 2, erklaerung: "„Nicht jede Branche kann es einfach übernehmen.“" },
        ],
      },
      {
        id: "l3", modul: "lesen", typ: "zuordnen", titel: "Lesen Teil 3",
        aufgabe: "Lesen Sie die Situationen und die Anzeigen. Welche Anzeige passt? Für eine Situation gibt es keine passende Anzeige: Wählen Sie dann 0.",
        tr: "Durumları ve ilanları oku. Uyan ilanı seç; bir durum için ilan yok → 0.",
        texte: [
          { id: "a", titel: "Bewerbungstraining", text: "Lebenslauf, Anschreiben, Vorstellungsgespräch: In zwei Samstagen fit für die Bewerbung. Agentur für Arbeit, kostenlos für Arbeitsuchende." },
          { id: "b", titel: "Staplerschein", text: "Gabelstapler-Führerschein in 3 Tagen. Theorie und Praxis, Prüfung inklusive. Mo–Mi 8–16 Uhr. 290 €. Förderung durch das Jobcenter möglich." },
          { id: "c", titel: "Computerkurs für Einsteiger", text: "E-Mails schreiben, Dateien speichern, im Internet suchen. 8 Abende, montags 18 Uhr, VHS. 65 €." },
          { id: "d", titel: "Aushilfe gesucht", text: "Bäckerei sucht Verkäufer/in für Samstag und Sonntag, 6–13 Uhr. Erfahrung nicht nötig. Bewerbung bitte persönlich im Laden." },
          { id: "e", titel: "Berufssprachkurs B2", text: "Deutsch für den Beruf: Telefonieren, Besprechungen, Berichte schreiben. Vollzeit, 5 Monate, ab Februar. Kostenlos mit Berechtigung." },
          { id: "f", titel: "Anerkennungsberatung", text: "Sie haben einen Berufsabschluss aus dem Ausland? Wir beraten Sie zur Anerkennung in Deutschland. Termine nach Vereinbarung, kostenlos." },
          { id: "g", titel: "Nachtschicht", text: "Logistikzentrum sucht Mitarbeiter für die Nachtschicht, 22–6 Uhr, Mo–Fr. Nachtzuschlag 25 %. Staplerschein erforderlich." },
        ],
        fragen: [
          { id: "11", text: "Sie waren in der Türkei Elektriker und möchten wissen, ob Ihr Abschluss hier gilt.", loesung: "f", erklaerung: "f: yurt dışı diplomanın tanınması danışmanlığı." },
          { id: "12", text: "Sie suchen einen Job am Wochenende, haben aber keine Erfahrung.", loesung: "d", erklaerung: "d: cumartesi-pazar, deneyim gerekmiyor." },
          { id: "13", text: "Sie möchten lernen, wie man am Computer E-Mails schreibt.", loesung: "c", erklaerung: "c: yeni başlayanlar için bilgisayar kursu." },
          { id: "14", text: "Sie möchten nachts arbeiten, haben aber noch keinen Staplerschein.", loesung: "b", erklaerung: "g forklift belgesi istiyor; önce b ile belgeyi almalısın → b." },
          { id: "15", text: "Sie möchten einen Abendkurs für Deutsch im Beruf machen.", loesung: "0", erklaerung: "e tam gün (Vollzeit), akşam değil → uygun ilan yok: 0." },
        ],
      },
      {
        id: "h1", modul: "hoeren", typ: "mc", titel: "Hören Teil 1",
        aufgabe: "Sie hören vier kurze Texte. Zu jedem Text gibt es eine Aufgabe. Sie hören jeden Text höchstens zweimal.",
        tr: "Dört kısa metin. Her birine bir soru. Her metni en fazla iki kez dinle.",
        fragen: [
          {
            id: "16", hoertext: [["Mailbox", "Hallo Herr Öztürk, hier ist Wolff. Kurze Info: Wegen der Inventur fängt die Frühschicht morgen schon um fünf Uhr an, nicht um sechs. Dafür können Sie um halb eins nach Hause gehen. Bis morgen!"]],
            text: "Wann beginnt die Schicht morgen?", optionen: ["Um fünf Uhr.", "Um sechs Uhr.", "Um halb eins."], loesung: 0,
            erklaerung: "„fängt die Frühschicht morgen schon um fünf Uhr an“.",
          },
          {
            id: "17", hoertext: [["Durchsage", "Verehrte Kundinnen und Kunden, unser Haus schließt in fünfzehn Minuten. Bitte begeben Sie sich zu den Kassen im Erdgeschoss. Die Kassen im ersten Stock sind bereits geschlossen."]],
            text: "Wo kann man noch bezahlen?", optionen: ["Im ersten Stock.", "Im Erdgeschoss.", "Nirgends mehr."], loesung: 1,
            erklaerung: "„zu den Kassen im Erdgeschoss“; birinci kattakiler kapalı.",
          },
          {
            id: "18", hoertext: [["Mailbox", "Guten Tag, Autohaus Berger, Sie hatten Ihr Auto zur Inspektion gebracht. Wir haben gesehen, dass die Bremsen erneuert werden müssen. Das kostet etwa 350 Euro. Bitte rufen Sie uns an, ob wir das machen sollen. Sonst ist Ihr Auto heute ab 16 Uhr fertig."]],
            text: "Was soll der Kunde tun?", optionen: ["Das Auto um 16 Uhr abholen.", "Sagen, ob die Werkstatt die Bremsen reparieren soll.", "350 Euro überweisen."], loesung: 1,
            erklaerung: "„Bitte rufen Sie uns an, ob wir das machen sollen.“",
          },
          {
            id: "19", hoertext: [["Radio", "Und nun der Verkehr: Auf der A 43 zwischen Bochum und Herne staut es sich nach einem Unfall auf acht Kilometern. Fahren Sie besser über die A 40. Die A 42 ist frei."]],
            text: "Wo gibt es einen Stau?", optionen: ["Auf der A 40.", "Auf der A 42.", "Auf der A 43."], loesung: 2,
            erklaerung: "„Auf der A 43 … staut es sich“; A 40 öneriliyor, A 42 açık.",
          },
        ],
      },
      {
        id: "h2", modul: "hoeren", typ: "rf", titel: "Hören Teil 2",
        aufgabe: "Sie hören ein Gespräch. Sind die Aussagen richtig oder falsch? Sie hören das Gespräch zweimal.",
        tr: "Bir konuşma dinle. İfadeler doğru mu yanlış mı?",
        hoertext: [
          ["Mann", "Sag mal, Sabine, hast du schon den neuen Schichtplan für Dezember gesehen?"],
          ["Frau", "Ja, gerade eben. Ich habe Weihnachten frei, aber Silvester muss ich arbeiten. Und du?"],
          ["Mann", "Bei mir ist es genau umgekehrt. Ich arbeite am 24. und 25., habe aber Silvester frei. Das ist blöd, meine Eltern kommen Weihnachten aus der Türkei."],
          ["Frau", "Hm. Sollen wir tauschen? Ich feiere Weihnachten sowieso nicht groß, und Silvester würde ich gern mit Freunden feiern."],
          ["Mann", "Echt? Das wäre super! Müssen wir das mit Herrn Wolff besprechen?"],
          ["Frau", "Ja, aber er ist meistens einverstanden, wenn beide zustimmen. Wir müssen nur das Formular ausfüllen und bis zum 1. Dezember abgeben."],
          ["Mann", "Okay, ich hole es nachher aus dem Büro. Danke, Sabine, ich lade dich dafür auf einen Kaffee ein."],
        ],
        fragen: [
          { id: "20", text: "Sabine muss an Silvester arbeiten.", loesung: true, erklaerung: "„Silvester muss ich arbeiten“ (değişimden önce)." },
          { id: "21", text: "Der Mann hat an Weihnachten frei.", loesung: false, erklaerung: "„Ich arbeite am 24. und 25.“" },
          { id: "22", text: "Die Eltern des Mannes kommen zu Besuch.", loesung: true, erklaerung: "„meine Eltern kommen Weihnachten aus der Türkei“." },
          { id: "23", text: "Für den Tausch braucht man nicht die Zustimmung des Chefs.", loesung: false, erklaerung: "Herr Wolff ile konuşmaları gerekiyor; genelde onay veriyor." },
          { id: "24", text: "Das Formular muss bis zum 1. Dezember abgegeben werden.", loesung: true, erklaerung: "„bis zum 1. Dezember abgeben“." },
        ],
      },
      {
        id: "h3", modul: "hoeren", typ: "mc", titel: "Hören Teil 3",
        aufgabe: "Sie hören ein Interview im Radio. Welche Lösung (a, b oder c) ist richtig? Sie hören das Interview zweimal.",
        tr: "Radyoda bir röportaj. Hangi şık doğru?",
        hoertext: [
          ["Moderatorin", "Herr Nowak, Sie sind Berater bei der Agentur für Arbeit. Warum ist Weiterbildung heute so wichtig?"],
          ["Herr Nowak", "Weil sich die Arbeitswelt sehr schnell verändert. Viele Tätigkeiten, die früher Menschen gemacht haben, machen heute Maschinen oder Computer. Wer sich weiterbildet, bleibt für Arbeitgeber interessant."],
          ["Moderatorin", "Viele Menschen sagen aber: Eine Weiterbildung ist zu teuer."],
          ["Herr Nowak", "Das stimmt oft nicht. Es gibt viele Förderprogramme. Für Beschäftigte in kleinen Firmen zahlt der Staat zum Beispiel einen großen Teil der Kosten. Man muss sich nur informieren, und dafür sind wir da. Die Beratung bei uns ist kostenlos."],
          ["Moderatorin", "Und was ist mit der Zeit? Wer Vollzeit arbeitet und Kinder hat …"],
          ["Herr Nowak", "Das ist tatsächlich das größte Problem. Deshalb empfehle ich Online-Kurse, die man abends oder am Wochenende machen kann. Manche Arbeitgeber geben ihren Mitarbeitern auch Bildungsurlaub, in Nordrhein-Westfalen sind das bis zu fünf Tage im Jahr."],
          ["Moderatorin", "Ihr wichtigster Tipp?"],
          ["Herr Nowak", "Nicht warten, bis man arbeitslos ist. Die beste Zeit für eine Weiterbildung ist, wenn man noch einen Job hat."],
        ],
        fragen: [
          { id: "25", text: "Warum ist Weiterbildung laut Herrn Nowak wichtig?", optionen: ["Weil Maschinen teurer werden.", "Weil sich die Arbeit schnell verändert.", "Weil Arbeitgeber es verlangen."], loesung: 1, erklaerung: "„Weil sich die Arbeitswelt sehr schnell verändert.“" },
          { id: "26", text: "Was sagt Herr Nowak über die Kosten?", optionen: ["Der Staat hilft oft beim Bezahlen.", "Weiterbildung ist immer kostenlos.", "Nur große Firmen bekommen Geld."], loesung: 0, erklaerung: "Devlet küçük firmalarda çalışanlar için masrafların büyük kısmını ödüyor." },
          { id: "27", text: "Das größte Problem ist für viele …", optionen: ["die Sprache.", "die fehlende Zeit.", "der weite Weg."], loesung: 1, erklaerung: "Tam gün iş + çocuk: „Das ist tatsächlich das größte Problem.“ → zaman." },
          { id: "28", text: "Herr Nowak rät, eine Weiterbildung zu machen, …", optionen: ["wenn man arbeitslos ist.", "nach der Rente.", "solange man noch Arbeit hat."], loesung: 2, erklaerung: "„Die beste Zeit … ist, wenn man noch einen Job hat.“" },
        ],
      },
    ],
  },

  // ================================================================
  {
    key: "b2-1",
    niveau: "B2",
    titel: "Modelltest 3",
    thema: "Gesellschaft, Medien, Umwelt",
    minuten: { lesen: 45 },
    teile: [
      {
        id: "l1", modul: "lesen", typ: "rf", titel: "Lesen Teil 1",
        aufgabe: "Lesen Sie den Kommentar. Sind die Aussagen richtig oder falsch?",
        tr: "Köşe yazısını oku. İfadeler doğru mu yanlış mı? (B2: yazarın görüşüne dikkat!)",
        text: {
          titel: "Homeoffice: Freiheit mit Nebenwirkungen",
          absaetze: [
            "Seit der Pandemie gehört das Arbeiten von zu Hause für Millionen Beschäftigte zum Alltag. Die Vorteile liegen auf der Hand: Der Weg ins Büro fällt weg, man kann sich die Zeit freier einteilen, und Familie und Beruf lassen sich besser vereinbaren. Umfragen zeigen, dass die meisten Beschäftigten nicht mehr vollständig ins Büro zurückkehren wollen.",
            "Und doch wäre es naiv, das Homeoffice nur zu feiern. Wer allein am Küchentisch arbeitet, verliert leicht den Kontakt zu Kollegen. Gerade neue Mitarbeiter lernen viel weniger, wenn sie niemanden spontan fragen können. Hinzu kommt, dass die Grenze zwischen Arbeit und Freizeit verschwimmt: Viele lesen auch abends noch dienstliche E-Mails.",
            "Ich halte deshalb weder eine Rückkehr zur Präsenzpflicht noch das reine Homeoffice für sinnvoll. Mehr spricht für feste Bürotage, an denen das ganze Team vor Ort ist – nicht, um zu kontrollieren, sondern um sich auszutauschen. Den Rest der Woche können die Mitarbeiter dort arbeiten, wo sie am besten vorankommen.",
            "Entscheidend ist allerdings, dass Unternehmen klare Regeln aufstellen, etwa zur Erreichbarkeit. Ohne solche Regeln droht das Homeoffice vom Privileg zur Belastung zu werden.",
          ],
        },
        fragen: [
          { id: "1", text: "Die meisten Beschäftigten möchten wieder jeden Tag ins Büro gehen.", loesung: false, erklaerung: "„die meisten … nicht mehr vollständig ins Büro zurückkehren wollen“." },
          { id: "2", text: "Der Autor sieht im Homeoffice nur Vorteile.", loesung: false, erklaerung: "„wäre es naiv, das Homeoffice nur zu feiern“ → dezavantajları da görüyor." },
          { id: "3", text: "Neue Mitarbeiter haben es im Homeoffice besonders schwer.", loesung: true, erklaerung: "„Gerade neue Mitarbeiter lernen viel weniger“." },
          { id: "4", text: "Viele Menschen arbeiten zu Hause auch noch nach Feierabend.", loesung: true, erklaerung: "„Viele lesen auch abends noch dienstliche E-Mails.“" },
          { id: "5", text: "Der Autor schlägt feste Bürotage vor, damit Chefs die Mitarbeiter kontrollieren können.", loesung: false, erklaerung: "„nicht, um zu kontrollieren, sondern um sich auszutauschen“." },
          { id: "6", text: "Laut Autor brauchen Firmen klare Regeln für das Homeoffice.", loesung: true, erklaerung: "„Entscheidend ist …, dass Unternehmen klare Regeln aufstellen“." },
        ],
      },
      {
        id: "l2", modul: "lesen", typ: "mc", titel: "Lesen Teil 2",
        aufgabe: "Lesen Sie den Artikel. Welche Lösung (a, b oder c) ist richtig?",
        tr: "Yazıyı oku. Hangi şık doğru?",
        text: {
          titel: "Pflege in Not: Wenn Fachkräfte fehlen",
          absaetze: [
            "In deutschen Krankenhäusern und Pflegeheimen sind zehntausende Stellen unbesetzt. Die Folgen spüren Beschäftigte wie Patienten: Pflegekräfte müssen immer mehr Menschen gleichzeitig versorgen, Überstunden sind die Regel. Nicht wenige verlassen deshalb nach einigen Jahren den Beruf – was den Mangel weiter verschärft.",
            "Als eine Ursache gilt die vergleichsweise niedrige Bezahlung, die zwar in den letzten Jahren gestiegen ist, aber vielen noch immer nicht angemessen erscheint. Schwerer wiegen laut einer aktuellen Befragung jedoch die Arbeitsbedingungen: unzuverlässige Dienstpläne, häufiges Einspringen an freien Tagen und zu wenig Zeit für die einzelnen Patienten.",
            "Um die Lücke zu schließen, werben Kliniken zunehmend Fachkräfte im Ausland an. Diese Strategie ist allerdings umstritten. Kritiker weisen darauf hin, dass die Anerkennung ausländischer Abschlüsse oft monatelang dauert und viele der Angeworbenen Deutschland nach kurzer Zeit wieder verlassen, weil sie sich nicht willkommen fühlen.",
            "Ein Pflegeheim in Essen geht einen anderen Weg: Es hat die Dienstpläne so umgestellt, dass sie drei Monate im Voraus feststehen und nicht mehr geändert werden. Seitdem ist die Zahl der Kündigungen deutlich gesunken.",
          ],
        },
        fragen: [
          { id: "7", text: "Was ist eine Folge des Personalmangels?", optionen: ["Die Pflegekräfte verdienen weniger.", "Viele Pflegekräfte geben ihren Beruf auf.", "Es gibt weniger Patienten."], loesung: 1, erklaerung: "„Nicht wenige verlassen deshalb … den Beruf“." },
          { id: "8", text: "Laut der Befragung ist das größte Problem …", optionen: ["das niedrige Gehalt.", "die Arbeitsbedingungen.", "die Ausbildung."], loesung: 1, erklaerung: "„Schwerer wiegen … jedoch die Arbeitsbedingungen“ → maaştan daha ağır basan: koşullar." },
          { id: "9", text: "Was kritisieren manche an der Anwerbung im Ausland?", optionen: ["Dass sie zu teuer ist.", "Dass ausländische Fachkräfte schlechter ausgebildet sind.", "Dass viele nicht lange in Deutschland bleiben."], loesung: 2, erklaerung: "„viele der Angeworbenen Deutschland nach kurzer Zeit wieder verlassen“." },
          { id: "10", text: "Das Pflegeheim in Essen …", optionen: ["zahlt höhere Gehälter.", "plant die Dienste lange im Voraus.", "stellt mehr Personal aus dem Ausland ein."], loesung: 1, erklaerung: "Nöbet planları üç ay önceden belli ve değişmiyor." },
        ],
      },
      {
        id: "l3", modul: "lesen", typ: "zuordnen", titel: "Lesen Teil 3",
        aufgabe: "Lesen Sie die Meinungen zum Thema „Handyverbot an Schulen“. Wer sagt was? Eine Aussage passt zu keiner Person: Wählen Sie dann 0.",
        tr: "„Okullarda cep telefonu yasağı“ hakkındaki görüşleri oku. Hangi ifade kime ait? Bir ifade hiç kimseye uymuyor → 0.",
        texte: [
          { id: "a", titel: "Petra, Lehrerin", text: "Seit an unserer Schule Handys im Unterricht verboten sind, können sich die Schüler viel besser konzentrieren. In den Pausen spielen sie wieder miteinander, statt auf Bildschirme zu starren. Ich würde das Verbot sogar auf die Pausen ausweiten." },
          { id: "b", titel: "Ahmet, Vater", text: "Ich verstehe die Sorgen, aber mein Sohn fährt jeden Tag allein mit dem Bus. Ich möchte ihn erreichen können, wenn etwas passiert. Ein komplettes Verbot geht mir zu weit; die Handys könnten ja im Unterricht eingeschlossen werden." },
          { id: "c", titel: "Lena, Schülerin, 16", text: "Verbote bringen nichts, dann benutzen alle ihr Handy eben heimlich. Viel sinnvoller wäre es, wenn wir in der Schule lernen würden, wie man vernünftig mit dem Smartphone umgeht. Davon hätten wir mehr – auch für später." },
          { id: "d", titel: "Dr. Brenner, Kinderarzt", text: "Aus medizinischer Sicht ist klar: Zu viel Bildschirmzeit schadet dem Schlaf und der Konzentration von Kindern. Ein Verbot in der Schule allein löst das Problem aber nicht, denn die meiste Zeit verbringen Kinder zu Hause am Handy. Hier sind vor allem die Eltern gefragt." },
        ],
        fragen: [
          { id: "11", text: "Die Schule sollte den richtigen Umgang mit Smartphones unterrichten.", loesung: "c", erklaerung: "Lena: okulda akıllı telefonu doğru kullanmayı öğrenmeliyiz." },
          { id: "12", text: "Das Verbot sollte noch strenger werden.", loesung: "a", erklaerung: "Petra: yasağı teneffüslere de genişletirdim." },
          { id: "13", text: "Eltern tragen die größte Verantwortung.", loesung: "d", erklaerung: "Dr. Brenner: çocuklar en çok evde telefonda → „vor allem die Eltern gefragt“." },
          { id: "14", text: "Ein Kompromiss wäre besser als ein vollständiges Verbot.", loesung: "b", erklaerung: "Ahmet: tam yasak fazla; derste kilitli dolapta tutulabilir." },
          { id: "15", text: "Schüler sollten im Unterricht Tablets statt Bücher benutzen.", loesung: "0", erklaerung: "Kimse tabletten veya kitaplardan söz etmiyor → 0." },
        ],
      },
      {
        id: "h1", modul: "hoeren", typ: "mc", titel: "Hören Teil 1",
        aufgabe: "Sie hören vier kurze Texte. Zu jedem Text gibt es eine Aufgabe. Sie hören jeden Text höchstens zweimal.",
        tr: "Dört kısa metin. Her birine bir soru. En fazla iki kez dinle.",
        fragen: [
          {
            id: "16", hoertext: [["Nachrichten", "Die Stadt Bochum will bis zum Jahr 2030 alle städtischen Busse auf Elektroantrieb umstellen. Das kündigte der Oberbürgermeister heute an. Finanziert werden soll das Vorhaben zum großen Teil aus Fördermitteln des Bundes. Die Fahrpreise sollen dadurch nicht steigen."]],
            text: "Was ist richtig?", optionen: ["Die Fahrkarten werden teurer.", "Der Bund bezahlt einen großen Teil.", "Die Busse fahren schon elektrisch."], loesung: 1,
            erklaerung: "„zum großen Teil aus Fördermitteln des Bundes“; fiyatlar artmayacak.",
          },
          {
            id: "17", hoertext: [["Durchsage", "Sehr geehrte Fahrgäste, aufgrund einer Signalstörung kommt es auf der Strecke zwischen Essen und Duisburg zu Verspätungen von bis zu dreißig Minuten. Reisende nach Düsseldorf werden gebeten, ab Essen die S-Bahn-Linie 6 zu nutzen."]],
            text: "Was sollen Reisende nach Düsseldorf tun?", optionen: ["In Essen in eine andere Bahn umsteigen.", "Dreißig Minuten in Duisburg warten.", "Den Bus nehmen."], loesung: 0,
            erklaerung: "„ab Essen die S-Bahn-Linie 6 zu nutzen“ → Essen'de aktarma.",
          },
          {
            id: "18", hoertext: [["Podcast", "Viele glauben, dass man Fremdsprachen als Erwachsener nicht mehr richtig lernen kann. Die Forschung zeigt aber etwas anderes: Erwachsene lernen zwar die Aussprache schwerer als Kinder, dafür verstehen sie Grammatik oft schneller, weil sie Regeln bewusst anwenden können. Entscheidend ist vor allem, regelmäßig zu üben – lieber jeden Tag zehn Minuten als einmal pro Woche zwei Stunden."]],
            text: "Was sagt die Sprecherin über das Lernen?", optionen: ["Erwachsene lernen in allen Bereichen langsamer.", "Regelmäßiges kurzes Üben ist am wichtigsten.", "Kinder verstehen Grammatik schneller."], loesung: 1,
            erklaerung: "„Entscheidend ist vor allem, regelmäßig zu üben“ — her gün on dakika.",
          },
          {
            id: "19", hoertext: [["Mailbox", "Guten Tag, hier ist das Bürgeramt. Sie hatten online einen Termin für morgen um zehn Uhr gebucht, um Ihren Reisepass zu beantragen. Leider müssen wir den Termin wegen einer Systemumstellung absagen. Sie können über unsere Internetseite einen neuen Termin buchen. Bitte bringen Sie dann zusätzlich ein aktuelles biometrisches Foto mit."]],
            text: "Was muss die Person jetzt tun?", optionen: ["Morgen um zehn Uhr kommen.", "Beim Bürgeramt anrufen.", "Online einen neuen Termin machen."], loesung: 2,
            erklaerung: "„Sie können über unsere Internetseite einen neuen Termin buchen.“",
          },
        ],
      },
      {
        id: "h2", modul: "hoeren", typ: "rf", titel: "Hören Teil 2",
        aufgabe: "Sie hören eine Diskussion im Radio. Sind die Aussagen richtig oder falsch? Sie hören die Diskussion zweimal.",
        tr: "Radyoda bir tartışma. İfadeler doğru mu yanlış mı?",
        hoertext: [
          ["Moderator", "Unser Thema heute: Sollen Innenstädte autofrei werden? Bei mir sind Frau Lange vom Umweltverband und Herr Kaya, der ein Schuhgeschäft in der Innenstadt hat. Frau Lange, warum sind Sie dafür?"],
          ["Frau Lange", "Weil Autos in der Innenstadt enorm viel Platz brauchen, der für Menschen fehlt. Städte wie Kopenhagen zeigen, dass mehr Grün, mehr Radwege und weniger Lärm die Lebensqualität erheblich verbessern. Außerdem sinkt die Luftverschmutzung."],
          ["Moderator", "Herr Kaya, Sie sehen das skeptisch."],
          ["Herr Kaya", "Nicht grundsätzlich. Ich fahre selbst gern Rad. Aber viele meiner Kunden sind ältere Menschen, die nicht weit laufen können. Wenn sie nicht mehr mit dem Auto in die Nähe kommen, kaufen sie im Internet. Dann haben wir am Ende schöne, aber leere Straßen."],
          ["Frau Lange", "Das Argument höre ich oft. Studien zeigen aber, dass Fußgänger und Radfahrer insgesamt sogar mehr Geld in den Geschäften lassen, weil sie öfter kommen."],
          ["Herr Kaya", "Mag sein, aber dann muss der Nahverkehr besser werden. Bei uns fährt der Bus abends nur alle dreißig Minuten. Das ist keine Alternative."],
          ["Moderator", "Gibt es einen Punkt, bei dem Sie sich einig sind?"],
          ["Frau Lange", "Ich denke schon: Ohne guten Nahverkehr funktioniert es nicht. Man sollte die Innenstadt schrittweise umbauen und nicht von heute auf morgen."],
          ["Herr Kaya", "Da stimme ich zu. Und man sollte die Geschäftsleute fragen, bevor man entscheidet."],
        ],
        fragen: [
          { id: "20", text: "Frau Lange findet, dass Autos in der Stadt zu viel Platz einnehmen.", loesung: true, erklaerung: "„Autos … brauchen enorm viel Platz, der für Menschen fehlt“." },
          { id: "21", text: "Herr Kaya lehnt autofreie Innenstädte grundsätzlich ab.", loesung: false, erklaerung: "„Nicht grundsätzlich.“ Kendisi de bisiklet kullanıyor." },
          { id: "22", text: "Herr Kaya befürchtet, dass ältere Kunden online einkaufen.", loesung: true, erklaerung: "„Wenn sie nicht mehr mit dem Auto … kommen, kaufen sie im Internet.“" },
          { id: "23", text: "Laut Frau Lange geben Fußgänger weniger Geld aus als Autofahrer.", loesung: false, erklaerung: "Tersi: yayalar ve bisikletliler „sogar mehr Geld“ harcıyor." },
          { id: "24", text: "Beide sind der Meinung, dass man die Stadt langsam verändern sollte.", loesung: true, erklaerung: "„schrittweise umbauen“ — Herr Kaya: „Da stimme ich zu.“" },
        ],
      },
      {
        id: "h3", modul: "hoeren", typ: "mc", titel: "Hören Teil 3",
        aufgabe: "Sie hören einen kurzen Vortrag. Welche Lösung (a, b oder c) ist richtig? Sie hören den Vortrag zweimal.",
        tr: "Kısa bir sunum dinleyeceksin. Hangi şık doğru?",
        hoertext: [
          ["Referentin", "Guten Abend, meine Damen und Herren. Ich möchte heute über ein Thema sprechen, das uns alle betrifft: Lebensmittelverschwendung. In Deutschland landen jedes Jahr rund elf Millionen Tonnen Lebensmittel im Müll. Und das Überraschende: Mehr als die Hälfte davon wird nicht im Handel, sondern in privaten Haushalten weggeworfen."],
          ["Referentin", "Ein Hauptgrund ist ein Missverständnis beim Mindesthaltbarkeitsdatum. Viele denken, dass ein Joghurt nach diesem Datum nicht mehr essbar ist. Dabei bedeutet das Datum nur, dass der Hersteller bis dahin Geschmack und Qualität garantiert. Oft sind Produkte noch Tage oder Wochen danach einwandfrei. Mein Rat: Schauen, riechen, probieren."],
          ["Referentin", "Ein zweiter Grund ist, dass wir zu viel einkaufen, besonders wenn wir hungrig in den Supermarkt gehen oder große Packungen im Angebot sehen. Ein einfacher Einkaufszettel und ein kurzer Blick in den Kühlschrank vor dem Einkauf helfen schon sehr."],
          ["Referentin", "Und was tun mit Resten? In vielen Städten gibt es inzwischen sogenannte Fairteiler, öffentliche Kühlschränke, in die man Lebensmittel legen und aus denen sich jeder kostenlos bedienen kann. Bei uns in Herne gibt es zwei davon. Die Adressen finden Sie auf dem Handout, das gleich verteilt wird."],
        ],
        fragen: [
          { id: "25", text: "Wo werden die meisten Lebensmittel weggeworfen?", optionen: ["Im Handel.", "In privaten Haushalten.", "In Restaurants."], loesung: 1, erklaerung: "„Mehr als die Hälfte … in privaten Haushalten“." },
          { id: "26", text: "Was bedeutet das Mindesthaltbarkeitsdatum laut der Referentin?", optionen: ["Danach darf man das Produkt nicht mehr essen.", "Bis dahin garantiert der Hersteller die Qualität.", "Das Produkt muss bis dahin verkauft werden."], loesung: 1, erklaerung: "„der Hersteller bis dahin Geschmack und Qualität garantiert“." },
          { id: "27", text: "Was empfiehlt die Referentin beim Einkaufen?", optionen: ["Große Packungen im Angebot kaufen.", "Vorher in den Kühlschrank schauen.", "Nur einmal pro Woche einkaufen."], loesung: 1, erklaerung: "„ein kurzer Blick in den Kühlschrank vor dem Einkauf“." },
          { id: "28", text: "Was sind „Fairteiler“?", optionen: ["Öffentliche Kühlschränke zum Teilen von Lebensmitteln.", "Geschäfte mit günstigen Lebensmitteln.", "Kurse zum Thema Kochen."], loesung: 0, erklaerung: "„öffentliche Kühlschränke, … aus denen sich jeder kostenlos bedienen kann“." },
        ],
      },
    ],
  },
];

// ---------- Pruefen beim Start: jede Loesung muss eine erlaubte Antwort sein ----------
const byKey = new Map();
for (const p of PRUEFUNGEN) {
  if (byKey.has(p.key)) throw new Error("Prüfung doppelt: " + p.key);
  byKey.set(p.key, p);
  const ids = new Set();
  for (const t of p.teile) {
    for (const f of t.fragen) {
      if (ids.has(f.id)) throw new Error(`Prüfung ${p.key}: Frage ${f.id} doppelt`);
      ids.add(f.id);
      const ok = t.typ === "rf" ? typeof f.loesung === "boolean"
        : t.typ === "mc" ? Number.isInteger(f.loesung) && f.loesung >= 0 && f.loesung < f.optionen.length
          : f.loesung === "0" || t.texte.some((x) => x.id === f.loesung);
      if (!ok) throw new Error(`Prüfung ${p.key}: Lösung zu Frage ${f.id} ungültig`);
      if (!f.erklaerung) throw new Error(`Prüfung ${p.key}: Erklärung zu Frage ${f.id} fehlt`);
      if (t.modul === "hoeren" && !t.hoertext && !f.hoertext) throw new Error(`Prüfung ${p.key}: Hörtext zu Frage ${f.id} fehlt`);
    }
  }
}

module.exports = { PRUEFUNGEN, byKey };
