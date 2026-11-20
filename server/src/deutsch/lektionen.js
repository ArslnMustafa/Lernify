// Deutsch fuer Mustafa: die Lektion zu jedem Grammatikthema (gleiche Schluessel wie grammatik.js).
// Alles, was erklaert, auf Tuerkisch; alles, was gelernt wird, auf Deutsch.
//   tabelle  { kopf: [...], zeilen: [[...], ...] }
//   fehler   [falsch, richtig, warum]   -- typische Fehler, gerade fuer tuerkische Muttersprachler
//   tipps    Tueyolar: Eselsbruecken und Abkuerzungen
//   kaliplar [deutsch, tuerkisch]       -- fertige Saetze zum Auswendiglernen
//   ozet     Zusammenfassung fuer die Wiederholung

const LEKTIONEN = {
  perfekt: {
    einstieg: "Almanlar konuşurken geçmişi neredeyse hep Perfekt ile anlatır. Gazete ve kitapta Präteritum görürsün ama sohbette, e-postada ve sınavın konuşma bölümünde Perfekt kullanılır. Yapı hep aynıdır: haben/sein çekimlenir ve 2. sırada durur, Partizip II cümlenin en sonuna gider. Türkçedeki '-di'li geçmiş gibi düşünebilirsin.",
    tabelle: {
      kopf: ["Fiil türü", "Partizip II", "Örnek"],
      zeilen: [
        ["düzenli", "ge + kök + t", "machen → gemacht, arbeiten → gearbeitet"],
        ["düzensiz", "ge + (değişen) kök + en", "schreiben → geschrieben, fahren → gefahren"],
        ["ayrılabilen", "ön ek + ge + …", "einkaufen → eingekauft, anrufen → angerufen"],
        ["be-/ver-/er-/ent-", "ge YOK", "bezahlen → bezahlt, verstehen → verstanden"],
        ["-ieren", "ge YOK, -t", "telefonieren → telefoniert, studieren → studiert"],
      ],
    },
    fehler: [
      ["Ich habe nach Berlin gefahren.", "Ich bin nach Berlin gefahren.", "fahren bir yerden bir yere gitmek → sein."],
      ["Ich habe gestern gearbeitet viel.", "Ich habe gestern viel gearbeitet.", "Partizip II her zaman en sonda."],
      ["Ich habe die Rechnung gebezahlt.", "Ich habe die Rechnung bezahlt.", "be- ile başlayan fiil ge- almaz."],
      ["Er ist geblieben zu Hause.", "Er ist zu Hause geblieben.", "Partizip sona."],
    ],
    tipps: [
      "sein alan fiilleri bir hikâye gibi ezberle: 'Ich bin aufgestanden, zur Arbeit gefahren, angekommen, geblieben und nach Hause gegangen.'",
      "Fiil bir yer değişikliği veya durum değişikliği (uyanmak, ölmek, büyümek) anlatıyorsa → sein. Şüphedeysen haben de: fiillerin %90'ı haben alır.",
      "sein ve haben'in kendisi için konuşurken bile genelde Präteritum kullanılır: 'Ich war krank', 'Ich hatte keine Zeit'.",
    ],
    kaliplar: [
      ["Was hast du am Wochenende gemacht?", "Hafta sonu ne yaptın?"],
      ["Ich habe den ganzen Tag gearbeitet.", "Bütün gün çalıştım."],
      ["Wir sind gestern spät nach Hause gekommen.", "Dün eve geç geldik."],
      ["Ich habe Ihre E-Mail bekommen.", "E-postanızı aldım."],
      ["Ich habe den Termin leider vergessen.", "Maalesef randevuyu unuttum."],
    ],
    ozet: [
      "haben/sein 2. sırada, Partizip II en sonda.",
      "Hareket ve durum değişikliği → sein; geri kalanlar → haben.",
      "be-/ver-/er-/-ieren → ge- yok.",
    ],
  },

  trennbar: {
    einstieg: "Almancada birçok fiilin başında küçük bir ön ek vardır: anrufen, einkaufen, aufstehen. Cümlede bu ön ek fiilden kopar ve cümlenin sonuna uçar. Anlam ön ekle birlikte belirlenir: kommen gelmek, ankommen varmak, mitkommen birlikte gelmek. Ön eki unutursan anlam tamamen değişir.",
    tabelle: {
      kopf: ["Cümle türü", "Yapı", "Örnek"],
      zeilen: [
        ["Ana cümle", "fiil 2. sıra … ön ek sonda", "Ich rufe dich morgen an."],
        ["Soru", "fiil başta … ön ek sonda", "Rufst du mich morgen an?"],
        ["Modal fiille", "mastar sonda, bitişik", "Ich muss dich morgen anrufen."],
        ["Yan cümle", "çekimli fiil sonda, bitişik", "…, weil ich dich morgen anrufe."],
        ["Perfekt", "ön ek + ge + …", "Ich habe dich angerufen."],
      ],
    },
    fehler: [
      ["Ich anrufe dich morgen.", "Ich rufe dich morgen an.", "Ana cümlede ön ek ayrılır ve sona gider."],
      ["Ich muss dich morgen rufen an.", "Ich muss dich morgen anrufen.", "Modal fiille ayrılmaz."],
      ["Ich habe dich gerufen an.", "Ich habe dich angerufen.", "Perfekt'te ge ortaya girer: an-ge-rufen."],
    ],
    tipps: [
      "Vurgu ön ekteyse ayrılır: ANrufen, EINkaufen, MITkommen. Vurgu kökteyse ayrılmaz: beZAHlen, verSTEhen.",
      "Sık kullanılan ön ekler: an, auf, aus, ein, mit, um, zu, ab, vor, zurück, fern. Bu listeyi bir kâğıda yaz, buzdolabına as.",
      "Cümleyi kurduktan sonra kendine sor: 'Ön ek sonda mı?'",
    ],
    kaliplar: [
      ["Wann fängt der Kurs an?", "Kurs ne zaman başlıyor?"],
      ["Ich rufe Sie später zurück.", "Sizi sonra geri arayacağım."],
      ["Kommst du mit?", "Sen de geliyor musun?"],
      ["Der Zug kommt um 17 Uhr an.", "Tren saat 17'de varıyor."],
      ["Bitte füllen Sie das Formular aus.", "Lütfen formu doldurun."],
    ],
    ozet: [
      "Ana cümlede ön ek sona gider.",
      "Modal fiil ve yan cümlede bitişik kalır.",
      "Perfekt: an-ge-rufen, ein-ge-kauft.",
    ],
  },

  modal: {
    einstieg: "Modal fiiller cümleye 'yapabilmek, zorunda olmak, istemek' gibi bir renk katar. Çekimlenen modal fiildir ve 2. sıradadır; asıl fiil hiç çekimlenmez, mastar halinde en sona gider. Türkçede eklerle yaptığımızı (-ebil-, -meli) Almanca ayrı bir fiille yapar.",
    tabelle: {
      kopf: ["", "können", "müssen", "dürfen", "sollen", "wollen", "möchten"],
      zeilen: [
        ["ich", "kann", "muss", "darf", "soll", "will", "möchte"],
        ["du", "kannst", "musst", "darfst", "sollst", "willst", "möchtest"],
        ["er/sie/es", "kann", "muss", "darf", "soll", "will", "möchte"],
        ["wir/sie/Sie", "können", "müssen", "dürfen", "sollen", "wollen", "möchten"],
        ["ihr", "könnt", "müsst", "dürft", "sollt", "wollt", "möchtet"],
      ],
    },
    fehler: [
      ["Er kannt gut Deutsch sprechen.", "Er kann gut Deutsch sprechen.", "ich ve er biçimi aynıdır, -t almaz."],
      ["Ich muss arbeiten heute.", "Ich muss heute arbeiten.", "Mastar en sonda."],
      ["Du musst nicht rauchen hier. (yasak anlamında)", "Du darfst hier nicht rauchen.", "Yasak = nicht dürfen. nicht müssen = gerek yok."],
    ],
    tipps: [
      "nicht müssen ≠ nicht dürfen! 'Du musst nicht kommen' = gelmek zorunda değilsin. 'Du darfst nicht kommen' = gelmen yasak.",
      "sollen'i 'biri bana söyledi' diye düşün: 'Der Arzt sagt, ich soll mehr schlafen.'",
      "Kibar istek için wollen değil möchte kullan: 'Ich möchte einen Termin.' wollen kaba durabilir.",
    ],
    kaliplar: [
      ["Kann ich Ihnen helfen?", "Size yardım edebilir miyim?"],
      ["Darf ich kurz stören?", "Kısaca rahatsız edebilir miyim?"],
      ["Ich muss leider früher gehen.", "Maalesef erken gitmem gerekiyor."],
      ["Was soll ich mitbringen?", "Ne getirmeliyim?"],
      ["Ich möchte mich anmelden.", "Kayıt olmak istiyorum."],
    ],
    ozet: [
      "Modal fiil 2. sırada çekimli, asıl fiil sonda mastar.",
      "ich = er/sie/es (kann, muss, will).",
      "nicht müssen = gerek yok, nicht dürfen = yasak.",
    ],
  },

  kasus: {
    einstieg: "Türkçede 'ev-i gördüm', 'ev-e gittim' deriz; Almanca bu ekleri artikelle yapar. Bu yüzden Almancada artikel çok önemlidir: der, den, dem aynı kelimenin farklı hâlleridir. A2/B1 seviyesinde en çok Nominativ (özne), Akkusativ (-i hâli) ve Dativ (-e/-de hâli) lazım olur.",
    tabelle: {
      kopf: ["", "eril (der)", "dişil (die)", "nötr (das)", "çoğul (die)"],
      zeilen: [
        ["Nominativ", "der / ein", "die / eine", "das / ein", "die / –"],
        ["Akkusativ", "den / einen", "die / eine", "das / ein", "die / –"],
        ["Dativ", "dem / einem", "der / einer", "dem / einem", "den / – (+n)"],
      ],
    },
    fehler: [
      ["Ich habe ein Termin.", "Ich habe einen Termin.", "der Termin → Akkusativ: einen."],
      ["Ich helfe den Kollegen. (tek kişi)", "Ich helfe dem Kollegen.", "helfen her zaman Dativ."],
      ["Das gefällt mich.", "Das gefällt mir.", "gefallen + Dativ: mir."],
      ["mit die Kinder", "mit den Kindern", "mit + Dativ, çoğulda den + -n."],
    ],
    tipps: [
      "Akkusativ'de sadece eril değişir: der → den. Dişil ve nötr aynı kalır. Bu sayede işin yarısı zaten bitti!",
      "Dativ edatlarını şarkı gibi ezberle: aus, bei, mit, nach, seit, von, zu → hep Dativ.",
      "Akkusativ edatları: durch, für, gegen, ohne, um → 'DuFüGeOU' diye ezberle.",
      "Zamirler: ich – mich – mir, du – dich – dir, er – ihn – ihm, sie – sie – ihr, wir – uns – uns, Sie – Sie – Ihnen.",
    ],
    kaliplar: [
      ["Können Sie mir helfen?", "Bana yardım edebilir misiniz?"],
      ["Ich brauche einen Termin.", "Bir randevuya ihtiyacım var."],
      ["Das gehört mir nicht.", "Bu benim değil."],
      ["Ich fahre mit dem Bus zur Arbeit.", "İşe otobüsle gidiyorum."],
      ["Wie geht es Ihnen?", "Nasılsınız?"],
    ],
    ozet: [
      "Akkusativ: sadece der → den (ein → einen).",
      "Dativ: dem / der / dem / den(+n).",
      "aus-bei-mit-nach-seit-von-zu → Dativ; durch-für-gegen-ohne-um → Akkusativ.",
    ],
  },

  wechsel: {
    einstieg: "Bazı edatlar duruma göre iki farklı hâl alır. Kural basit: bir şey bir yerde DURUYORSA (Wo?) Dativ, bir yere GİDİYORSA (Wohin?) Akkusativ. Türkçedeki '-de' ve '-e' farkının aynısı: masa-da (Wo?) / masa-ya (Wohin?).",
    tabelle: {
      kopf: ["Soru", "Hâl", "Fiil", "Örnek"],
      zeilen: [
        ["Wo? (nerede)", "Dativ", "liegen, stehen, sitzen, hängen", "Das Handy liegt auf dem Tisch."],
        ["Wohin? (nereye)", "Akkusativ", "legen, stellen, setzen, hängen", "Ich lege das Handy auf den Tisch."],
        ["Wo?", "Dativ", "sein, arbeiten, wohnen", "Ich bin im Büro."],
        ["Wohin?", "Akkusativ", "gehen, fahren, kommen", "Ich gehe ins Büro."],
      ],
    },
    fehler: [
      ["Ich gehe im Kino.", "Ich gehe ins Kino.", "Hareket var (Wohin?) → in das = ins."],
      ["Ich bin in die Arbeit.", "Ich bin bei der Arbeit / auf der Arbeit.", "Durum (Wo?) → Dativ."],
      ["Ich lege das Buch auf dem Tisch.", "Ich lege das Buch auf den Tisch.", "legen = koymak (hareket) → Akkusativ."],
    ],
    tipps: [
      "Fiil çiftlerini birlikte ezberle: liegen/legen, stehen/stellen, sitzen/setzen, hängen/hängen. İlki Wo? (Dativ), ikincisi Wohin? (Akkusativ).",
      "Kişilere gidilirken zu kullanılır (Dativ): Ich gehe zum Arzt. Ülke ve şehirlere nach: Ich fahre nach Köln.",
      "Kısaltmalar çok sık: im, am, ins. Sınavda bunları doğru kullanmak puan getirir.",
    ],
    kaliplar: [
      ["Wo ist die Toilette? – Im ersten Stock.", "Tuvalet nerede? – Birinci katta."],
      ["Ich gehe kurz in die Kantine.", "Kısa bir süre yemekhaneye gidiyorum."],
      ["Stellen Sie die Kiste bitte ins Lager.", "Kutuyu lütfen depoya koyun."],
      ["Wir treffen uns vor dem Bahnhof.", "Garın önünde buluşuyoruz."],
      ["Der Schlüssel hängt an der Tür.", "Anahtar kapıda asılı."],
    ],
    ozet: [
      "Wo? → Dativ (dem/der/dem/den).",
      "Wohin? → Akkusativ (den/die/das/die).",
      "im = in dem, am = an dem, ins = in das.",
    ],
  },

  nebensatz: {
    einstieg: "Uzun ve doğal cümleler kurmak için yan cümle şart. B1 sınavında puanı en çok artıran şeylerden biri budur. Kural tek: weil, dass, wenn, ob, obwohl, als gibi bir bağlaçla başlayan cümlede çekimli fiil EN SONA gider. Türkçede fiil zaten sonda olduğu için aslında sana tanıdık gelecek!",
    tabelle: {
      kopf: ["Bağlaç", "Anlam", "Örnek"],
      zeilen: [
        ["weil", "çünkü", "Ich komme nicht, weil ich krank bin."],
        ["dass", "-dığı(nı)", "Ich glaube, dass er recht hat."],
        ["wenn", "eğer / -dığında (tekrarlanan)", "Wenn ich Zeit habe, rufe ich an."],
        ["als", "-dığında (geçmişte bir kez)", "Als ich klein war, wohnten wir in Izmir."],
        ["ob", "-ıp -madığı", "Ich weiß nicht, ob er kommt."],
        ["obwohl", "-e rağmen", "Obwohl es regnet, gehen wir raus."],
      ],
    },
    fehler: [
      ["…, weil ich bin krank.", "…, weil ich krank bin.", "weil → fiil sona."],
      ["Wenn ich Zeit habe, ich komme.", "Wenn ich Zeit habe, komme ich.", "Yan cümle öndeyse ana cümle FİİLLE başlar."],
      ["Wenn ich ein Kind war, …", "Als ich ein Kind war, …", "Geçmişte tek bir dönem → als."],
      ["Ich weiß nicht, wenn er kommt. (gelip gelmeyeceği)", "Ich weiß nicht, ob er kommt.", "Evet/hayır belirsizliği → ob."],
    ],
    tipps: [
      "Formül: Yan cümle önde ise 'fiil, fiil' yan yana gelir: 'Wenn ich Zeit habe, komme ich.' (habe, komme)",
      "denn de 'çünkü' ama fiili sona atmaz: 'denn ich bin krank'. Kolay yol istiyorsan denn kullan, ama sınavda weil göstermek daha çok puan getirir.",
      "Yazarken her yan cümlede fiili parmağınla bul ve en sonda olduğunu kontrol et.",
    ],
    kaliplar: [
      ["Ich glaube, dass das eine gute Idee ist.", "Bunun iyi bir fikir olduğunu düşünüyorum."],
      ["Ich schreibe Ihnen, weil ich eine Frage habe.", "Bir sorum olduğu için size yazıyorum."],
      ["Können Sie mir sagen, ob der Kurs noch frei ist?", "Kursta hâlâ yer olup olmadığını söyleyebilir misiniz?"],
      ["Wenn Sie Fragen haben, rufen Sie mich an.", "Sorunuz olursa beni arayın."],
      ["Obwohl ich wenig Zeit habe, lerne ich jeden Tag.", "Az vaktim olmasına rağmen her gün çalışıyorum."],
    ],
    ozet: [
      "weil/dass/wenn/ob/obwohl/als → çekimli fiil en sonda.",
      "Yan cümle önde → ana cümle fiille başlar.",
      "denn fiili sona atmaz.",
    ],
  },

  adjektiv: {
    einstieg: "Sıfat ismin önüne gelince ek alır: der neue Kollege, ein neuer Kollege. Bu konu Almanların bile bazen zorlandığı bir konu, korkma! A2/B1 için birkaç temel kural yeterli; geri kalanını bol okuyarak kulağın alışır.",
    tabelle: {
      kopf: ["", "der (bestimmt)", "ein (unbestimmt)"],
      zeilen: [
        ["Nominativ eril", "der neue Tisch", "ein neuer Tisch"],
        ["Nominativ dişil", "die neue Lampe", "eine neue Lampe"],
        ["Nominativ nötr", "das neue Auto", "ein neues Auto"],
        ["Akkusativ eril", "den neuen Tisch", "einen neuen Tisch"],
        ["Dativ (hepsi)", "dem/der neuen …", "einem/einer neuen …"],
        ["Çoğul", "die neuen Tische", "neue Tische"],
      ],
    },
    fehler: [
      ["ein neue Auto", "ein neues Auto", "ein + nötr → sıfat -es alır (artikel göstermediği için)."],
      ["mit einem neue Auto", "mit einem neuen Auto", "Dativ → -en."],
      ["die neue Kollegen (çoğul)", "die neuen Kollegen", "Çoğul die sonrası → -en."],
    ],
    tipps: [
      "Altın kural: der/die/das sonrası tekilde Nominativ'de hep -e. Geri kalan yerlerin çoğunda -en.",
      "ein'den sonra sıfat, artikelin söyleyemediği cinsiyeti söyler: ein neuER (der), ein neuES (das).",
      "Emin değilsen -en de: yanılma olasılığın en düşük ek budur.",
    ],
    kaliplar: [
      ["Ich suche eine günstige Wohnung.", "Uygun fiyatlı bir daire arıyorum."],
      ["Ich habe gute Erfahrungen im Verkauf.", "Satışta iyi deneyimlerim var."],
      ["Das ist eine gute Frage.", "Bu iyi bir soru."],
      ["Ich wünsche Ihnen ein schönes Wochenende.", "Size iyi hafta sonları dilerim."],
      ["Vielen Dank für die schnelle Antwort.", "Hızlı cevabınız için çok teşekkürler."],
    ],
    ozet: [
      "der/die/das + sıfat (Nominativ tekil) → -e.",
      "ein + sıfat → -er (der), -e (die), -es (das).",
      "Dativ ve çoğulda çoğunlukla -en.",
    ],
  },

  komparativ: {
    einstieg: "Karşılaştırma günlük hayatta her an lazım: daha ucuz, daha hızlı, en iyi. Almancada bu çok düzenli: sıfat + -er (daha), am + sıfat + -sten (en). Türkçedeki 'daha' ve 'en' kelimeleri burada ek oluyor.",
    tabelle: {
      kopf: ["Temel", "Komparativ (daha)", "Superlativ (en)"],
      zeilen: [
        ["billig", "billiger", "am billigsten"],
        ["schnell", "schneller", "am schnellsten"],
        ["alt / groß / jung", "älter / größer / jünger", "am ältesten / größten / jüngsten"],
        ["gut", "besser", "am besten"],
        ["viel", "mehr", "am meisten"],
        ["gern", "lieber", "am liebsten"],
      ],
    },
    fehler: [
      ["Er ist mehr alt als ich.", "Er ist älter als ich.", "Almancada 'mehr' ile değil -er ekiyle yapılır."],
      ["größer wie", "größer als", "-er + als; so … wie eşitlikte."],
      ["Ich trinke gerner Tee.", "Ich trinke lieber Tee.", "gern → lieber (düzensiz)."],
    ],
    tipps: [
      "als = daha (farklılık), wie = kadar (eşitlik). 'so groß wie' / 'größer als'.",
      "Tek heceli sıfatlarda a/o/u genelde umlaut alır: arm → ärmer, kurz → kürzer.",
      "Sınavda fikir bildirirken çok işe yarar: 'Ich finde Homeoffice besser als …'",
    ],
    kaliplar: [
      ["Gibt es das auch billiger?", "Bunun daha ucuzu var mı?"],
      ["Am liebsten arbeite ich im Team.", "En çok ekip içinde çalışmayı severim."],
      ["Mit dem Zug geht es schneller als mit dem Bus.", "Trenle otobüsten daha hızlı gidilir."],
      ["Das ist für mich am wichtigsten.", "Bu benim için en önemlisi."],
      ["Je früher, desto besser.", "Ne kadar erken o kadar iyi."],
    ],
    ozet: [
      "-er + als (daha), so … wie (kadar), am …-sten (en).",
      "gut-besser-am besten, viel-mehr-am meisten, gern-lieber-am liebsten.",
    ],
  },

  reflexiv: {
    einstieg: "Bazı Almanca fiiller 'kendini' anlamına gelen bir zamirle kullanılır: sich freuen (sevinmek), sich beeilen (acele etmek). Türkçede çoğu zaman bu 'kendi' anlamı hissedilmez, bu yüzden fiili zamiriyle birlikte, bir kalıp gibi ezberlemek en iyisi.",
    tabelle: {
      kopf: ["Kişi", "Zamir (Akkusativ)", "Örnek"],
      zeilen: [
        ["ich", "mich", "Ich freue mich."],
        ["du", "dich", "Du beeilst dich."],
        ["er/sie/es", "sich", "Er meldet sich an."],
        ["wir", "uns", "Wir treffen uns."],
        ["ihr", "euch", "Ihr erholt euch."],
        ["sie/Sie", "sich", "Sie beschweren sich."],
      ],
    },
    fehler: [
      ["Ich freue auf den Urlaub.", "Ich freue mich auf den Urlaub.", "Zamir unutulmaz."],
      ["Ich interessiere mich an Fußball.", "Ich interessiere mich für Fußball.", "sich interessieren für."],
      ["Er hat ihn beschwert. (kendisi)", "Er hat sich beschwert.", "3. kişide hep sich."],
    ],
    tipps: [
      "sich freuen AUF = henüz olmamış bir şeye sevinmek (tatile). sich freuen ÜBER = olmuş bir şeye sevinmek (hediyeye).",
      "Her yeni dönüşlü fiili edatıyla birlikte kart olarak yaz: sich kümmern um, sich erinnern an, sich bewerben um/bei.",
      "Perfekt'te hep haben: Ich habe mich angemeldet.",
    ],
    kaliplar: [
      ["Ich freue mich auf Ihre Antwort.", "Cevabınızı dört gözle bekliyorum."],
      ["Ich möchte mich für die Stelle bewerben.", "Bu pozisyon için başvurmak istiyorum."],
      ["Wir müssen uns beeilen.", "Acele etmemiz gerekiyor."],
      ["Ich interessiere mich für den Kurs.", "Kursla ilgileniyorum."],
      ["Ich habe mich sehr über das Geschenk gefreut.", "Hediyeye çok sevindim."],
    ],
    ozet: [
      "mich, dich, sich, uns, euch, sich.",
      "Fiili edatıyla birlikte ezberle (sich freuen auf/über).",
      "Perfekt: haben.",
    ],
  },

  praeteritum: {
    einstieg: "Konuşmada geçmiş için Perfekt kullanılır, ama sein, haben ve modal fiillerde Almanlar kısa yolu seçer: Präteritum. 'Ich bin krank gewesen' yerine 'Ich war krank' demek hem daha kısa hem daha doğal.",
    tabelle: {
      kopf: ["", "sein", "haben", "werden", "können", "müssen"],
      zeilen: [
        ["ich", "war", "hatte", "wurde", "konnte", "musste"],
        ["du", "warst", "hattest", "wurdest", "konntest", "musstest"],
        ["er/sie/es", "war", "hatte", "wurde", "konnte", "musste"],
        ["wir/sie/Sie", "waren", "hatten", "wurden", "konnten", "mussten"],
        ["ihr", "wart", "hattet", "wurdet", "konntet", "musstet"],
      ],
    },
    fehler: [
      ["Ich bin gestern krank gewesen.", "Ich war gestern krank.", "Yanlış değil ama çok uzun; konuşmada war kullan."],
      ["Er warte zu Hause.", "Er war zu Hause.", "sein → war."],
      ["Ich habe keine Zeit gehabt.", "Ich hatte keine Zeit.", "Daha doğal ve kısa."],
    ],
    tipps: [
      "Basit kural: sein, haben, Modalverben → Präteritum; diğer bütün fiiller → Perfekt. Konuşmada bununla %95 doğru olursun.",
      "ich ve er biçimi hep aynı: ich war / er war, ich hatte / er hatte.",
    ],
    kaliplar: [
      ["Wie war Ihr Wochenende?", "Hafta sonunuz nasıldı?"],
      ["Ich hatte leider keine Zeit.", "Maalesef vaktim yoktu."],
      ["Gestern konnte ich nicht kommen.", "Dün gelemedim."],
      ["Ich musste lange warten.", "Uzun süre beklemek zorunda kaldım."],
      ["Das war sehr nett von Ihnen.", "Bu sizin için çok kibar bir davranıştı."],
    ],
    ozet: [
      "war, hatte, wurde, konnte, musste, wollte.",
      "sein/haben/Modal → Präteritum, gerisi → Perfekt.",
    ],
  },

  hoeflich: {
    einstieg: "İşte, resmi dairede ve sınavda kibar konuşmak çok önemlidir. Almanca bunu Konjunktiv II ile yapar: 'Können Sie …?' yerine 'Könnten Sie …?' demek ricayı çok daha nazik yapar. Türkçedeki '-ebilir misiniz' ile '-ebilir miydiniz' farkı gibi.",
    tabelle: {
      kopf: ["Normal", "Kibar (Konjunktiv II)", "Kullanım"],
      zeilen: [
        ["Können Sie …?", "Könnten Sie …?", "rica"],
        ["Ich will …", "Ich hätte gern … / Ich würde gern …", "istek"],
        ["Ist es möglich …?", "Wäre es möglich …?", "izin, olasılık"],
        ["Mach das!", "Würden Sie das bitte machen?", "talimat"],
        ["Du sollst …", "An deiner Stelle würde ich …", "tavsiye"],
      ],
    },
    fehler: [
      ["Ich will einen Kaffee.", "Ich hätte gern einen Kaffee.", "will kaba durur."],
      ["Würden Sie mir helfen können?", "Könnten Sie mir helfen?", "würde + können çift kibarlık, gereksiz."],
      ["Ich würde gern Urlaub nehme.", "Ich würde gern Urlaub nehmen.", "würde + mastar."],
    ],
    tipps: [
      "Sihirli üçlü: Könnten Sie …? · Würden Sie …? · Wäre es möglich, …? Bu üçüyle her ricayı yaparsın.",
      "E-postalarda 'bitte' ile birlikte kullan: 'Könnten Sie mir bitte … schicken?'",
      "Sınavda (Teil: gemeinsam etwas planen) öneri için: 'Wir könnten …', 'Wie wäre es mit …?'",
    ],
    kaliplar: [
      ["Könnten Sie das bitte wiederholen?", "Bunu lütfen tekrar edebilir misiniz?"],
      ["Ich hätte gern einen Termin am Montag.", "Pazartesi için bir randevu almak isterim."],
      ["Wäre es möglich, den Termin zu verschieben?", "Randevuyu ertelemek mümkün olur mu?"],
      ["Wie wäre es mit Samstag?", "Cumartesiye ne dersin?"],
      ["Ich würde vorschlagen, dass wir früher anfangen.", "Daha erken başlamamızı öneririm."],
    ],
    ozet: [
      "könnte, würde, hätte, wäre = kibar biçimler.",
      "würde + mastar (sonda).",
      "Ich hätte gern … = kibar istek.",
    ],
  },
};

// Die Lektionen der B1/B2-Themen stehen direkt bei ihren Uebungen
for (const t of require("./grammatik-aufbau").THEMEN) LEKTIONEN[t.key] = t.lektion;

module.exports = { LEKTIONEN };
