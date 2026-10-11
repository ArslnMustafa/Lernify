const fs = require("fs");
const path = require("path");
const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const { baseBuildings } = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "..", "data", "baugeschichte.json"), "utf8")
);

const buildings = baseBuildings.map((b, i) => ({ ...b, key: String(i) }));
const byKey = new Map(buildings.map((b) => [b.key, b]));

// Leitner boxes: a correct answer promotes one box, a wrong answer sends it back to the start.
const FIRST_BOX = 1;
const LAST_BOX = 3;

const KINDS = {
  architect: {
    question: (b) => `Wer ist der Architekt des Bauwerks "${b.name}" (${b.location})?`,
    answer: (b) => b.architect,
  },
  name: {
    question: () => "Welches Bauwerk ist auf dem Bild zu sehen?",
    answer: (b) => `${b.name} (${b.location})`,
  },
  year: {
    question: (b) => `In welchem Zeitraum wurde "${b.name}" errichtet?`,
    answer: (b) => b.year,
  },
};

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function boxesFor(userId) {
  const rows = db
    .prepare("SELECT item_key, box FROM trainer_progress WHERE user_id = ?")
    .all(userId);
  return new Map(rows.map((row) => [row.item_key, row.box]));
}

function poolFor(userId, box) {
  const boxes = boxesFor(userId);
  return buildings.filter((b) => (boxes.get(b.key) ?? FIRST_BOX) === box);
}

router.get("/stats", (req, res) => {
  const boxes = boxesFor(req.user.id);
  const counts = { 1: 0, 2: 0, 3: 0 };
  for (const b of buildings) counts[boxes.get(b.key) ?? FIRST_BOX] += 1;
  res.json({ counts, total: buildings.length });
});

router.get("/next", (req, res) => {
  const box = Number(req.query.box) || FIRST_BOX;
  const pool = poolFor(req.user.id, box);

  if (pool.length === 0) {
    return res.json({ question: null });
  }

  const building = pick(pool);
  const kindName = pick(Object.keys(KINDS));
  const kind = KINDS[kindName];
  const correct = kind.answer(building);

  const distractors = [];
  const seen = new Set([correct]);
  while (distractors.length < 3 && seen.size < buildings.length) {
    const candidate = kind.answer(pick(buildings));
    if (!seen.has(candidate)) {
      seen.add(candidate);
      distractors.push(candidate);
    }
  }

  const options = [correct, ...distractors].sort(() => Math.random() - 0.5);

  res.json({
    question: {
      itemKey: building.key,
      kind: kindName,
      text: kind.question(building),
      image: building.image,
      options,
    },
    remaining: pool.length,
  });
});

router.post("/answer", (req, res) => {
  const { itemKey, kind, answer } = req.body || {};
  const building = byKey.get(String(itemKey));

  if (!building || !KINDS[kind]) {
    return res.status(400).json({ error: "Ungültige Frage." });
  }

  const correctAnswer = KINDS[kind].answer(building);
  const isCorrect = answer === correctAnswer;

  const current = db
    .prepare("SELECT box FROM trainer_progress WHERE user_id = ? AND item_key = ?")
    .get(req.user.id, building.key);
  const box = current ? current.box : FIRST_BOX;
  const nextBox = isCorrect ? Math.min(box + 1, LAST_BOX) : FIRST_BOX;

  db.prepare(
    `INSERT INTO trainer_progress (user_id, item_key, box, correct_count, wrong_count, updated_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(user_id, item_key) DO UPDATE SET
       box = excluded.box,
       correct_count = correct_count + excluded.correct_count,
       wrong_count = wrong_count + excluded.wrong_count,
       updated_at = datetime('now')`
  ).run(req.user.id, building.key, nextBox, isCorrect ? 1 : 0, isCorrect ? 0 : 1);

  res.json({ correct: isCorrect, correctAnswer, fromBox: box, toBox: nextBox });
});

module.exports = router;
