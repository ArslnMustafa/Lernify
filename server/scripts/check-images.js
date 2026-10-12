// Reports which questions still have no picture — once in the data files and
// once in the seeded database.
//
//   node scripts/check-images.js

const fs = require("fs");
const path = require("path");

const { keys, reader } = require("../src/bilder");

const DATA_DIR = path.join(__dirname, "..", "data");
const read = (file) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));

const normalise = (value) => value.toLowerCase().replace(/[^a-zäöüß0-9]/g, "");
const isWeakSource = (url) => Boolean(url) && !/upload\.wikimedia\.org/.test(url);

const catalogue = read("baugeschichte.json");
const cards = read("rueckblicke.json");
const epochen = read("epochen.json");

const bild = reader();
const buildingImage = (b) => bild(keys.bauwerk(b.name), b.image);
const catalogueImages = new Map(
  catalogue.baseBuildings.map((b) => [normalise(b.name), buildingImage(b)])
);
const catalogueByName = new Map(catalogue.baseBuildings.map((b) => [b.name, buildingImage(b)]));

const groups = [
  ["Bauwerke (Katalog)", catalogue.baseBuildings.map((b) => [b.name, buildingImage(b)])],
  [
    "Theoriefragen",
    catalogue.theoryItems.map((t, i) => [t.q.slice(0, 50), bild(keys.theorie(i), t.image)]),
  ],
  [
    "Rückblick-Karten",
    cards.map((c) => [
      c.name,
      bild(keys.karte(c.name), c.image) || catalogueImages.get(normalise(c.name)),
    ]),
  ],
  [
    "Epochen",
    epochen.map((e) => [
      e.epoche,
      bild(keys.epoche(e.epoche), e.image) || catalogueByName.get(e.bildVon),
    ]),
  ],
  [
    "Zeyneps Fragen",
    catalogue.zeynepSpecialQuestions.map((q) => [q.title.slice(0, 50), q.image]),
  ],
];

let missingTotal = 0;
let weakTotal = 0;

console.log("Datendateien");
for (const [name, entries] of groups) {
  const missing = entries.filter(([, image]) => !image);
  const weak = entries.filter(([, image]) => isWeakSource(image));
  missingTotal += missing.length;
  weakTotal += weak.length;

  console.log(
    `  ${name.padEnd(22)} ${entries.length - missing.length}/${entries.length} mit Bild` +
      (weak.length > 0 ? `, ${weak.length} nicht von Wikimedia` : "")
  );
  for (const [label] of missing) console.log(`      ohne Bild: ${label}`);
}

console.log(`\n  Summe ohne Bild: ${missingTotal}, schwache Quelle: ${weakTotal}`);
if (weakTotal > 0) {
  console.log("  Schwache Quellen ersetzen: node scripts/fetch-images.js ersetzen");
}

// The database only exists once the seed has run.
const dbFile = process.env.DB_PATH || path.join(__dirname, "..", "lernify.db");
if (!fs.existsSync(dbFile)) {
  console.log("\nDatenbank noch nicht angelegt — nach dem Seed erneut prüfen.");
  return;
}

const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync(dbFile);

const rows = db
  .prepare(
    `SELECT e.title,
            COUNT(q.id) AS fragen,
            SUM(CASE WHEN q.image_url IS NULL OR q.image_url = '' THEN 1 ELSE 0 END) AS ohne_bild
     FROM exams e LEFT JOIN questions q ON q.exam_id = e.id
     GROUP BY e.id ORDER BY e.id`
  )
  .all();

console.log("\nDatenbank (Prüfungen)");
let dbMissing = 0;
for (const row of rows) {
  dbMissing += Number(row.ohne_bild || 0);
  const mark = Number(row.ohne_bild || 0) === 0 ? "ok " : "!  ";
  console.log(`  ${mark}${row.title.padEnd(44)} ${row.fragen - row.ohne_bild}/${row.fragen}`);
}
console.log(`\n  Fragen ohne Bild in der Datenbank: ${dbMissing}`);
