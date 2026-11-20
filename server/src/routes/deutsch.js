// Deutsch fuer Mustafa: Wortschatz-Karten und Grammatik, mit demselben
// Karteikasten wie der Baugeschichte-Trainer (Tabelle trainer_progress,
// Schluessel mit "de:" davor, damit sich beides nie in die Quere kommt).
const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { hatDeutsch } = require("../config");
const { woerter, byKey: wortByKey, BEREICHE } = require("../deutsch/wortschatz");
const { THEMEN, byKey: themaByKey, uebungKey } = require("../deutsch/grammatik");

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
  return { fromBox: box, toBox: next, wiederIn: RUHE_TAGE[next] || 0 };
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
  const grammatik = THEMEN.map((t) => {
    const keys = t.uebungen.map((_, i) => uebungKey(t.key, i));
    return {
      key: t.key, titel: t.titel, kurz: t.kurz, uebungen: keys.length,
      gemacht: keys.filter((k) => s.has(k)).length,
      sicher: keys.filter((k) => boxOf(s.get(k)) >= 2).length,
    };
  });
  res.json({ bereiche, grammatik });
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
const artenFuer = (w) => (w.nomen ? ["bedeutung", "deutsch", "artikel"] : ["bedeutung", "deutsch"]);

function karteFuer(w) {
  return { wort: w.voll, form: w.form, tr: w.tr, beispiel: w.beispiel, thema: w.thema, bereich: w.bereich };
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
    // Neue Woerter abwechselnd aus den Bereichen, nicht alle aus dem ersten
    const proBereich = Object.keys(BEREICHE).map((b) => alle.filter((w) => w.bereich === b && !s.has(w.key)));
    const neu = [];
    for (let i = 0; neu.length < 10 && proBereich.some((l) => i < l.length); i++) {
      for (const l of proBereich) if (l[i] && neu.length < 10) neu.push(l[i]);
    }
    pool = faellig.length ? faellig.concat(neu.slice(0, 5)) : neu;
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
  const art = e && e.box > FIRST_BOX && moeglich.includes(e.kind) ? e.kind : pick(moeglich);
  const A = ARTEN[art];
  // Ablenker moeglichst aus demselben Bereich, damit sie plausibel sind
  const nachbarn = woerter.filter((x) => x.key !== w.key && x.bereich === w.bereich);
  res.json({
    frage: {
      itemKey: w.key, art, ...A.frage(w),
      optionen: A.fest ? A.optionen() : shuffle(A.optionen(w, nachbarn)),
      thema: w.thema, bereich: w.bereich, neu: !e,
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

// Nachschlagen: alle Woerter eines Bereichs mit Lernstand
router.get("/woerter", (req, res) => {
  const s = stand(req.user.id);
  const bereich = BEREICHE[req.query.bereich] ? req.query.bereich : null;
  res.json({
    woerter: woerter.filter((w) => !bereich || w.bereich === bereich)
      .map((w) => ({ key: w.key, ...karteFuer(w), box: boxOf(s.get(w.key)), gesehen: s.has(w.key) })),
  });
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

module.exports = router;
