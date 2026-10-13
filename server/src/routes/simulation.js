const fs = require("fs");
const path = require("path");
const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { buildings } = require("../bauwerke");
const { kindsFor, bauwerkFrage, pick } = require("../trainerfragen");
const { pairs, labelFor } = require("../vergleiche");

const router = express.Router();
router.use(requireAuth);

const epochen = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "..", "data", "epochen.json"), "utf8")
);

const LAENGEN = [20, 30, 40];
const STANDARD = 30;

// Roughly what the exam asks about: mostly buildings, then the comparisons,
// then placing the epochs in time.
const MISCHUNG = { bauwerk: 0.6, vergleich: 0.25, epoche: 0.15 };

const mischen = (list) => [...list].sort(() => Math.random() - 0.5);
const epochRange = (e) => (e.bis === null ? `ab ${e.von}` : `${e.von}–${e.bis}`);

function bauwerkFragen(anzahl) {
  const brauchbar = buildings.filter((b) => kindsFor(b).length > 0);

  // Taking a random kind per building makes "which building is this?" the
  // question for every card that has little else recorded, so the kinds are
  // dealt out in turn instead.
  let zaehler = 0;

  return mischen(brauchbar)
    .slice(0, anzahl)
    .map((building) => {
      const moeglich = kindsFor(building);
      const kindName = moeglich[zaehler++ % moeglich.length];
      const { correct, hint, ...frage } = bauwerkFrage(building, kindName);
      return { art: "Bauwerk", ...frage, correct };
    });
}

function vergleichFragen(anzahl) {
  const frage = (pair, aussage) => ({
    art: "Vergleich",
    text: `${pair.a.name} oder ${pair.b.name}? ${aussage.text}`,
    image: null,
    options: mischen([labelFor(pair, "a"), labelFor(pair, "b"), "Beide"]),
    correct: labelFor(pair, aussage.gilt),
  });

  // One statement from each pairing in turn, so a round covers as many
  // pairings as it has questions instead of emptying the first one.
  const vorrat = mischen(pairs).map((pair) => ({ pair, offen: mischen(pair.aussagen) }));
  const fragen = [];

  while (fragen.length < anzahl && vorrat.some((eintrag) => eintrag.offen.length > 0)) {
    for (const eintrag of vorrat) {
      if (fragen.length >= anzahl) break;
      const aussage = eintrag.offen.pop();
      if (aussage) fragen.push(frage(eintrag.pair, aussage));
    }
  }

  return fragen;
}

function epochenFragen(anzahl) {
  const bereiche = epochen.map(epochRange);

  return mischen(epochen)
    .slice(0, anzahl)
    .map((epoch) => {
      const correct = epochRange(epoch);
      const options = mischen([
        correct,
        ...mischen(bereiche.filter((b) => b !== correct)).slice(0, 3),
      ]);
      return {
        art: "Epoche",
        text: `In welchen Zeitraum fällt die Epoche „${epoch.epoche}"?`,
        image: null,
        options,
        correct,
      };
    });
}

function fragenBauen(laenge) {
  const bauwerke = Math.round(laenge * MISCHUNG.bauwerk);
  const vergleiche = Math.round(laenge * MISCHUNG.vergleich);
  const epochenAnzahl = laenge - bauwerke - vergleiche;

  return mischen([
    ...bauwerkFragen(bauwerke),
    ...vergleichFragen(vergleiche),
    ...epochenFragen(epochenAnzahl),
  ]);
}

router.post("/start", (req, res) => {
  const gewuenscht = Number(req.body?.laenge);
  const laenge = LAENGEN.includes(gewuenscht) ? gewuenscht : STANDARD;

  const fragen = fragenBauen(laenge);

  const id = db
    .prepare(
      "INSERT INTO simulation_runs (user_id, total, questions) VALUES (?, ?, ?)"
    )
    .run(req.user.id, fragen.length, JSON.stringify(fragen)).lastInsertRowid;

  res.json({
    id: Number(id),
    total: fragen.length,
    // The answers stay on the server until the round is handed in.
    fragen: fragen.map(({ correct, ...frage }, index) => ({ nr: index + 1, ...frage })),
  });
});

router.post("/:id/abgeben", (req, res) => {
  const lauf = db
    .prepare("SELECT * FROM simulation_runs WHERE id = ? AND user_id = ?")
    .get(Number(req.params.id), req.user.id);

  if (!lauf) return res.status(404).json({ error: "Durchlauf nicht gefunden." });
  if (lauf.finished_at) return res.status(400).json({ error: "Schon abgegeben." });

  const fragen = JSON.parse(lauf.questions);
  const antworten = Array.isArray(req.body?.antworten) ? req.body.antworten : [];

  const ergebnis = fragen.map((frage, index) => ({
    nr: index + 1,
    art: frage.art,
    text: frage.text,
    image: frage.image,
    deine: antworten[index] ?? null,
    richtig: frage.correct,
    korrekt: antworten[index] === frage.correct,
  }));

  const korrekt = ergebnis.filter((zeile) => zeile.korrekt).length;
  const sekunden = Math.max(
    0,
    Math.round((Date.now() - new Date(`${lauf.started_at}Z`).getTime()) / 1000)
  );

  db.prepare(
    `UPDATE simulation_runs
     SET finished_at = datetime('now'), correct = ?, seconds = ?
     WHERE id = ?`
  ).run(korrekt, sekunden, lauf.id);

  res.json({ richtig: korrekt, total: fragen.length, sekunden, fragen: ergebnis });
});

router.get("/verlauf", (req, res) => {
  const laeufe = db
    .prepare(
      `SELECT id, finished_at, total, correct, seconds
       FROM simulation_runs
       WHERE user_id = ? AND finished_at IS NOT NULL
       ORDER BY id DESC LIMIT 10`
    )
    .all(req.user.id);

  res.json({ laeufe, laengen: LAENGEN });
});

module.exports = router;
