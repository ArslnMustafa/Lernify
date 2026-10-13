const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { buildings, byKey } = require("../bauwerke");
const { KINDS, kindsFor, bauwerkFrage, pick } = require("../trainerfragen");

const router = express.Router();
router.use(requireAuth);

// Leitner boxes: a correct answer promotes one box, a wrong answer sends it back to the start.
const FIRST_BOX = 1;
const LAST_BOX = 3;

// How long a card rests before it is worth asking again. Without this a card
// in the last box would never come back, which is how things are forgotten
// between the day they are learned and the exam.
const RUHE_TAGE = { 1: 0, 2: 2, 3: 7 };

function progressFor(userId) {
  const rows = db
    .prepare(
      `SELECT item_key, box, kind, correct_count, wrong_count, due_at
       FROM trainer_progress WHERE user_id = ?`
    )
    .all(userId);
  return new Map(rows.map((row) => [row.item_key, row]));
}

// SQLite writes and compares its own timestamps, so the clock comes from there.
const jetzt = () => db.prepare("SELECT datetime('now') AS jetzt").get().jetzt;

const boxOf = (entry) => entry?.box ?? FIRST_BOX;
const istFaellig = (entry, now) => !entry?.due_at || entry.due_at <= now;
const fehlerZahl = (entry) => entry?.wrong_count ?? 0;

// A handout card carries its lecture chapter where a catalogue building
// carries its architectural style; both work as a topic to be weak in.
const themaOf = (building) => building.style || "Ohne Thema";
const themaLabel = (thema) => thema.replace(/^II-\d+\s*-\s*/, "");

router.get("/stats", (req, res) => {
  const progress = progressFor(req.user.id);
  const now = jetzt();

  const counts = { 1: 0, 2: 0, 3: 0 };
  let faellig = 0;
  let fehler = 0;

  // Right and wrong per topic, which is what says where the gaps are.
  const themen = new Map();

  for (const building of buildings) {
    const entry = progress.get(building.key);
    counts[boxOf(entry)] += 1;
    if (istFaellig(entry, now)) faellig += 1;
    if (fehlerZahl(entry) > 0) fehler += 1;

    const thema = themaOf(building);
    const zeile = themen.get(thema) || { thema: themaLabel(thema), richtig: 0, falsch: 0 };
    zeile.richtig += entry?.correct_count ?? 0;
    zeile.falsch += fehlerZahl(entry);
    themen.set(thema, zeile);
  }

  // Only topics that were actually practised say anything; weakest first.
  const schwach = [...themen.values()]
    .filter((zeile) => zeile.richtig + zeile.falsch >= 3)
    .map((zeile) => ({ ...zeile, quote: zeile.richtig / (zeile.richtig + zeile.falsch) }))
    .sort((a, b) => a.quote - b.quote)
    .slice(0, 10); // a list to act on, not a full table

  res.json({ counts, total: buildings.length, faellig, fehler, themen: schwach });
});

// Three ways to practise: a box, everything that is due, or the cards that
// have gone wrong before.
function poolFor(modus, box, progress, now) {
  if (modus === "faellig") {
    return buildings.filter((b) => istFaellig(progress.get(b.key), now));
  }

  if (modus === "fehler") {
    const falsch = buildings.filter((b) => fehlerZahl(progress.get(b.key)) > 0);
    // The ones that went wrong most often come up most often.
    return falsch.flatMap((b) =>
      Array(Math.min(fehlerZahl(progress.get(b.key)), 3)).fill(b)
    );
  }

  const imKasten = buildings.filter((b) => boxOf(progress.get(b.key)) === box);
  const faellig = imKasten.filter((b) => istFaellig(progress.get(b.key), now));

  // Due cards first, but practising ahead is never blocked.
  return faellig.length > 0 ? faellig : imKasten;
}

router.get("/next", (req, res) => {
  const modus = req.query.modus === "faellig" || req.query.modus === "fehler"
    ? req.query.modus
    : null;
  const box = Number(req.query.box) || FIRST_BOX;
  const progress = progressFor(req.user.id);
  const now = jetzt();

  const pool = poolFor(modus, box, progress, now);

  if (pool.length === 0) {
    return res.json({ question: null });
  }

  const building = pick(pool);
  const available = kindsFor(building);

  // A promoted card keeps the question it was learned with; new ones are random.
  const stored = progress.get(building.key)?.kind;
  const kindName =
    boxOf(progress.get(building.key)) !== FIRST_BOX && available.includes(stored)
      ? stored
      : pick(available);

  const { correct, ...frage } = bauwerkFrage(building, kindName);

  res.json({
    question: { itemKey: building.key, kind: kindName, ...frage },
    remaining: new Set(pool.map((b) => b.key)).size,
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

  // A card that was just answered rests for as long as its new box says.
  const ruhe = `+${RUHE_TAGE[nextBox] ?? 0} days`;

  db.prepare(
    `INSERT INTO trainer_progress (user_id, item_key, box, kind, correct_count, wrong_count, due_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now', ?), datetime('now'))
     ON CONFLICT(user_id, item_key) DO UPDATE SET
       box = excluded.box,
       kind = excluded.kind,
       correct_count = correct_count + excluded.correct_count,
       wrong_count = wrong_count + excluded.wrong_count,
       due_at = excluded.due_at,
       updated_at = datetime('now')`
  ).run(req.user.id, building.key, nextBox, kind, isCorrect ? 1 : 0, isCorrect ? 0 : 1, ruhe);

  res.json({
    correct: isCorrect,
    correctAnswer,
    fromBox: box,
    toBox: nextBox,
    wiederIn: RUHE_TAGE[nextBox] ?? 0,
  });
});

module.exports = router;
