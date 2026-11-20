// Deutsch fuer Mustafa: Wortschatz-Karten und Grammatik, mit demselben
// Karteikasten wie der Baugeschichte-Trainer (Tabelle trainer_progress,
// Schluessel mit "de:" davor, damit sich beides nie in die Quere kommt).
const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { hatDeutsch } = require("../config");
const { woerter, byKey: wortByKey, BEREICHE, NIVEAUS } = require("../deutsch/wortschatz");
const { THEMEN, byKey: themaByKey, uebungKey } = require("../deutsch/grammatik");
const { LEKTIONEN } = require("../deutsch/lektionen");
const { SITUATIONEN } = require("../deutsch/redemittel");
const { TIPPS } = require("../deutsch/tipps");
const { PRUEFUNGEN, byKey: pruefungByKey } = require("../deutsch/pruefungen");

// Punkte und Serie: jeden Tag ein kleines Ziel, damit das Lernen jeden Tag stattfindet.
db.exec(`
  CREATE TABLE IF NOT EXISTS deutsch_xp (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    xp INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, tag)
  );
`);
// Jeder abgegebene Modelltest, mit Antworten, damit man spaeter nachsehen kann
db.exec(`
  CREATE TABLE IF NOT EXISTS deutsch_pruefung (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    test TEXT NOT NULL,
    lesen INTEGER NOT NULL, lesen_max INTEGER NOT NULL,
    hoeren INTEGER NOT NULL, hoeren_max INTEGER NOT NULL,
    sekunden INTEGER,
    antworten TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);
const TAGESZIEL = 50;
const XP = { richtig: 10, falsch: 3, gelesen: 15 };
// Der Tag wechselt um Mitternacht in Deutschland, nicht in UTC
const tagVon = (d) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
function xpDazu(userId, punkte) {
  db.prepare(`INSERT INTO deutsch_xp (user_id, tag, xp) VALUES (?, ?, ?)
              ON CONFLICT(user_id, tag) DO UPDATE SET xp = xp + excluded.xp`).run(userId, tagVon(new Date()), punkte);
}
function xpStand(userId) {
  const rows = db.prepare("SELECT tag, xp FROM deutsch_xp WHERE user_id = ?").all(userId);
  const proTag = new Map(rows.map((r) => [r.tag, r.xp]));
  const heute = tagVon(new Date());
  const tag = (n) => tagVon(new Date(Date.now() - n * 86400000));
  // Serie: heute noch nicht gelernt bricht sie nicht, erst ein ganzer leerer Tag
  let serie = 0;
  for (let n = proTag.get(heute) ? 0 : 1; proTag.get(tag(n)) > 0; n++) serie++;
  const woche = [];
  for (let n = 6; n >= 0; n--) woche.push({ tag: tag(n), xp: proTag.get(tag(n)) || 0 });
  return {
    heute: proTag.get(heute) || 0, ziel: TAGESZIEL, serie, woche,
    gesamt: rows.reduce((s2, r) => s2 + r.xp, 0),
  };
}

const router = express.Router();
router.use(requireAuth);
router.use((req, res, next) => {
  if (hatDeutsch(req.user)) return next();
  res.status(403).json({ error: "Deutsch ist für dich nicht freigeschaltet." });
});

// Wie im Trainer: richtig = eine Box weiter, falsch = zurueck auf 1.
// Wortschatz braucht eine Box mehr, sonst kommen gelernte Woerter zu frueh nicht mehr.
const FIRST_BOX = 1;
const LAST_BOX = 4;
const RUHE_TAGE = { 1: 0, 2: 1, 3: 4, 4: 10 };

const jetzt = () => db.prepare("SELECT datetime('now') AS jetzt").get().jetzt;

function stand(userId) {
  const rows = db.prepare(
    "SELECT item_key, box, kind, correct_count, wrong_count, due_at FROM trainer_progress WHERE user_id = ? AND item_key LIKE 'de:%'"
  ).all(userId);
  return new Map(rows.map((r) => [r.item_key, r]));
}
const boxOf = (e) => (e ? e.box : FIRST_BOX);
const istFaellig = (e, now) => !e || !e.due_at || e.due_at <= now;

function speichern(userId, key, kind, richtig) {
  const cur = db.prepare("SELECT box FROM trainer_progress WHERE user_id = ? AND item_key = ?").get(userId, key);
  const box = cur ? cur.box : FIRST_BOX;
  const next = richtig ? Math.min(box + 1, LAST_BOX) : FIRST_BOX;
  db.prepare(
    `INSERT INTO trainer_progress (user_id, item_key, box, kind, correct_count, wrong_count, due_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now', ?), datetime('now'))
     ON CONFLICT(user_id, item_key) DO UPDATE SET
       box = excluded.box, kind = excluded.kind,
       correct_count = correct_count + excluded.correct_count,
       wrong_count = wrong_count + excluded.wrong_count,
       due_at = excluded.due_at, updated_at = datetime('now')`
  ).run(userId, key, next, kind, richtig ? 1 : 0, richtig ? 0 : 1, "+" + (RUHE_TAGE[next] || 0) + " days");
  xpDazu(userId, richtig ? XP.richtig : XP.falsch);
  return { fromBox: box, toBox: next, wiederIn: RUHE_TAGE[next] || 0, xp: richtig ? XP.richtig : XP.falsch };
}

const pick = (list) => list[Math.floor(Math.random() * list.length)];
function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ---------- Uebersicht ----------
router.get("/uebersicht", (req, res) => {
  const s = stand(req.user.id);
  const now = jetzt();
  const bereiche = Object.entries(BEREICHE).map(([key, b]) => {
    const list = woerter.filter((w) => w.bereich === key);
    return {
      key, ...b,
      woerter: list.length,
      neu: list.filter((w) => !s.has(w.key)).length,
      faellig: list.filter((w) => istFaellig(s.get(w.key), now)).length,
      sicher: list.filter((w) => boxOf(s.get(w.key)) >= 3).length,
      themen: [...new Set(list.map((w) => w.thema))],
    };
  });
  // Fortschritt je Niveau: wie viele Woerter sitzen schon (Box 3 oder 4)
  const niveaus = NIVEAUS.map((n) => {
    const list = woerter.filter((w) => w.niveau === n);
    return { niveau: n, woerter: list.length, sicher: list.filter((w) => boxOf(s.get(w.key)) >= 3).length };
  });
  const grammatik = THEMEN.map((t) => {
    const keys = t.uebungen.map((_, i) => uebungKey(t.key, i));
    const sicher = keys.filter((k) => boxOf(s.get(k)) >= 2).length;
    const gelesen = s.has("de:l:" + t.key);
    return {
      key: t.key, titel: t.titel, kurz: t.kurz, niveau: t.niveau, uebungen: keys.length,
      gemacht: keys.filter((k) => s.has(k)).length, sicher, gelesen,
      // Eine Lektion gilt als geschafft: gelesen und mindestens drei Viertel sicher
      fertig: gelesen && sicher >= Math.ceil(keys.length * 0.75),
    };
  });
  const naechste = grammatik.find((t) => !t.fertig) || null;
  res.json({ bereiche, niveaus, grammatik, naechste: naechste && naechste.key, xp: xpStand(req.user.id),
    kaliplar: SITUATIONEN.length, tipps: TIPPS.length, pruefungen: PRUEFUNGEN.length });
});

// ---------- Wortschatz ----------
const ARTEN = {
  // Deutsches Wort -> Bedeutung auf Tuerkisch
  bedeutung: {
    frage: (w) => ({ text: w.voll, hinweis: "Was bedeutet das?" }),
    antwort: (w) => w.tr,
    optionen: (w, pool) => [w.tr, ...shuffle(pool.filter((x) => x.tr !== w.tr)).slice(0, 3).map((x) => x.tr)],
  },
  // Tuerkisch -> deutsches Wort mit Artikel
  deutsch: {
    frage: (w) => ({ text: w.tr, hinweis: "Wie heißt das auf Deutsch?" }),
    antwort: (w) => w.voll,
    optionen: (w, pool) => [w.voll, ...shuffle(pool.filter((x) => x.voll !== w.voll)).slice(0, 3).map((x) => x.voll)],
  },
  // Artikel: nur fuer Nomen
  artikel: {
    frage: (w) => ({ text: w.wort, hinweis: "der, die oder das?" }),
    antwort: (w) => w.artikel,
    optionen: () => ["der", "die", "das"],
    fest: true,
  },
};
// Luecke im Beispielsatz: das Wort steht dort als Infinitiv, 3. Person oder Partizip.
// Die Ablenker haben dieselbe Form, damit nur die Bedeutung entscheidet.
const nurWort = (x) => x.replace(/\s*\(.*\)$/, "").replace(/^sich /, "");
function formenVon(w) {
  const f = {};
  if (w.verb) {
    const [dritte, perfekt] = w.form.split(" – ");
    f.inf = nurWort(w.wort);
    f.dritte = dritte.split(" ")[0];
    f.partizip = perfekt.split(" ").pop();
  } else {
    f.wort = nurWort(w.wort);
  }
  // Nur einzelne Woerter taugen fuer eine Luecke
  for (const k of Object.keys(f)) if (!/^[\p{L}-]+$/u.test(f[k])) delete f[k];
  return f;
}
const gross = (x) => x.charAt(0).toUpperCase() + x.slice(1);
const LUECKE = new Map();
for (const w of woerter) {
  const f = formenVon(w);
  for (const art of ["wort", "inf", "partizip", "dritte"]) {
    if (!f[art]) continue;
    const m = new RegExp("(^|[^\\p{L}])(" + f[art] + ")(?=[^\\p{L}]|$)", "iu").exec(w.beispiel);
    // "ist" oder "hat" als Luecke lehrt nichts
    if (!m || /^(ist|hat|sein|haben|wird|werden)$/i.test(m[2])) continue;
    const start = m.index + m[1].length;
    LUECKE.set(w.key, {
      art, loesung: m[2],
      satz: w.beispiel.slice(0, start) + "___" + w.beispiel.slice(start + m[2].length),
    });
    break;
  }
}
// Auch reine Pluralwoerter (die Kosten) sind Nomen und gross geschrieben
const klasse = (w) => (w.artikel ? "nomen" : w.verb ? "verb" : "rest");
function lueckeOptionen(w, l) {
  const kandidaten = (nachbarn) => [...new Set(nachbarn
    .filter((x) => x.key !== w.key && klasse(x) === klasse(w))
    .map((x) => formenVon(x)[l.art]).filter(Boolean)
    // Gross am Satzanfang, sonst wie das Wort selbst
    .map((x) => (l.loesung[0] === l.loesung[0].toUpperCase() ? gross(x) : klasse(w) === "nomen" ? x : x.toLowerCase()))
    .filter((x) => x.toLowerCase() !== l.loesung.toLowerCase()))];
  // Aus anderen Themen, sonst passen zwei Antworten (einen Termin verschieben / vereinbaren)
  let pool = kandidaten(woerter.filter((x) => x.bereich === w.bereich && x.thema !== w.thema));
  if (pool.length < 3) pool = kandidaten(woerter.filter((x) => x.thema !== w.thema));
  return [l.loesung, ...shuffle(pool).slice(0, 3)];
}
ARTEN.luecke = {
  frage: (w) => ({ text: LUECKE.get(w.key).satz, hinweis: "Welches Wort passt?" }),
  antwort: (w) => LUECKE.get(w.key).loesung,
  optionen: (w) => lueckeOptionen(w, LUECKE.get(w.key)),
};

const artenFuer = (w) => [
  "bedeutung", "deutsch",
  ...(w.nomen ? ["artikel"] : []),
  ...(LUECKE.has(w.key) ? ["luecke"] : []),
];

function karteFuer(w) {
  return {
    wort: w.voll, form: w.form, tr: w.tr, beispiel: w.beispiel, thema: w.thema, bereich: w.bereich,
    bereichName: BEREICHE[w.bereich].name, niveau: w.niveau, rang: w.rang || null,
  };
}

// Neue Woerter in der Reihenfolge, in der sie gelernt werden sollen:
// zuerst die haeufigen (reihum aus den Themen, das haeufigste zuerst), dazwischen
// ab und zu eins aus Alltag, Beruf und Pruefung; B2 erst, wenn die haeufigen durch sind.
function neueWoerter(alle, s) {
  const neu = alle.filter((w) => !s.has(w.key));
  const haeufig = neu.filter((w) => w.bereich === "haeufig").sort((a, b) => a.rang - b.rang);
  const andere = ["alltag", "beruf", "pruefung", ...(haeufig.length ? [] : ["b2"])]
    .map((b) => neu.filter((w) => w.bereich === b));
  const reihum = [];
  for (let i = 0; andere.some((l) => i < l.length); i++) for (const l of andere) if (l[i]) reihum.push(l[i]);
  const ergebnis = [];
  while (haeufig.length || reihum.length) {
    ergebnis.push(...haeufig.splice(0, 2));
    if (reihum.length) ergebnis.push(reihum.shift());
  }
  return ergebnis;
}

router.get("/karten/next", (req, res) => {
  const bereich = BEREICHE[req.query.bereich] ? req.query.bereich : null;
  const modus = ["faellig", "fehler", "alle"].includes(req.query.modus) ? req.query.modus : "faellig";
  const s = stand(req.user.id);
  const now = jetzt();
  const alle = woerter.filter((w) => !bereich || w.bereich === bereich);

  let pool;
  if (modus === "fehler") {
    // Oefter falsch = oefter dran
    pool = alle.filter((w) => (s.get(w.key)?.wrong_count || 0) > 0)
      .flatMap((w) => Array(Math.min(s.get(w.key).wrong_count, 3)).fill(w));
  } else if (modus === "alle") {
    pool = alle;
  } else {
    // Faellige zuerst; neue Woerter nur in kleinen Portionen dazu, damit es kein Berg wird
    const faellig = alle.filter((w) => s.has(w.key) && istFaellig(s.get(w.key), now));
    const neu = neueWoerter(alle, s).slice(0, faellig.length ? 4 : 8);
    pool = faellig.concat(neu);
  }
  if (!pool.length) {
    return res.json({ frage: null, neu: alle.filter((w) => !s.has(w.key)).length });
  }

  // Nicht zweimal hintereinander dieselbe Karte, solange es andere gibt
  const ohne = String(req.query.ohne || "");
  const auswahl = pool.some((x) => x.key !== ohne) ? pool.filter((x) => x.key !== ohne) : pool;
  const w = pick(auswahl);
  const e = s.get(w.key);
  const moeglich = artenFuer(w);
  // Ein neues Wort zeigt zuerst seine Bedeutung; danach wechseln die Fragearten
  const art = !e ? "bedeutung"
    : e.box > FIRST_BOX && moeglich.includes(e.kind) && Math.random() < 0.5 ? e.kind : pick(moeglich);
  const A = ARTEN[art];
  // Ablenker moeglichst aus demselben Bereich, damit sie plausibel sind
  const nachbarn = woerter.filter((x) => x.key !== w.key && x.bereich === w.bereich);
  res.json({
    frage: {
      itemKey: w.key, art, ...A.frage(w),
      optionen: A.fest ? A.optionen() : shuffle(A.optionen(w, nachbarn)),
      thema: w.thema, bereich: w.bereich, niveau: w.niveau, neu: !e,
    },
    rest: new Set(pool.map((x) => x.key)).size,
  });
});

router.post("/karten/answer", (req, res) => {
  const { itemKey, art, antwort } = req.body || {};
  const w = wortByKey.get(String(itemKey));
  if (!w || !ARTEN[art] || !artenFuer(w).includes(art)) return res.status(400).json({ error: "Ungültige Frage." });
  const richtig = antwort === ARTEN[art].antwort(w);
  const box = speichern(req.user.id, w.key, art, richtig);
  res.json({ richtig, loesung: ARTEN[art].antwort(w), karte: karteFuer(w), ...box });
});

// "Kenne ich schon": ein neues Wort sofort in die letzte Box, damit bekannte
// Grundwoerter nicht wochenlang Zeit kosten. Es kommt in zehn Tagen einmal zur Kontrolle.
router.post("/karten/kenne", (req, res) => {
  const w = wortByKey.get(String((req.body || {}).itemKey));
  if (!w) return res.status(400).json({ error: "Unbekanntes Wort." });
  db.prepare(
    `INSERT INTO trainer_progress (user_id, item_key, box, kind, correct_count, wrong_count, due_at, updated_at)
     VALUES (?, ?, ?, 'bedeutung', 1, 0, datetime('now', ?), datetime('now'))
     ON CONFLICT(user_id, item_key) DO NOTHING`
  ).run(req.user.id, w.key, LAST_BOX, "+" + RUHE_TAGE[LAST_BOX] + " days");
  res.json({ ok: true, karte: karteFuer(w) });
});

// Nachschlagen: alle Woerter mit Lernstand
router.get("/woerter", (req, res) => {
  const s = stand(req.user.id);
  res.json({
    bereiche: Object.entries(BEREICHE).map(([key, b]) => ({ key, name: b.name })),
    niveaus: NIVEAUS,
    woerter: woerter.map((w) => {
      const e = s.get(w.key);
      return {
        key: w.key, ...karteFuer(w), artikel: w.nomen ? w.artikel : "",
        box: boxOf(e), gesehen: Boolean(e), richtig: e ? e.correct_count : 0, falsch: e ? e.wrong_count : 0,
      };
    }),
  });
});

// ---------- Lektion (Konu anlatimi + Uebungen) ----------
router.get("/lektion/:thema", (req, res) => {
  const t = themaByKey.get(req.params.thema);
  if (!t) return res.status(404).json({ error: "Lektion nicht gefunden." });
  const s = stand(req.user.id);
  const i = THEMEN.indexOf(t);
  res.json({
    key: t.key, nr: i + 1, von: THEMEN.length, titel: t.titel, kurz: t.kurz, niveau: t.niveau,
    erklaerung: t.erklaerung, beispiele: t.beispiele, ...LEKTIONEN[t.key],
    gelesen: s.has("de:l:" + t.key),
    uebungen: t.uebungen.map(([satz, optionen], j) => {
      const e = s.get(uebungKey(t.key, j));
      return { i: j, satz, optionen: shuffle(optionen), box: boxOf(e), gemacht: Boolean(e) };
    }),
    vorige: i > 0 ? { key: THEMEN[i - 1].key, titel: THEMEN[i - 1].titel } : null,
    naechste: i < THEMEN.length - 1 ? { key: THEMEN[i + 1].key, titel: THEMEN[i + 1].titel } : null,
  });
});

// Konu anlatimi zu Ende gelesen: einmal Punkte, danach nur noch vermerkt
router.post("/lektion/:thema/gelesen", (req, res) => {
  const t = themaByKey.get(req.params.thema);
  if (!t) return res.status(404).json({ error: "Lektion nicht gefunden." });
  const key = "de:l:" + t.key;
  const neu = !db.prepare("SELECT 1 FROM trainer_progress WHERE user_id = ? AND item_key = ?").get(req.user.id, key);
  if (neu) {
    db.prepare(`INSERT INTO trainer_progress (user_id, item_key, box, kind, correct_count, wrong_count, due_at)
                VALUES (?, ?, 1, 'lektion', 0, 0, NULL)`).run(req.user.id, key);
    xpDazu(req.user.id, XP.gelesen);
  }
  res.json({ ok: true, xp: neu ? XP.gelesen : 0 });
});

router.get("/kaliplar", (req, res) => res.json({ situationen: SITUATIONEN }));
router.get("/tipps", (req, res) => res.json({ tipps: TIPPS }));

// Konu tekrari: gemischte Uebungen aus Themen, die schon angefangen wurden.
// Falsch beantwortete und faellige zuerst.
router.get("/wiederholung", (req, res) => {
  const s = stand(req.user.id);
  const now = jetzt();
  const alle = [];
  for (const t of THEMEN) {
    t.uebungen.forEach(([satz, optionen], i) => {
      const e = s.get(uebungKey(t.key, i));
      if (!e) return;
      const gewicht = (e.wrong_count > 0 ? 3 : 0) + (istFaellig(e, now) ? 2 : 0) + (e.box <= 2 ? 1 : 0);
      alle.push({ thema: t.key, titel: t.titel, i, satz, optionen: shuffle(optionen), gewicht, r: Math.random() });
    });
  }
  alle.sort((a, b) => b.gewicht - a.gewicht || a.r - b.r);
  const auswahl = shuffle(alle.slice(0, 10)).map(({ gewicht, r, ...u }) => u);
  const themen = THEMEN.filter((t) => s.has("de:l:" + t.key) || t.uebungen.some((_, i) => s.has(uebungKey(t.key, i))))
    .map((t) => ({ key: t.key, titel: t.titel, ozet: LEKTIONEN[t.key].ozet }));
  res.json({ uebungen: auswahl, themen });
});

// ---------- Grammatik ----------
router.get("/grammatik/:thema", (req, res) => {
  const t = themaByKey.get(req.params.thema);
  if (!t) return res.status(404).json({ error: "Thema nicht gefunden." });
  const s = stand(req.user.id);
  res.json({
    key: t.key, titel: t.titel, kurz: t.kurz, erklaerung: t.erklaerung, beispiele: t.beispiele,
    uebungen: t.uebungen.map(([satz, optionen], i) => {
      const e = s.get(uebungKey(t.key, i));
      return { i, satz, optionen: shuffle(optionen), box: boxOf(e), gemacht: Boolean(e) };
    }),
  });
});

router.post("/grammatik/answer", (req, res) => {
  const { thema, i, antwort } = req.body || {};
  const t = themaByKey.get(String(thema));
  const u = t && t.uebungen[Number(i)];
  if (!u) return res.status(400).json({ error: "Ungültige Übung." });
  const [, , richtigeAntwort, hinweis] = u;
  const richtig = antwort === richtigeAntwort;
  const box = speichern(req.user.id, uebungKey(t.key, Number(i)), "grammatik", richtig);
  res.json({ richtig, loesung: richtigeAntwort, hinweis, ...box });
});

// ---------- Pruefungssimulation ----------
// Bestanden ist ein Modul wie in der echten Pruefung ab 60 Prozent.
const BESTEHEN = 0.6;
const ergebnisZeile = (r) => r && {
  lesen: r.lesen, lesenMax: r.lesen_max, hoeren: r.hoeren, hoerenMax: r.hoeren_max,
  bestanden: r.lesen >= r.lesen_max * BESTEHEN && r.hoeren >= r.hoeren_max * BESTEHEN,
  sekunden: r.sekunden, datum: r.created_at,
};

router.get("/pruefungen", (req, res) => {
  const rows = db.prepare("SELECT * FROM deutsch_pruefung WHERE user_id = ? ORDER BY id DESC").all(req.user.id);
  res.json({
    pruefungen: PRUEFUNGEN.map((p) => {
      const meine = rows.filter((r) => r.test === p.key);
      const beste = meine.slice().sort((a, b) => (b.lesen + b.hoeren) - (a.lesen + a.hoeren))[0];
      return {
        key: p.key, niveau: p.niveau, titel: p.titel, thema: p.thema, minuten: p.minuten,
        fragen: p.teile.reduce((n, t) => n + t.fragen.length, 0),
        teile: p.teile.map((t) => ({ id: t.id, modul: t.modul, titel: t.titel })),
        versuche: meine.length, letztes: ergebnisZeile(meine[0]), bestes: ergebnisZeile(beste),
      };
    }),
  });
});

// Der Test ohne Loesungen und Erklaerungen. Die Hoertexte muessen mit, weil der Browser vorliest.
router.get("/pruefungen/:key", (req, res) => {
  const p = pruefungByKey.get(req.params.key);
  if (!p) return res.status(404).json({ error: "Test nicht gefunden." });
  res.json({
    key: p.key, niveau: p.niveau, titel: p.titel, thema: p.thema, minuten: p.minuten,
    teile: p.teile.map(({ fragen, ...t }) => ({
      ...t,
      fragen: fragen.map(({ loesung, erklaerung, ...f }) => f),
    })),
  });
});

router.post("/pruefungen/:key/abgabe", (req, res) => {
  const p = pruefungByKey.get(req.params.key);
  if (!p) return res.status(404).json({ error: "Test nicht gefunden." });
  const antworten = (req.body && typeof req.body.antworten === "object" && req.body.antworten) || {};
  const sekunden = Math.max(0, Math.min(6 * 3600, Math.round(Number(req.body?.sekunden) || 0)));
  const punkte = { lesen: 0, lesenMax: 0, hoeren: 0, hoerenMax: 0 };
  const auswertung = {};
  for (const t of p.teile) {
    for (const f of t.fragen) {
      const a = antworten[f.id];
      const richtig = a !== undefined && a !== null && a === f.loesung;
      punkte[t.modul + "Max"] += 1;
      if (richtig) punkte[t.modul] += 1;
      auswertung[f.id] = { richtig, antwort: a ?? null, loesung: f.loesung, erklaerung: f.erklaerung };
    }
  }
  const sauber = Object.fromEntries(Object.entries(auswertung).map(([id, x]) => [id, x.antwort]));
  db.prepare(`INSERT INTO deutsch_pruefung (user_id, test, lesen, lesen_max, hoeren, hoeren_max, sekunden, antworten)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(req.user.id, p.key, punkte.lesen, punkte.lesenMax, punkte.hoeren, punkte.hoerenMax, sekunden, JSON.stringify(sauber));
  // Zwei Punkte je richtige Antwort, damit ein ganzer Test ungefaehr ein Tagesziel ist
  const xp = (punkte.lesen + punkte.hoeren) * 2;
  if (xp) xpDazu(req.user.id, xp);
  res.json({
    ...punkte, xp,
    bestanden: { lesen: punkte.lesen >= punkte.lesenMax * BESTEHEN, hoeren: punkte.hoeren >= punkte.hoerenMax * BESTEHEN },
    auswertung,
  });
});

module.exports = router;
