// Puts the pictures from data/bilder.json into the questions that are already
// in the database, so a new picture shows up without rebuilding the exams and
// losing the results:
//
//   node scripts/apply-images.js
//
// Questions carry the building, card, epoch or theory number they came from
// (source_key), which is what the pictures are filed under.

const fs = require("fs");
const path = require("path");
const db = require("../src/db");
const { keys, reader } = require("../src/bilder");

const DATA_DIR = path.join(__dirname, "..", "data");
const read = (file) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));

const catalogue = read("baugeschichte.json");
const cards = read("rueckblicke.json");
const epochen = read("epochen.json");

const normalise = (value) => value.toLowerCase().replace(/[^a-zäöüß0-9]/g, "");
const bild = reader();

// The same fallbacks the seed uses: a card without its own picture shows the
// catalogue photo, an epoch the building named in "bildVon".
const buildingImage = (b) => bild(keys.bauwerk(b.name), b.image);
const catalogueImages = new Map(
  catalogue.baseBuildings.map((b) => [normalise(b.name), buildingImage(b)])
);
const catalogueByName = new Map(catalogue.baseBuildings.map((b) => [b.name, buildingImage(b)]));

const images = new Map();

for (const building of catalogue.baseBuildings) {
  images.set(keys.bauwerk(building.name), buildingImage(building));
}
catalogue.theoryItems.forEach((item, index) => {
  images.set(keys.theorie(index), bild(keys.theorie(index), item.image));
});
for (const card of cards) {
  images.set(
    keys.karte(card.name),
    bild(keys.karte(card.name), card.image) || catalogueImages.get(normalise(card.name)) || null
  );
}
for (const epoch of epochen) {
  images.set(
    keys.epoche(epoch.epoche),
    bild(keys.epoche(epoch.epoche), epoch.image) || catalogueByName.get(epoch.bildVon) || null
  );
}

const rows = db
  .prepare("SELECT id, source_key, image_url FROM questions WHERE source_key IS NOT NULL")
  .all();

const update = db.prepare("UPDATE questions SET image_url = ? WHERE id = ?");

let changed = 0;
let stillEmpty = 0;
const unknown = new Set();

for (const row of rows) {
  if (!images.has(row.source_key)) {
    unknown.add(row.source_key);
    continue;
  }

  const image = images.get(row.source_key);
  if (!image) {
    stillEmpty += 1;
    continue;
  }
  if (image === row.image_url) continue;

  update.run(image, row.id);
  changed += 1;
}

console.log(`Fragen geprüft: ${rows.length}`);
console.log(`Bild aktualisiert: ${changed}`);
console.log(`Noch ohne Bild: ${stillEmpty}`);
if (unknown.size > 0) {
  console.log(`Unbekannte Quelle (Seed nötig): ${[...unknown].join(", ")}`);
}
