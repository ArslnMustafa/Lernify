const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function assertAssigned(examId, userId) {
  return db
    .prepare(
      "SELECT 1 FROM exam_assignments WHERE exam_id = ? AND user_id = ?"
    )
    .get(examId, userId);
}

router.get("/", (req, res) => {
  const exams = db
    .prepare(
      `SELECT e.id, e.title, e.description,
              (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) AS question_count,
              (SELECT MAX(score) FROM attempts a WHERE a.exam_id = e.id AND a.user_id = ?) AS best_score
       FROM exams e
       JOIN exam_assignments ea ON ea.exam_id = e.id
       WHERE ea.user_id = ?
       ORDER BY e.id`
    )
    .all(req.user.id, req.user.id);

  res.json({ exams });
});

router.get("/:id", (req, res) => {
  const examId = Number(req.params.id);

  if (!assertAssigned(examId, req.user.id)) {
    return res.status(404).json({ error: "Sınav bulunamadı." });
  }

  const exam = db.prepare("SELECT id, title, description FROM exams WHERE id = ?").get(examId);
  const questions = db
    .prepare(
      "SELECT id, order_index, text, image_url, options FROM questions WHERE exam_id = ? ORDER BY order_index"
    )
    .all(examId)
    .map((q) => ({ ...q, options: JSON.parse(q.options) }));

  res.json({ exam, questions });
});

router.post("/:id/submit", (req, res) => {
  const examId = Number(req.params.id);

  if (!assertAssigned(examId, req.user.id)) {
    return res.status(404).json({ error: "Sınav bulunamadı." });
  }

  const { answers } = req.body || {};
  if (!Array.isArray(answers)) {
    return res.status(400).json({ error: "Cevaplar geçersiz." });
  }

  const questions = db
    .prepare(
      "SELECT id, order_index, correct_index FROM questions WHERE exam_id = ? ORDER BY order_index"
    )
    .all(examId);

  let score = 0;
  const results = questions.map((q, i) => {
    const givenIndex = answers[i] ?? null;
    const isCorrect = givenIndex === q.correct_index;
    if (isCorrect) score += 1;
    return { questionId: q.id, givenIndex, correctIndex: q.correct_index, isCorrect };
  });

  db.prepare(
    "INSERT INTO attempts (exam_id, user_id, score, total, answers) VALUES (?, ?, ?, ?, ?)"
  ).run(examId, req.user.id, score, questions.length, JSON.stringify(answers));

  res.json({ score, total: questions.length, results });
});

module.exports = router;
