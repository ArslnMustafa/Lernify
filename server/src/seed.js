const db = require("./db");
const { hashPassword } = require("./password");

db.exec(`
  DELETE FROM attempts;
  DELETE FROM exam_assignments;
  DELETE FROM questions;
  DELETE FROM exams;
  DELETE FROM users;
`);

function createUser(username, name, password) {
  const { hash, salt } = hashPassword(password);
  const info = db
    .prepare(
      "INSERT INTO users (username, name, password_hash, password_salt) VALUES (?, ?, ?, ?)"
    )
    .run(username, name, hash, salt);
  return info.lastInsertRowid;
}

function createExam(title, description, userIds, questions) {
  const examInfo = db
    .prepare("INSERT INTO exams (title, description) VALUES (?, ?)")
    .run(title, description);
  const examId = examInfo.lastInsertRowid;

  for (const userId of userIds) {
    db.prepare(
      "INSERT INTO exam_assignments (exam_id, user_id) VALUES (?, ?)"
    ).run(examId, userId);
  }

  questions.forEach((q, i) => {
    db.prepare(
      "INSERT INTO questions (exam_id, order_index, text, image_url, options, correct_index) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(examId, i, q.text, q.imageUrl || null, JSON.stringify(q.options), q.correctIndex);
  });

  return examId;
}

const zeynepId = createUser("zeynep", "Zeynep", "zeynep123");
const mustafaId = createUser("mustafa", "Mustafa", "mustafa123");

createExam(
  "Mimarlık Tarihi II",
  "Modern ve postmodern mimarlık üzerine temel bilgi sınavı.",
  [zeynepId],
  [
    {
      text: 'Villa Savoye\'nin mimarı kimdir?',
      options: ["Walter Gropius", "Le Corbusier", "Mies van der Rohe", "Zaha Hadid"],
      correctIndex: 1,
    },
    {
      text: "Bauhaus Dessau binası hangi yıllar arasında inşa edilmiştir?",
      options: ["1911–1913", "1925–1926", "1954–1958", "1993–1999"],
      correctIndex: 1,
    },
    {
      text: "Centre Pompidou'nun mimarları kimlerdir?",
      options: [
        "Richard Rogers & Renzo Piano",
        "Daniel Libeskind",
        "Charles Moore",
        "Louis I. Kahn",
      ],
      correctIndex: 0,
    },
    {
      text: "Hangi yapı Brutalizm akımının örneklerindendir?",
      options: ["Barcelona-Pavillon", "Unité d'Habitation", "Seagram Building", "Piazza d'Italia"],
      correctIndex: 1,
    },
    {
      text: "Jüdisches Museum (Berlin) hangi mimari akıma aittir?",
      options: ["Postmoderne", "Dekonstruktivismus", "Bauhaus", "International Style"],
      correctIndex: 1,
    },
  ]
);

createExam(
  "Genel Kültür Sınavı",
  "Karışık konularda temel genel kültür soruları.",
  [mustafaId],
  [
    {
      text: "Türkiye'nin başkenti neresidir?",
      options: ["İstanbul", "İzmir", "Ankara", "Bursa"],
      correctIndex: 2,
    },
    {
      text: "Güneş sisteminde Dünya'ya en yakın gezegen hangisidir?",
      options: ["Mars", "Venüs", "Jüpiter", "Merkür"],
      correctIndex: 1,
    },
    {
      text: "İnsan vücudundaki en büyük organ hangisidir?",
      options: ["Karaciğer", "Deri", "Akciğer", "Beyin"],
      correctIndex: 1,
    },
    {
      text: "Hangisi bir programlama dili değildir?",
      options: ["Python", "JavaScript", "HTML", "Java"],
      correctIndex: 2,
    },
    {
      text: "Dünyanın en uzun nehri hangisidir?",
      options: ["Amazon", "Nil", "Mississippi", "Yangtze"],
      correctIndex: 1,
    },
  ]
);

console.log("Seed tamamlandı:");
console.log("  zeynep / zeynep123 -> Mimarlık Tarihi II");
console.log("  mustafa / mustafa123 -> Genel Kültür Sınavı");
