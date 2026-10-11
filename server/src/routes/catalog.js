const fs = require("fs");
const path = require("path");
const express = require("express");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

const { baseBuildings, theoryItems } = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "..", "data", "baugeschichte.json"), "utf8")
);

const buildings = baseBuildings.map((b, i) => ({ id: i, ...b }));
const theory = theoryItems.map((item, i) => ({
  id: i,
  question: item.q.replace(/^\d+\.\s*/, ""),
  answer: item.a,
}));

router.get("/buildings", (req, res) => res.json({ buildings }));
router.get("/theory", (req, res) => res.json({ theory }));

module.exports = router;
