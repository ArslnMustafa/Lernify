// Pictures that were looked up on Wikipedia live in data/bilder.json, not in
// the question files. The lookup needs internet access, so it runs on the
// server (scripts/fetch-images.js), and keeping it in its own file — which git
// ignores — means an update never collides with the questions.

const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "data", "bilder.json");

// Keys both sides have to agree on.
const keys = {
  bauwerk: (name) => `bauwerk:${name}`,
  karte: (name) => `karte:${name}`,
  theorie: (index) => `theorie:${index + 1}`,
  epoche: (name) => `epoche:${name}`,
  sonder: (index) => `sonder:${index + 1}`,
};

function load() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return {};
  }
}

function save(overlay) {
  const sorted = {};
  for (const key of Object.keys(overlay).sort()) sorted[key] = overlay[key];
  fs.writeFileSync(FILE, JSON.stringify(sorted, null, 1) + "\n");
}

// A looked-up picture beats the one in the question file: the fetch only
// replaces a picture when it was asked to.
function reader(overlay = load()) {
  return (key, fallback = null) => overlay[key]?.image || fallback || null;
}

// Wikimedia serves its pictures from upload. and thumb.; anything else is a
// Google thumbnail or a random host — small, and gone sooner or later.
const istSchwacheQuelle = (url) =>
  Boolean(url) && !/\.wikimedia\.org\//.test(url);

module.exports = { FILE, keys, load, save, reader, istSchwacheQuelle };
