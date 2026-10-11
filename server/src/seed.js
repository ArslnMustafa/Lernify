const fs = require("fs");
const path = require("path");
const db = require("./db");
const { hashPassword } = require("./password");

const { baseBuildings, theoryItems, zeynepSpecialQuestions } = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "baugeschichte.json"), "utf8")
);

// Exam content is rebuilt from scratch; accounts and their passwords are kept.
db.exec(`
  DELETE FROM attempts;
  DELETE FROM exam_assignments;
  DELETE FROM questions;
  DELETE FROM exams;
`);

function getOrCreateUser(username, name, defaultPassword) {
  const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (existing) return existing.id;

  const { hash, salt } = hashPassword(defaultPassword);
  return db
    .prepare(
      "INSERT INTO users (username, name, password_hash, password_salt) VALUES (?, ?, ?, ?)"
    )
    .run(username, name, hash, salt).lastInsertRowid;
}

function createExam(title, description, userIds, questions) {
  const examId = db
    .prepare("INSERT INTO exams (title, description) VALUES (?, ?)")
    .run(title, description).lastInsertRowid;

  for (const userId of userIds) {
    db.prepare("INSERT INTO exam_assignments (exam_id, user_id) VALUES (?, ?)").run(
      examId,
      userId
    );
  }

  const insert = db.prepare(
    `INSERT INTO questions (exam_id, order_index, type, text, image_url, options, correct_index, answer_text)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  questions.forEach((q, i) => {
    insert.run(
      examId,
      i,
      q.type,
      q.text,
      q.imageUrl || null,
      q.options ? JSON.stringify(q.options) : null,
      q.correctIndex ?? null,
      q.answerText || null
    );
  });

  return examId;
}

// Deterministic PRNG so re-seeding produces the same distractors and order.
function makeRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

const random = makeRandom(20251011);

function pickDistractors(correct, pool, count) {
  const candidates = [...new Set(pool)].filter((v) => v !== correct);
  const picked = [];
  while (picked.length < count && candidates.length > 0) {
    const idx = Math.floor(random() * candidates.length);
    picked.push(candidates.splice(idx, 1)[0]);
  }
  return picked;
}

function buildingQuestion(building, allArchitects) {
  const distractors = pickDistractors(building.architect, allArchitects, 3);
  const options = [building.architect, ...distractors];

  // Shuffle so the correct answer is not always first.
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return {
    type: "single",
    text: `Wer ist der Architekt des Bauwerks "${building.name}" (${building.location}, ${building.year})?`,
    imageUrl: building.image,
    options,
    correctIndex: options.indexOf(building.architect),
  };
}

const zeynepId = getOrCreateUser("zeynep", "Zeynep", "zeynep123");
const mustafaId = getOrCreateUser("mustafa", "Mustafa", "mustafa123");

// 1) Theory catalogue: open questions, self-assessed against the reference answer.
createExam(
  "Baugeschichte II — Theoriefragen",
  `Ausführlicher Fragen- und Antwortenkatalog aus dem Skript: ${theoryItems.length} Fragen. Schreib deine Antwort und vergleiche sie mit der Musterlösung.`,
  [zeynepId],
  theoryItems.map((item) => ({
    type: "open",
    text: item.q.replace(/^\d+\.\s*/, ""),
    answerText: item.a,
  }))
);

// 2) Building recognition: the 150-building catalogue, split into sittings of 50.
const allArchitects = baseBuildings.map((b) => b.architect);
const CHUNK_SIZE = 50;
const chunkCount = Math.ceil(baseBuildings.length / CHUNK_SIZE);

for (let c = 0; c < chunkCount; c++) {
  const chunk = baseBuildings.slice(c * CHUNK_SIZE, (c + 1) * CHUNK_SIZE);
  const questions = chunk.map((b) => buildingQuestion(b, allArchitects));

  // Zeynep's personal questions close out the final sitting.
  if (c === chunkCount - 1) {
    questions.push(
      ...zeynepSpecialQuestions.map((q) => ({
        type: "single",
        text: q.title,
        imageUrl: q.image,
        options: q.options,
        correctIndex: q.options.indexOf(q.correct),
      }))
    );
  }

  createExam(
    `Baugeschichte II — Bauwerke erkennen ${c + 1}/${chunkCount}`,
    `${chunk.length} Bauwerke: Erkenne den Architekten am Bild.`,
    [zeynepId],
    questions
  );
}

// 3) Placeholder exam for Mustafa until his own content arrives.
createExam(
  "Genel Kültür Sınavı",
  "Karışık konularda temel genel kültür soruları.",
  [mustafaId],
  [
    {
      type: "single",
      text: "Türkiye'nin başkenti neresidir?",
      options: ["İstanbul", "İzmir", "Ankara", "Bursa"],
      correctIndex: 2,
    },
    {
      type: "single",
      text: "Güneş sisteminde Dünya'ya en yakın gezegen hangisidir?",
      options: ["Mars", "Venüs", "Jüpiter", "Merkür"],
      correctIndex: 1,
    },
    {
      type: "single",
      text: "İnsan vücudundaki en büyük organ hangisidir?",
      options: ["Karaciğer", "Deri", "Akciğer", "Beyin"],
      correctIndex: 1,
    },
    {
      type: "single",
      text: "Hangisi bir programlama dili değildir?",
      options: ["Python", "JavaScript", "HTML", "Java"],
      correctIndex: 2,
    },
    {
      type: "single",
      text: "Dünyanın en uzun nehri hangisidir?",
      options: ["Amazon", "Nil", "Mississippi", "Yangtze"],
      correctIndex: 1,
    },
  ]
);

const counts = db
  .prepare(
    `SELECT e.title, COUNT(q.id) AS n
     FROM exams e LEFT JOIN questions q ON q.exam_id = e.id
     GROUP BY e.id ORDER BY e.id`
  )
  .all();

console.log("Seed tamamlandı:");
for (const row of counts) console.log(`  ${row.title} — ${row.n} soru`);
