// The building list the learning modules work with: the 150 catalogue
// buildings, enriched with the handout's exam descriptions where the two share
// a name, plus the 66 buildings the handout adds of its own.
//
// Two files are laid over the question data, and neither is in git, so the
// server can write them without an update colliding: data/bilder.json holds
// the pictures that were looked up, data/aenderungen.json what was corrected
// by hand in the Verwalten section.

const fs = require("fs");
const path = require("path");
const { keys, reader } = require("./bilder");

const DATA_DIR = path.join(__dirname, "..", "data");
const AENDERUNGEN = path.join(DATA_DIR, "aenderungen.json");

const dataFile = (name) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), "utf8"));

const normalise = (value) => value.toLowerCase().replace(/[^a-zäöüß0-9]/g, "");

// What may be corrected by hand.
const FELDER = ["name", "location", "architect", "year", "style", "image", "bildmerkmale"];

function ladeAenderungen() {
  try {
    return JSON.parse(fs.readFileSync(AENDERUNGEN, "utf8"));
  } catch {
    return {};
  }
}

function speichereAenderungen(aenderungen) {
  fs.writeFileSync(AENDERUNGEN, JSON.stringify(aenderungen, null, 1) + "\n");
}

// The exported containers keep their identity, so modules that took a
// reference at startup see an edit without a restart.
const buildings = [];
const byName = new Map();
const byKey = new Map();

function aufbauen() {
  const { baseBuildings } = dataFile("baugeschichte.json");
  const rueckblicke = dataFile("rueckblicke.json");
  const bild = reader();
  const aenderungen = ladeAenderungen();

  const geaendert = (key, bauwerk) => ({ ...bauwerk, ...(aenderungen[key] || {}) });

  buildings.length = 0;
  byName.clear();
  byKey.clear();

  baseBuildings.forEach((b, i) => {
    const bauwerk = geaendert(keys.bauwerk(b.name), {
      ...b,
      key: String(i),
      image: bild(keys.bauwerk(b.name), b.image),
    });
    buildings.push(bauwerk);
    byName.set(normalise(bauwerk.name), bauwerk);
  });

  for (const card of rueckblicke) {
    const vorhanden = byName.get(normalise(card.name));
    if (vorhanden) {
      vorhanden.bildmerkmale = vorhanden.bildmerkmale || card.bildmerkmale;
      continue;
    }

    const neu = geaendert(keys.karte(card.name), {
      key: `rb${card.name}`,
      name: card.name,
      location: card.location,
      architect: card.architect,
      year: card.year,
      style: card.thema,
      image: bild(keys.karte(card.name), card.image),
      bildmerkmale: card.bildmerkmale,
    });
    buildings.push(neu);
    byName.set(normalise(neu.name), neu);
  }

  for (const bauwerk of buildings) byKey.set(bauwerk.key, bauwerk);
}

aufbauen();

const find = (name) => byName.get(normalise(name)) || null;

// Which file an edit belongs under: a catalogue building or a handout card.
const aenderungsSchluessel = (bauwerk) =>
  bauwerk.key.startsWith("rb") ? keys.karte(bauwerk.key.slice(2)) : keys.bauwerk(bauwerk.name);

function aendern(key, felder) {
  const bauwerk = byKey.get(String(key));
  if (!bauwerk) return null;

  const schluessel = aenderungsSchluessel(bauwerk);
  const aenderungen = ladeAenderungen();
  const eintrag = { ...(aenderungen[schluessel] || {}) };

  for (const feld of FELDER) {
    if (!(feld in felder)) continue;
    const wert = String(felder[feld] ?? "").trim();
    if (wert) eintrag[feld] = wert;
    else delete eintrag[feld];
  }

  if (Object.keys(eintrag).length > 0) aenderungen[schluessel] = eintrag;
  else delete aenderungen[schluessel];

  speichereAenderungen(aenderungen);
  aufbauen();

  return byKey.get(String(key)) || find(eintrag.name || bauwerk.name);
}

module.exports = {
  buildings,
  byKey,
  byName,
  find,
  normalise,
  aendern,
  aufbauen,
  FELDER,
  AENDERUNGEN,
};
