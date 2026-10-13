const fs = require("fs");
const path = require("path");
const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { buildings } = require("../bauwerke");

const router = express.Router();
router.use(requireAuth);

const { theoryItems } = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "..", "data", "baugeschichte.json"), "utf8")
);

const theory = theoryItems.map((item, i) => ({
  id: i,
  question: item.q.replace(/^\d+\.\s*/, ""),
  answer: item.a,
}));

// The same list the trainer works with, so looked-up pictures and corrections
// made under Verwalten show up on the flashcards too. A handout card has its
// distinguishing feature where a catalogue building has its list of features.
router.get("/buildings", (req, res) => {
  res.json({
    buildings: buildings.map((b) => ({
      id: b.key,
      name: b.name,
      location: b.location,
      architect: b.architect,
      year: b.year,
      style: b.style,
      image: b.image,
      features: b.features || (b.bildmerkmale ? [b.bildmerkmale] : []),
    })),
  });
});

router.get("/theory", (req, res) => res.json({ theory }));

module.exports = router;
