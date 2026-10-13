const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { buildings, byKey } = require("../bauwerke");

const router = express.Router();
router.use(requireAuth);

// Leitner boxes: a correct answer promotes one box, a wrong answer sends it back to the start.
const FIRST_BOX = 1;
const LAST_BOX = 3;

const label = (b) => (b.location ? `${b.name} (${b.location})` : b.name);

const KINDS = {
  architect: {
    question: (b) => `Wer ist der Architekt des Bauwerks "${label(b)}"?`,
    answer: (b) => b.architect,
  },
  name: {
    question: () => "Welches Bauwerk ist auf dem Bild zu sehen?",
    answer: label,
    needsImage: true,
  },
  year: {
    question: (b) => `In welchem Zeitraum wurde "${b.name}" errichtet?`,
    answer: (b) => b.year,
  },
  description: {
    question: (b) => `Welches Bauwerk wird so beschrieben: „${b.bildmerkmale}"?`,
    answer: label,
  },
};

const KIND_NAMES = Object.keys(KINDS);

// A card can only be asked about what the sources actually record.
function kindsFor(building) {
  return KIND_NAMES.filter((name) => {
    const kind = KINDS[name];
    if (kind.needsImage && !building.image) return false;
    if (name === "description" && !building.bildmerkmale) return false;
    return Boolean(kind.answer(building));
  });
}

function startYear(value) {
  const match = String(value).match(/\d{4}/);
  return match ? Number(match[0]) : null;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Years are only a real question when the options sit close together, otherwise
// the century alone gives it away.
function yearDistractors(correct) {
  const target = startYear(correct);
  const others = [...new Set(buildings.map((b) => b.year).filter(Boolean))].filter(
    (y) => y !== correct
  );

  if (target === null) return others.slice(0, 3);

  const nearest = others
    .map((year) => ({ year, distance: Math.abs((startYear(year) ?? 9999) - target) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 8)
    .map((entry) => entry.year);

  const chosen = [];
  while (chosen.length < 3 && nearest.length > 0) {
    chosen.push(nearest.splice(Math.floor(Math.random() * nearest.length), 1)[0]);
  }
  return chosen;
}

function distractorsFor(kindName, correct) {
  if (kindName === "year") return yearDistractors(correct);

  const answer = KINDS[kindName].answer;
  const others = [...new Set(buildings.map(answer).filter(Boolean))].filter(
    (value) => value !== correct
  );

  const chosen = [];
  while (chosen.length < 3 && others.length > 0) {
    chosen.push(others.splice(Math.floor(Math.random() * others.length), 1)[0]);
  }
  return chosen;
}

// A hint says something about the building that is not the answer: it should
// narrow the field, not give the answer away.
const FACTS = [
  ["architect", (b) => b.architect && `Architekt: ${b.architect}`],
  ["year", (b) => b.year && `Zeitraum: ${b.year}`],
  ["location", (b) => b.location && `Ort: ${b.location}`],
  // Handout cards carry their lecture chapter where a catalogue building
  // carries its style, and "II-5 - Wohnen für das Existenzminimum" is a topic.
  [
    "style",
    (b) =>
      b.style &&
      (/^II-\d+\s*-\s*/.test(b.style)
        ? `Thema: ${b.style.replace(/^II-\d+\s*-\s*/, "")}`
        : `Stil: ${b.style}`),
  ],
  ["merkmal", (b) => b.bildmerkmale && `Merkmal: ${b.bildmerkmale}`],
];

// What each question already asks for, or already says.
const GIVES_AWAY = {
  architect: ["architect"],
  year: ["year"],
  name: ["location"], // the answer is "Name (Ort)"
  description: ["location", "merkmal"],
};

function hintsFor(building, kindName, correct) {
  const forbidden = new Set(GIVES_AWAY[kindName] || []);

  const secrets = [String(correct).toLowerCase()];
  if (kindName === "name" || kindName === "description") {
    secrets.push(building.name.toLowerCase());
  }

  return FACTS.filter(([id]) => !forbidden.has(id))
    .map(([, fact]) => fact(building))
    .filter(Boolean)
    .filter((text) => !secrets.some((secret) => text.toLowerCase().includes(secret)))
    .slice(0, 3);
}

function progressFor(userId) {
  const rows = db
    .prepare("SELECT item_key, box, kind FROM trainer_progress WHERE user_id = ?")
    .all(userId);
  return new Map(rows.map((row) => [row.item_key, row]));
}

router.get("/stats", (req, res) => {
  const progress = progressFor(req.user.id);
  const counts = { 1: 0, 2: 0, 3: 0 };
  for (const b of buildings) counts[progress.get(b.key)?.box ?? FIRST_BOX] += 1;
  res.json({ counts, total: buildings.length });
});

router.get("/next", (req, res) => {
  const box = Number(req.query.box) || FIRST_BOX;
  const progress = progressFor(req.user.id);
  const pool = buildings.filter((b) => (progress.get(b.key)?.box ?? FIRST_BOX) === box);

  if (pool.length === 0) {
    return res.json({ question: null });
  }

  const building = pick(pool);
  const available = kindsFor(building);

  // A promoted card keeps the question it was learned with; new ones are random.
  const stored = progress.get(building.key)?.kind;
  const kindName =
    box !== FIRST_BOX && available.includes(stored) ? stored : pick(available);

  const correct = KINDS[kindName].answer(building);
  const options = [correct, ...distractorsFor(kindName, correct)].sort(
    () => Math.random() - 0.5
  );

  res.json({
    question: {
      itemKey: building.key,
      kind: kindName,
      text: KINDS[kindName].question(building),
      image: building.image,
      hint: hintsFor(building, kindName, correct),
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
    `INSERT INTO trainer_progress (user_id, item_key, box, kind, correct_count, wrong_count, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(user_id, item_key) DO UPDATE SET
       box = excluded.box,
       kind = excluded.kind,
       correct_count = correct_count + excluded.correct_count,
       wrong_count = wrong_count + excluded.wrong_count,
       updated_at = datetime('now')`
  ).run(req.user.id, building.key, nextBox, kind, isCorrect ? 1 : 0, isCorrect ? 0 : 1);

  res.json({ correct: isCorrect, correctAnswer, fromBox: box, toBox: nextBox });
});

module.exports = router;
