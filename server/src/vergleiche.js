// The pairings, ready to use: each one names two buildings, everything else
// about them comes from the building list, and every line of the comparison
// doubles as a question.

const fs = require("fs");
const path = require("path");
const { find } = require("./bauwerke");

const vergleiche = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "vergleiche.json"), "utf8")
);

// Each pair names two buildings; everything else about them — picture,
// architect, place, year — is already in the building list.
function side(name) {
  const building = find(name);
  return {
    name,
    ort: building?.location || null,
    jahr: building?.year || null,
    architekt: building?.architect || null,
    image: building?.image || null,
  };
}

// Every line of the comparison doubles as a question: "which of the two is
// this true of?". The shared lines are the ones where the answer is "both".
function aussagenFor(pair) {
  const aussagen = [];

  for (const aspekt of pair.aspekte) {
    aussagen.push({ aspekt: aspekt.aspekt, text: aspekt.a, gilt: "a" });
    aussagen.push({ aspekt: aspekt.aspekt, text: aspekt.b, gilt: "b" });
  }
  for (const text of pair.gemeinsam) {
    aussagen.push({ aspekt: "Gemeinsamkeit", text, gilt: "beide" });
  }

  return aussagen;
}

const pairs = vergleiche.map((pair) => ({
  ...pair,
  a: side(pair.a),
  b: side(pair.b),
  aussagen: aussagenFor(pair),
}));

const byId = new Map(pairs.map((pair) => [pair.id, pair]));

const labelFor = (pair, gilt) =>
  gilt === "beide" ? "Beide" : `${pair[gilt].name} (${pair[gilt].jahr || "?"})`;


module.exports = { pairs, byId, labelFor };
