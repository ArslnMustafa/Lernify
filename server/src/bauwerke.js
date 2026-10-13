// The building list the learning modules work with: the 150 catalogue
// buildings, enriched with the handout's exam descriptions where the two share
// a name, plus the 66 buildings the handout adds of its own. Pictures come
// from data/bilder.json where one was looked up.

const fs = require("fs");
const path = require("path");
const { keys, reader } = require("./bilder");

const dataFile = (name) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", name), "utf8"));

const { baseBuildings } = dataFile("baugeschichte.json");
const rueckblicke = dataFile("rueckblicke.json");

const normalise = (value) => value.toLowerCase().replace(/[^a-zäöüß0-9]/g, "");

const bild = reader();

const buildings = baseBuildings.map((b, i) => ({
  ...b,
  key: String(i),
  image: bild(keys.bauwerk(b.name), b.image),
}));

const byName = new Map(buildings.map((b) => [normalise(b.name), b]));

for (const card of rueckblicke) {
  const existing = byName.get(normalise(card.name));
  if (existing) {
    existing.bildmerkmale = card.bildmerkmale;
    continue;
  }

  const added = {
    key: `rb${card.name}`,
    name: card.name,
    location: card.location,
    architect: card.architect,
    year: card.year,
    style: card.thema,
    image: bild(keys.karte(card.name), card.image),
    bildmerkmale: card.bildmerkmale,
  };
  buildings.push(added);
  byName.set(normalise(card.name), added);
}

const byKey = new Map(buildings.map((b) => [b.key, b]));

const find = (name) => byName.get(normalise(name)) || null;

module.exports = { buildings, byKey, byName, find, normalise };
