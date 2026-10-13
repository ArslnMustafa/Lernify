const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { hashPassword, verifyPassword } = require("../password");
const { buildings, byKey, aendern, FELDER, normalise } = require("../bauwerke");

const router = express.Router();
router.use(requireAuth);

const kurz = (b) => ({
  key: b.key,
  name: b.name,
  location: b.location || "",
  architect: b.architect || "",
  year: b.year || "",
  style: b.style || "",
  image: b.image || "",
  bildmerkmale: b.bildmerkmale || "",
  herkunft: b.key.startsWith("rb") ? "Rückblick-Karte" : "Katalog",
});

router.get("/bauwerke", (req, res) => {
  const suche = normalise(String(req.query.suche || ""));

  const treffer = buildings
    .filter((b) => !suche || normalise(`${b.name} ${b.location || ""} ${b.architect || ""}`).includes(suche))
    .slice(0, 40)
    .map(kurz);

  res.json({ bauwerke: treffer, gesamt: buildings.length });
});

router.post("/bauwerk", (req, res) => {
  const { key, ...felder } = req.body || {};
  if (!byKey.has(String(key))) {
    return res.status(404).json({ error: "Bauwerk nicht gefunden." });
  }

  const erlaubt = Object.fromEntries(
    Object.entries(felder).filter(([feld]) => FELDER.includes(feld))
  );

  if (Object.keys(erlaubt).length === 0) {
    return res.status(400).json({ error: "Nichts zu ändern." });
  }

  const bauwerk = aendern(key, erlaubt);
  res.json({ bauwerk: kurz(bauwerk) });
});

// Everything a reset can clear, and what it would cost.
const BEREICHE = {
  training: {
    titel: "Trainingsfortschritt",
    zaehlen: (userId) =>
      db.prepare("SELECT COUNT(*) AS n FROM trainer_progress WHERE user_id = ?").get(userId).n,
    loeschen: (userId) =>
      db.prepare("DELETE FROM trainer_progress WHERE user_id = ?").run(userId),
  },
  simulation: {
    titel: "Simulationsdurchläufe",
    zaehlen: (userId) =>
      db.prepare("SELECT COUNT(*) AS n FROM simulation_runs WHERE user_id = ?").get(userId).n,
    loeschen: (userId) =>
      db.prepare("DELETE FROM simulation_runs WHERE user_id = ?").run(userId),
  },
};

router.get("/fortschritt", (req, res) => {
  res.json({
    bereiche: Object.entries(BEREICHE).map(([id, bereich]) => ({
      id,
      titel: bereich.titel,
      anzahl: bereich.zaehlen(req.user.id),
    })),
  });
});

router.post("/fortschritt/zuruecksetzen", (req, res) => {
  const bereich = BEREICHE[String(req.body?.bereich)];
  if (!bereich) return res.status(400).json({ error: "Unbekannter Bereich." });

  // Only ever the person's own progress.
  const vorher = bereich.zaehlen(req.user.id);
  bereich.loeschen(req.user.id);

  res.json({ geloescht: vorher });
});

router.post("/pin", (req, res) => {
  const alt = String(req.body?.alt || "");
  const neu = String(req.body?.neu || "");

  if (neu.length < 4) {
    return res.status(400).json({ error: "Die neue PIN braucht mindestens vier Zeichen." });
  }

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!verifyPassword(alt, user.password_hash, user.password_salt)) {
    return res.status(401).json({ error: "Die alte PIN stimmt nicht." });
  }

  const { hash, salt } = hashPassword(neu);
  db.prepare("UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?").run(
    hash,
    salt,
    user.id
  );

  res.json({ ok: true });
});

module.exports = router;
