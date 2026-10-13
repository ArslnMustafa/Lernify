const fs = require("fs");
const path = require("path");
const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { find } = require("../bauwerke");

const router = express.Router();
router.use(requireAuth);

const karten = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "..", "data", "rueckblicke.json"), "utf8")
);

// The exam wants four kinds of statement about a building, and the handout's
// model answer is written in exactly those four parts. Checking them off one
// by one turns "ich hatte es ungefähr" into a number — and shows which of the
// four is the one that keeps getting left out.
const BAUSTEINE = [
  { id: "bildmerkmale", titel: "Bildmerkmale", frage: "Was ist am Bau zu sehen?" },
  { id: "form", titel: "Form / Raum", frage: "Baukörper, Grundriss, Raumwirkung?" },
  { id: "konstruktion", titel: "Konstruktion / Wirkung", frage: "Wie ist es gebaut, was bewirkt das?" },
  { id: "einordnung", titel: "Einordnung", frage: "Wo steht der Bau in der Baugeschichte?" },
];

const byKey = new Map(karten.map((karte) => [karte.name, karte]));

function kurz(karte) {
  const bauwerk = find(karte.name);
  return {
    key: karte.name,
    name: karte.name,
    meta: karte.meta,
    thema: karte.thema,
    altklausur: karte.altklausur,
    image: bauwerk?.image || null,
  };
}

// The card that is most worth writing: one never written before, then the one
// that scored worst, oldest first.
function naechsteKarte(userId) {
  const letzte = new Map();
  const rows = db
    .prepare(
      `SELECT item_key, punkte, von, created_at
       FROM schreib_antworten WHERE user_id = ? ORDER BY id`
    )
    .all(userId);

  for (const row of rows) letzte.set(row.item_key, row);

  const ungeschrieben = karten.filter((karte) => !letzte.has(karte.name));
  if (ungeschrieben.length > 0) {
    return ungeschrieben[Math.floor(Math.random() * ungeschrieben.length)];
  }

  const sortiert = [...karten].sort((a, b) => {
    const x = letzte.get(a.name);
    const y = letzte.get(b.name);
    const quoteX = x.punkte / x.von;
    const quoteY = y.punkte / y.von;
    if (quoteX !== quoteY) return quoteX - quoteY;
    return x.created_at.localeCompare(y.created_at);
  });

  // A little room so the same card is not served twice in a row.
  return sortiert[Math.floor(Math.random() * Math.min(5, sortiert.length))];
}

router.get("/naechste", (req, res) => {
  const karte = naechsteKarte(req.user.id);
  const geschrieben = db
    .prepare("SELECT COUNT(DISTINCT item_key) AS n FROM schreib_antworten WHERE user_id = ?")
    .get(req.user.id).n;

  res.json({
    karte: kurz(karte),
    bausteine: BAUSTEINE.map(({ id, titel, frage }) => ({ id, titel, frage })),
    geschrieben,
    gesamt: karten.length,
  });
});

// The model answer only arrives once it is asked for, so writing comes first.
router.get("/:key/loesung", (req, res) => {
  const karte = byKey.get(req.params.key);
  if (!karte) return res.status(404).json({ error: "Karte nicht gefunden." });

  res.json({
    loesung: BAUSTEINE.map((baustein) => ({
      id: baustein.id,
      titel: baustein.titel,
      text: karte[baustein.id],
    })),
  });
});

router.post("/bewerten", (req, res) => {
  const karte = byKey.get(String(req.body?.key));
  if (!karte) return res.status(400).json({ error: "Karte nicht gefunden." });

  const gueltig = new Set(BAUSTEINE.map((baustein) => baustein.id));
  const treffer = [...new Set(req.body?.treffer || [])].filter((id) => gueltig.has(id));

  db.prepare(
    `INSERT INTO schreib_antworten (user_id, item_key, treffer, punkte, von)
     VALUES (?, ?, ?, ?, ?)`
  ).run(req.user.id, karte.name, JSON.stringify(treffer), treffer.length, BAUSTEINE.length);

  res.json({ punkte: treffer.length, von: BAUSTEINE.length });
});

router.get("/statistik", (req, res) => {
  const rows = db
    .prepare("SELECT item_key, treffer, punkte, von, created_at FROM schreib_antworten WHERE user_id = ?")
    .all(req.user.id);

  const proBaustein = Object.fromEntries(BAUSTEINE.map((b) => [b.id, 0]));
  let punkte = 0;
  let moeglich = 0;

  for (const row of rows) {
    for (const id of JSON.parse(row.treffer)) {
      if (id in proBaustein) proBaustein[id] += 1;
    }
    punkte += row.punkte;
    moeglich += row.von;
  }

  const bausteine = BAUSTEINE.map((baustein) => ({
    id: baustein.id,
    titel: baustein.titel,
    treffer: proBaustein[baustein.id],
    versuche: rows.length,
    quote: rows.length ? proBaustein[baustein.id] / rows.length : 0,
  })).sort((a, b) => a.quote - b.quote);

  res.json({
    versuche: rows.length,
    karten: new Set(rows.map((row) => row.item_key)).size,
    gesamt: karten.length,
    schnitt: moeglich ? punkte / moeglich : 0,
    bausteine,
    letzte: rows
      .slice(-8)
      .reverse()
      .map((row) => ({ karte: row.item_key, punkte: row.punkte, von: row.von, wann: row.created_at })),
  });
});

module.exports = router;
