// Deutsch fuer Mustafa: Grammatik von A2 nach B2 (B1/B2-Themen in grammatik-aufbau.js).
// Erklaerungen auf Tuerkisch (Muttersprache), Uebungen auf Deutsch.
// Jede Uebung: [satz mit ___, [optionen], richtige option, hinweis auf Tuerkisch]
// Beim Aendern: Reihenfolge der Uebungen nicht umstellen, der Lernstand haengt am Index.

const THEMEN = [
  {
    key: "perfekt",
    titel: "Perfekt mit haben und sein",
    kurz: "Geçmiş zaman (konuşmada en çok kullanılan)",
    erklaerung: [
      "Konuşurken geçmişi çoğunlukla Perfekt ile anlatırız: yardımcı fiil (haben veya sein) + cümlenin sonunda Partizip II.",
      "**sein** kullanılır: yer değiştirme bildiren fiillerde (gehen, fahren, kommen, fliegen, umziehen) ve durum değişikliğinde (aufstehen, einschlafen, sterben). Ayrıca: sein, bleiben, passieren.",
      "Diğer fiillerin neredeyse hepsi **haben** alır.",
      "Partizip II: düzenli fiil ge…t (machen → gemacht), düzensiz fiil ge…en (schreiben → geschrieben). Ayrılabilen fiilde ge ortaya girer (einkaufen → eingekauft). -ieren ve be-/ver-/er- ile başlayanlarda ge yoktur (telefoniert, bezahlt, verstanden).",
    ],
    beispiele: ["Ich habe gestern lange gearbeitet.", "Wir sind am Wochenende nach Köln gefahren.", "Er ist um sechs Uhr aufgestanden."],
    uebungen: [
      ["Ich ___ gestern einen Brief geschrieben.", ["habe", "bin"], "habe", "schreiben bir hareket değil → haben."],
      ["Wir ___ mit dem Zug nach Berlin gefahren.", ["haben", "sind"], "sind", "fahren = bir yerden bir yere gitmek → sein."],
      ["Der Kollege hat die Rechnung schon ___.", ["bezahlt", "gebezahlt", "bezahlen"], "bezahlt", "be- ile başlayan fiillerde ge- eklenmez."],
      ["Wann ___ du heute aufgestanden?", ["hast", "bist"], "bist", "aufstehen = durum değişikliği (yatmaktan kalkmaya) → sein."],
      ["Wir haben am Samstag im Supermarkt ___.", ["eingekauft", "geeinkauft", "eingekaufen"], "eingekauft", "Ayrılabilen fiil: ein + ge + kauft."],
      ["Was ist denn hier ___?", ["passiert", "gepassiert", "passieren"], "passiert", "-ieren ile biten fiillerde ge- yok; passieren sein alır."],
      ["Ich habe Ihre E-Mail leider nicht ___.", ["verstanden", "verstehen", "geverstanden"], "verstanden", "ver- ile başlıyor → ge- yok, düzensiz: verstanden."],
      ["Mein Sohn ___ drei Tage zu Hause geblieben.", ["hat", "ist"], "ist", "bleiben istisnadır → sein."],
    ],
  },
  {
    key: "trennbar",
    titel: "Trennbare Verben",
    kurz: "Ayrılabilen fiiller (anrufen, einkaufen …)",
    erklaerung: [
      "an-, auf-, aus-, ein-, mit-, um-, zu-, ab-, vor-, zurück- gibi ön ekler cümlede fiilden **ayrılır** ve en sona gider.",
      "Ana cümlede: Ich **rufe** dich morgen **an**.",
      "Modal fiil veya yan cümlede ayrılmaz: Ich muss dich morgen **anrufen**. / …, weil ich dich morgen **anrufe**.",
      "Vurgu ön ektedir: ANrufen, EINkaufen. be-, ver-, er-, ent-, ge- ise hiç ayrılmaz (bezahlen, verstehen).",
    ],
    beispiele: ["Der Zug fährt um 8 Uhr ab.", "Kannst du bitte das Fenster aufmachen?", "Ich weiß nicht, wann der Kurs anfängt."],
    uebungen: [
      ["Ich ___ dich heute Abend ___.", ["rufe … an", "anrufe … –", "rufe … –"], "rufe … an", "Ana cümlede an- en sona gider."],
      ["Der Kurs ___ um 18 Uhr ___.", ["fängt … an", "anfängt … –", "fängt … –"], "fängt … an", "anfangen ayrılır: fängt … an."],
      ["Ich kann morgen leider nicht ___.", ["mitkommen", "kommen mit", "mit kommen"], "mitkommen", "Modal fiille (kann) fiil sonda bitişik kalır."],
      ["Er sagt, dass er nächste Woche ___.", ["umzieht", "zieht um", "um zieht"], "umzieht", "dass yan cümlesinde fiil sonda ve bitişik."],
      ["Wann ___ wir in Dortmund ___?", ["kommen … an", "ankommen … –", "kommen … –"], "kommen … an", "Soru cümlesinde de ön ek sona gider."],
      ["Bitte ___ Sie das Formular ___.", ["füllen … aus", "ausfüllen … –", "füllen … ein"], "füllen … aus", "ausfüllen = doldurmak; emir cümlesinde de ayrılır."],
      ["Ich ___ die Rechnung sofort.", ["bezahle", "zahle be", "be zahle"], "bezahle", "be- ön eki ayrılmaz."],
      ["Wir ___ am Samstag im Markt ___.", ["kaufen … ein", "einkaufen … –", "kaufen … aus"], "kaufen … ein", "einkaufen: kaufen … ein."],
    ],
  },
  {
    key: "modal",
    titel: "Modalverben",
    kurz: "können, müssen, dürfen, sollen, wollen, möchten",
    erklaerung: [
      "Modal fiil 2. sırada çekimlenir, asıl fiil **mastar halinde en sona** gider: Ich **muss** heute länger **arbeiten**.",
      "können = -ebilmek · müssen = zorunda olmak · dürfen = izinli olmak · sollen = (başkası istiyor) -meli · wollen = istemek (kesin) · möchten = istemek (kibar).",
      "ich/er/sie/es aynı biçimdedir ve -t almaz: ich kann, er kann · ich muss, er muss · ich will, er will.",
      "Geçmişte Präteritum yaygındır: konnte, musste, durfte, sollte, wollte.",
    ],
    beispiele: ["Darf ich hier rauchen? – Nein, das ist verboten.", "Der Arzt sagt, ich soll viel trinken.", "Gestern musste ich lange warten."],
    uebungen: [
      ["Hier ___ man nicht parken. Das ist verboten.", ["darf", "muss", "will"], "darf", "Yasak = nicht dürfen."],
      ["Ich ___ morgen zum Arzt. Ich habe einen Termin.", ["muss", "darf", "soll"], "muss", "Zorunluluk = müssen."],
      ["Der Chef sagt, ich ___ die E-Mail heute schicken.", ["soll", "will", "kann"], "soll", "Başkasının isteği = sollen."],
      ["___ Sie mir bitte helfen?", ["Können", "Müssen", "Dürfen"], "Können", "Kibar rica: Können Sie …?"],
      ["Er ___ sehr gut Deutsch sprechen.", ["kann", "kannt", "könnt"], "kann", "er kann – -t almaz."],
      ["Gestern ___ ich nicht kommen, ich war krank.", ["konnte", "kann", "könnte"], "konnte", "Geçmiş: konnte."],
      ["Ich ___ einen Kaffee, bitte.", ["möchte", "muss", "darf"], "möchte", "Kibar istek: möchte."],
      ["Wir müssen am Montag früher ___.", ["anfangen", "fangen an", "angefangen"], "anfangen", "Modal fiille asıl fiil sonda mastar."],
    ],
  },
  {
    key: "kasus",
    titel: "Akkusativ und Dativ",
    kurz: "Kimi/neyi? – Kime/kimde?",
    erklaerung: [
      "**Akkusativ** = -i hâli (neyi? kimi?): Ich sehe **den** Mann. Sadece eril (der) değişir: der → **den**, ein → **einen**.",
      "**Dativ** = -e/-de hâli (kime? kimde?): Ich helfe **dem** Mann. der/das → **dem**, die → **der**, çoğul → **den** (+n: den Kindern).",
      "Dativ alan fiiller: helfen, danken, gefallen, gehören, antworten, gratulieren. Akkusativ alanlar: haben, brauchen, suchen, kaufen, sehen, besuchen.",
      "Hem kime hem neyi: Ich gebe **dem** Kollegen (Dativ) **den** Schlüssel (Akkusativ).",
    ],
    beispiele: ["Ich brauche einen Termin.", "Kannst du mir helfen?", "Ich schenke meiner Frau einen Ring."],
    uebungen: [
      ["Ich suche ___ neuen Job.", ["einen", "ein", "einem"], "einen", "suchen + Akkusativ; der Job → einen."],
      ["Kannst du ___ Kollegen helfen?", ["dem", "den", "der"], "dem", "helfen + Dativ; der Kollege → dem Kollegen."],
      ["Die Wohnung gefällt ___ sehr.", ["mir", "mich", "ich"], "mir", "gefallen + Dativ: mir."],
      ["Ich gebe ___ Kundin die Rechnung.", ["der", "die", "den"], "der", "die Kundin, Dativ → der Kundin."],
      ["Wir besuchen am Sonntag ___ Großvater.", ["unseren", "unserem", "unser"], "unseren", "besuchen + Akkusativ; der Großvater → unseren."],
      ["Das Auto gehört ___ Chef.", ["dem", "den", "der"], "dem", "gehören + Dativ: dem Chef."],
      ["Ich danke ___ für die Hilfe.", ["Ihnen", "Sie", "Ihr"], "Ihnen", "danken + Dativ: Ihnen."],
      ["Er schreibt ___ Kindern eine Karte.", ["den", "die", "dem"], "den", "Çoğul Dativ: den Kindern (+n)."],
    ],
  },
  {
    key: "wechsel",
    titel: "Wechselpräpositionen",
    kurz: "in, an, auf … – Wo? (Dativ) / Wohin? (Akkusativ)",
    erklaerung: [
      "in, an, auf, über, unter, vor, hinter, neben, zwischen iki hâl alabilir.",
      "**Wo?** (nerede, durum) → **Dativ**: Das Buch liegt **auf dem** Tisch.",
      "**Wohin?** (nereye, hareket) → **Akkusativ**: Ich lege das Buch **auf den** Tisch.",
      "Durum fiilleri: liegen, stehen, sitzen, hängen, sein. Hareket fiilleri: legen, stellen, setzen, hängen, gehen, fahren.",
      "Kısaltmalar: in dem = im, an dem = am, in das = ins.",
    ],
    beispiele: ["Ich bin im Büro.", "Ich gehe ins Büro.", "Das Bild hängt an der Wand."],
    uebungen: [
      ["Der Schlüssel liegt ___ Tisch.", ["auf dem", "auf den", "auf der"], "auf dem", "Wo? liegen → Dativ: auf dem Tisch."],
      ["Ich stelle die Flasche ___ Kühlschrank.", ["in den", "im", "in dem"], "in den", "Wohin? stellen → Akkusativ."],
      ["Wir treffen uns ___ Bahnhof.", ["am", "an den", "an die"], "am", "Wo? → Dativ, an dem = am."],
      ["Morgen gehe ich ___ Kino.", ["ins", "im", "in der"], "ins", "Wohin? → in das = ins."],
      ["Das Auto steht ___ Haus.", ["vor dem", "vor das", "vor den"], "vor dem", "Wo? stehen → Dativ (das Haus → dem)."],
      ["Häng die Jacke bitte ___ Garderobe.", ["an die", "an der", "am"], "an die", "Wohin? hängen (asmak) → Akkusativ; die Garderobe."],
      ["Die Kinder spielen ___ Garten.", ["im", "in den", "ins"], "im", "Wo? → in dem = im."],
      ["Er setzt sich ___ Stuhl.", ["auf den", "auf dem", "auf der"], "auf den", "Wohin? sich setzen → Akkusativ."],
    ],
  },
  {
    key: "nebensatz",
    titel: "Nebensätze mit weil, dass, wenn",
    kurz: "Yan cümle: fiil en sona",
    erklaerung: [
      "weil (çünkü), dass (-dığı), wenn (eğer / -dığında), ob (-ıp -madığı), obwohl (-e rağmen) ile başlayan yan cümlede **çekimli fiil en sona** gider.",
      "Ich komme nicht, **weil** ich krank **bin**.",
      "Yan cümle başta ise ana cümle fiille başlar: **Wenn** ich Zeit **habe**, **komme** ich.",
      "denn de 'çünkü' demektir ama fiili sona atmaz: Ich komme nicht, **denn** ich **bin** krank.",
    ],
    beispiele: ["Ich glaube, dass er recht hat.", "Ich weiß nicht, ob der Laden offen ist.", "Obwohl es regnet, gehen wir spazieren."],
    uebungen: [
      ["Ich komme später, weil der Bus Verspätung ___.", ["hat", "haben", "hatte gehabt"], "hat", "weil → çekimli fiil sonda: … Verspätung hat."],
      ["Ich hoffe, dass du morgen Zeit ___.", ["hast", "hast du", "du hast"], "hast", "dass → fiil sonda."],
      ["___ ich Zeit habe, rufe ich dich an.", ["Wenn", "Weil", "Denn"], "Wenn", "Koşul / zaman: wenn."],
      ["Ich weiß nicht, ___ er heute kommt.", ["ob", "dass", "wenn"], "ob", "Evet/hayır belirsizliği: ob."],
      ["Er arbeitet heute, ___ er krank ist.", ["obwohl", "weil", "dass"], "obwohl", "Zıtlık: obwohl (-e rağmen)."],
      ["Ich lerne Deutsch, ___ ich in Deutschland arbeiten will.", ["weil", "obwohl", "ob"], "weil", "Sebep: weil."],
      ["Wenn das Wetter schön ist, ___ wir an den See.", ["fahren", "wir fahren", "fahren wir nicht"], "fahren", "Yan cümle başta → ana cümle fiille başlar: fahren wir."],
      ["Ich bleibe zu Hause, denn ich ___ müde.", ["bin", "müde bin", "sein"], "bin", "denn fiili sona atmaz: denn ich bin müde."],
    ],
  },
  {
    key: "adjektiv",
    titel: "Adjektivendungen",
    kurz: "ein großer Tisch, der große Tisch …",
    erklaerung: [
      "İsmin önündeki sıfat ek alır. En sık durumlar:",
      "**der/die/das** sonrası (Nominativ tekil): hep **-e** → der neue Kollege, die neue Kollegin, das neue Auto.",
      "**ein/eine** sonrası (Nominativ): sıfat cinsiyeti gösterir → ein neu**er** Kollege, eine neu**e** Kollegin, ein neu**es** Auto.",
      "Akkusativ'de sadece eril değişir: den neu**en** Kollegen, einen neu**en** Kollegen.",
      "Dativ'de ve çoğul der/die/den sonrasında neredeyse hep **-en**: mit dem neu**en** Auto, die neu**en** Kollegen.",
    ],
    beispiele: ["Ich habe eine kleine Wohnung.", "Der neue Chef ist nett.", "Wir wohnen in einem großen Haus."],
    uebungen: [
      ["Das ist ein ___ Auto.", ["neues", "neue", "neuer"], "neues", "ein + das (Nominativ) → -es."],
      ["Der ___ Kollege heißt Ali.", ["neue", "neuer", "neuen"], "neue", "der + Nominativ → -e."],
      ["Ich suche eine ___ Wohnung.", ["günstige", "günstigen", "günstiger"], "günstige", "eine + die (Akkusativ) → -e."],
      ["Er hat einen ___ Job gefunden.", ["guten", "gute", "guter"], "guten", "einen (eril Akkusativ) → -en."],
      ["Wir wohnen in einem ___ Haus.", ["alten", "altes", "alte"], "alten", "Dativ → -en."],
      ["Das ist ein ___ Tag!", ["schöner", "schöne", "schönen"], "schöner", "ein + der (Nominativ) → -er."],
      ["Die ___ Kollegen sind sehr nett.", ["neuen", "neue", "neuer"], "neuen", "Çoğul die sonrası → -en."],
      ["Ich trinke gern ___ Kaffee.", ["heißen", "heißer", "heiße"], "heißen", "Artikelsiz, eril Akkusativ → -en (heißen Kaffee)."],
    ],
  },
  {
    key: "komparativ",
    titel: "Komparativ und Superlativ",
    kurz: "größer als, am größten",
    erklaerung: [
      "Karşılaştırma: sıfat + **-er** + **als**: Berlin ist größ**er als** Herne.",
      "Eşitlik: **so** … **wie**: Die Wohnung ist so teuer wie die andere.",
      "En üstün: **am** … **-sten**: Der Zug ist **am schnellsten**.",
      "Kısa sıfatlarda a/o/u → ä/ö/ü: alt – älter, groß – größer, jung – jünger.",
      "Düzensiz: gut – besser – am besten · viel – mehr – am meisten · gern – lieber – am liebsten.",
    ],
    beispiele: ["Der Bus ist billiger als die Bahn.", "Ich trinke lieber Tee als Kaffee.", "Im Sommer ist es am wärmsten."],
    uebungen: [
      ["Mein Bruder ist ___ als ich.", ["älter", "alter", "mehr alt"], "älter", "alt → älter (umlaut)."],
      ["Die neue Wohnung ist größer ___ die alte.", ["als", "wie", "dann"], "als", "-er + als."],
      ["Er spricht so gut Deutsch ___ seine Frau.", ["wie", "als", "so"], "wie", "so … wie = eşitlik."],
      ["Ich finde Fahrrad fahren ___ als Bus fahren.", ["besser", "guter", "mehr gut"], "besser", "gut → besser."],
      ["Welcher Zug ist ___?", ["am schnellsten", "der schnellste als", "mehr schnell"], "am schnellsten", "En üstün: am …-sten."],
      ["Ich trinke ___ Tee als Kaffee.", ["lieber", "gerner", "mehr gern"], "lieber", "gern → lieber."],
      ["In der Stadt gibt es ___ Arbeit als auf dem Land.", ["mehr", "vieler", "meister"], "mehr", "viel → mehr."],
      ["Das ist die ___ Lösung.", ["beste", "besten", "gutste"], "beste", "die + Superlativ sıfat: die beste."],
    ],
  },
  {
    key: "reflexiv",
    titel: "Reflexive Verben",
    kurz: "sich freuen, sich anmelden …",
    erklaerung: [
      "Bazı fiiller dönüşlü zamirle kullanılır: **sich** freuen, sich beeilen, sich anmelden, sich beschweren, sich erkundigen.",
      "Zamirler (Akkusativ): mich, dich, **sich**, uns, euch, **sich**. (er/sie/es/Sie hepsi sich).",
      "Çoğu sabit bir edat alır: sich freuen **auf** (gelecek) / **über** (şimdiki/geçmiş), sich interessieren **für**, sich kümmern **um**, sich beschweren **über**.",
    ],
    beispiele: ["Ich freue mich auf den Urlaub.", "Wir müssen uns beeilen.", "Interessieren Sie sich für die Stelle?"],
    uebungen: [
      ["Ich freue ___ auf das Wochenende.", ["mich", "mir", "sich"], "mich", "ich → mich."],
      ["Wir müssen ___ beeilen, der Zug fährt gleich.", ["uns", "sich", "euch"], "uns", "wir → uns."],
      ["Er hat ___ beim Chef beschwert.", ["sich", "ihn", "ihm"], "sich", "er → sich."],
      ["Interessieren Sie sich ___ die Stelle?", ["für", "auf", "über"], "für", "sich interessieren für."],
      ["Ich freue mich ___ dein Geschenk. Danke!", ["über", "auf", "für"], "über", "Gelmiş olan bir şey → sich freuen über."],
      ["Kannst du dich ___ die Kinder kümmern?", ["um", "für", "über"], "um", "sich kümmern um."],
      ["Habt ihr ___ schon angemeldet?", ["euch", "sich", "uns"], "euch", "ihr → euch."],
      ["Ich möchte ___ nach dem Kurs erkundigen.", ["mich", "mir", "sich"], "mich", "ich → mich; sich erkundigen nach."],
    ],
  },
  {
    key: "praeteritum",
    titel: "Präteritum: war, hatte, wurde",
    kurz: "sein, haben ve werden'in geçmişi",
    erklaerung: [
      "sein, haben ve modal fiillerde konuşurken de Perfekt yerine çoğunlukla **Präteritum** kullanılır.",
      "sein: ich **war**, du warst, er **war**, wir **waren**, ihr wart, sie **waren**.",
      "haben: ich **hatte**, du hattest, er **hatte**, wir **hatten**, ihr hattet, sie **hatten**.",
      "werden: ich **wurde**, er **wurde**, wir **wurden** (… oldu).",
    ],
    beispiele: ["Gestern war ich krank.", "Wir hatten keine Zeit.", "Er wurde letztes Jahr Vater."],
    uebungen: [
      ["Gestern ___ ich beim Arzt.", ["war", "bin", "hatte"], "war", "sein → war."],
      ["Wir ___ am Wochenende Besuch.", ["hatten", "waren", "hatte"], "hatten", "wir → hatten."],
      ["___ du gestern im Büro?", ["Warst", "Wart", "Hattest"], "Warst", "du → warst."],
      ["Die Kinder ___ sehr müde.", ["waren", "war", "wurden"], "waren", "sie (çoğul) → waren."],
      ["Ich ___ leider keine Zeit.", ["hatte", "hattet", "war"], "hatte", "ich → hatte."],
      ["Er ___ 2019 Meister.", ["wurde", "war geworden", "werde"], "wurde", "werden → wurde."],
      ["Wie ___ der Urlaub?", ["war", "hatte", "wurde"], "war", "Nasıldı → war."],
      ["___ ihr gestern auch auf der Party?", ["Wart", "Waren", "Warst"], "Wart", "ihr → wart."],
    ],
  },
  {
    key: "hoeflich",
    titel: "Höflich bitten: würde, könnte, hätte gern",
    kurz: "Kibar rica (iş ve resmi yazışma)",
    erklaerung: [
      "Kibar rica ve önerilerde Konjunktiv II kullanılır: **Könnten** Sie …? **Würden** Sie …? Ich **hätte gern** … Ich **würde gern** …",
      "würde + mastar (sonda): **Würden** Sie mir bitte die Unterlagen **schicken**?",
      "Öneri: An Ihrer Stelle **würde** ich … · Wir **könnten** uns am Montag treffen.",
      "Biçimler: ich könnte / Sie könnten · ich würde / Sie würden · ich hätte / Sie hätten.",
    ],
    beispiele: ["Könnten Sie mir bitte helfen?", "Ich hätte gern einen Termin am Freitag.", "Wir würden gern früher anfangen."],
    uebungen: [
      ["___ Sie mir bitte die Unterlagen schicken?", ["Könnten", "Können würden", "Konnten"], "Könnten", "Kibar rica: Könnten Sie …?"],
      ["Ich ___ gern einen Kaffee.", ["hätte", "hatte", "habe würde"], "hätte", "Kibar sipariş: Ich hätte gern …"],
      ["Würden Sie bitte das Fenster ___?", ["schließen", "geschlossen", "schließt"], "schließen", "würde + mastar sonda."],
      ["Wir ___ uns am Montag treffen.", ["könnten", "konnten", "können würden"], "könnten", "Öneri: wir könnten …"],
      ["An Ihrer Stelle ___ ich den Vertrag genau lesen.", ["würde", "wurde", "werde"], "würde", "Tavsiye: An Ihrer Stelle würde ich …"],
      ["Ich würde gern nächste Woche Urlaub ___.", ["nehmen", "genommen", "nehme"], "nehmen", "würde … mastar."],
      ["___ es möglich, den Termin zu verschieben?", ["Wäre", "War", "Würde"], "Wäre", "sein → wäre: Wäre es möglich …?"],
      ["Könnten Sie mir bitte ___, wann der Kurs beginnt?", ["sagen", "sagten", "gesagt"], "sagen", "Modal + mastar sonda."],
    ],
  },
];

