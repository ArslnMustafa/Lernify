const fs = require("fs");
const path = require("path");
const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { find } = require("../bauwerke");

const router = express.Router();
router.use(requireAuth);

const vergleiche = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "..", "data", "vergleiche.json"), "utf8")
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

router.get("/", (req, res) => {
  res.json({
    vergleiche: pairs.map((pair) => ({
      id: pair.id,
      thema: pair.thema,
      frage: pair.frage,
      a: pair.a,
      b: pair.b,
      fragen: pair.aussagen.length,
    })),
  });
});

router.get("/:id", (req, res) => {
  const pair = byId.get(req.params.id);
  if (!pair) return res.status(404).json({ error: "Vergleich nicht gefunden." });

  res.json({
    vergleich: {
      id: pair.id,
      thema: pair.thema,
      frage: pair.frage,
      a: pair.a,
      b: pair.b,
      aspekte: pair.aspekte,
      gemeinsam: pair.gemeinsam,
      fragen: pair.aussagen.length,
    },
  });
});

// The client says which statements it has already shown, so a round works
// through the pair instead of repeating itself.
router.get("/:id/frage", (req, res) => {
  const pair = byId.get(req.params.id);
  if (!pair) return res.status(404).json({ error: "Vergleich nicht gefunden." });

  const seen = new Set(
    String(req.query.gestellt || "")
      .split(",")
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value))
  );

  const open = pair.aussagen
    .map((_, index) => index)
    .filter((index) => !seen.has(index));

  if (open.length === 0) {
    return res.json({ frage: null, offen: 0, gesamt: pair.aussagen.length });
  }

  const index = open[Math.floor(Math.random() * open.length)];
  const aussage = pair.aussagen[index];

  res.json({
    frage: {
      index,
      aspekt: aussage.aspekt,
      text: aussage.text,
      optionen: [
        { wert: "a", label: labelFor(pair, "a") },
        { wert: "b", label: labelFor(pair, "b") },
        { wert: "beide", label: "Beide" },
      ],
    },
    offen: open.length,
    gesamt: pair.aussagen.length,
  });
});

router.post("/antwort", (req, res) => {
  const { id, index, antwort } = req.body || {};
  const pair = byId.get(String(id));
  const aussage = pair?.aussagen[Number(index)];

  if (!aussage) return res.status(400).json({ error: "Ungültige Frage." });

  res.json({
    correct: aussage.gilt === antwort,
    gilt: aussage.gilt,
    richtig: labelFor(pair, aussage.gilt),
    aspekt: aussage.aspekt,
    // The counterpart makes the contrast visible right at the answer.
    gegenstueck:
      aussage.gilt === "beide"
        ? null
        : pair.aspekte.find((a) => a.aspekt === aussage.aspekt)?.[
            aussage.gilt === "a" ? "b" : "a"
          ] || null,
    gegenstueckLabel:
      aussage.gilt === "beide" ? null : labelFor(pair, aussage.gilt === "a" ? "b" : "a"),
  });
});

module.exports = router;