// Niveau der Themen in dieser Datei; die Reihenfolge im Lernpfad folgt dem Niveau
const NIVEAU = {
  perfekt: "A2", trennbar: "A2", modal: "A2", kasus: "A2", wechsel: "A2", reflexiv: "A2", komparativ: "A2",
  nebensatz: "B1", praeteritum: "B1", adjektiv: "B1", hoeflich: "B1",
};
for (const t of THEMEN) t.niveau = NIVEAU[t.key];
const AUFBAU = require("./grammatik-aufbau").THEMEN;
THEMEN.push(...AUFBAU.map(({ lektion, ...t }) => t));
const STUFE = { A2: 0, B1: 1, B2: 2 };
THEMEN.sort((a, b) => STUFE[a.niveau] - STUFE[b.niveau]); // stabil: innerhalb des Niveaus bleibt die Reihenfolge

const byKey = new Map(THEMEN.map((t) => [t.key, t]));
// Ein Uebungsschluessel: de:g:<thema>:<index>
const uebungKey = (thema, i) => "de:g:" + thema + ":" + i;

for (const t of THEMEN) {
  for (const [satz, optionen, richtig] of t.uebungen) {
    if (!optionen.includes(richtig)) throw new Error("Grammatik " + t.key + ": Lösung fehlt in den Optionen: " + satz);
  }
}

module.exports = { THEMEN, byKey, uebungKey };
