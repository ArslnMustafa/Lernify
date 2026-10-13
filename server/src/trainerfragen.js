// How a card about a building becomes a question. The trainer asks these one
// at a time, the exam simulation mixes them with other kinds, so they live
// here rather than in either route.

const { buildings } = require("./bauwerke");

const label = (b) => (b.location ? `${b.name} (${b.location})` : b.name);

const KINDS = {
  architect: {
    question: (b) => `Wer ist der Architekt des Bauwerks "${label(b)}"?`,
    answer: (b) => b.architect,
  },
  name: {
    question: () => "Welches Bauwerk ist auf dem Bild zu sehen?",
    answer: label,
    needsImage: true,
  },
  year: {
    question: (b) => `In welchem Zeitraum wurde "${b.name}" errichtet?`,
    answer: (b) => b.year,
  },
  description: {
    question: (b) => `Welches Bauwerk wird so beschrieben: „${b.bildmerkmale}"?`,
    answer: label,
  },
};

const KIND_NAMES = Object.keys(KINDS);

// A card can only be asked about what the sources actually record.
function kindsFor(building) {
  return KIND_NAMES.filter((name) => {
    const kind = KINDS[name];
    if (kind.needsImage && !building.image) return false;
    if (name === "description" && !building.bildmerkmale) return false;
    return Boolean(kind.answer(building));
  });
}

function startYear(value) {
  const match = String(value).match(/\d{4}/);
  return match ? Number(match[0]) : null;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Years are only a real question when the options sit close together, otherwise
// the century alone gives it away.
function yearDistractors(correct) {
  const target = startYear(correct);
  const others = [...new Set(buildings.map((b) => b.year).filter(Boolean))].filter(
    (y) => y !== correct
  );

  if (target === null) return others.slice(0, 3);

  const nearest = others
    .map((year) => ({ year, distance: Math.abs((startYear(year) ?? 9999) - target) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 8)
    .map((entry) => entry.year);

  const chosen = [];
  while (chosen.length < 3 && nearest.length > 0) {
    chosen.push(nearest.splice(Math.floor(Math.random() * nearest.length), 1)[0]);
  }
  return chosen;
}

function distractorsFor(kindName, correct) {
  if (kindName === "year") return yearDistractors(correct);

  const answer = KINDS[kindName].answer;
  const others = [...new Set(buildings.map(answer).filter(Boolean))].filter(
    (value) => value !== correct
  );

  const chosen = [];
  while (chosen.length < 3 && others.length > 0) {
    chosen.push(others.splice(Math.floor(Math.random() * others.length), 1)[0]);
  }
  return chosen;
}

// A hint says something about the building that is not the answer: it should
// narrow the field, not give the answer away.
const FACTS = [
  ["architect", (b) => b.architect && `Architekt: ${b.architect}`],
  ["year", (b) => b.year && `Zeitraum: ${b.year}`],
  ["location", (b) => b.location && `Ort: ${b.location}`],
  // Handout cards carry their lecture chapter where a catalogue building
  // carries its style, and "II-5 - Wohnen für das Existenzminimum" is a topic.
  [
    "style",
    (b) =>
      b.style &&
      (/^II-\d+\s*-\s*/.test(b.style)
        ? `Thema: ${b.style.replace(/^II-\d+\s*-\s*/, "")}`
        : `Stil: ${b.style}`),
  ],
  ["merkmal", (b) => b.bildmerkmale && `Merkmal: ${b.bildmerkmale}`],
];

// What each question already asks for, or already says.
const GIVES_AWAY = {
  architect: ["architect"],
  year: ["year"],
  name: ["location"], // the answer is "Name (Ort)"
  description: ["location", "merkmal"],
};

function hintsFor(building, kindName, correct) {
  const forbidden = new Set(GIVES_AWAY[kindName] || []);

  const secrets = [String(correct).toLowerCase()];
  if (kindName === "name" || kindName === "description") {
    secrets.push(building.name.toLowerCase());
  }

  return FACTS.filter(([id]) => !forbidden.has(id))
    .map(([, fact]) => fact(building))
    .filter(Boolean)
    .filter((text) => !secrets.some((secret) => text.toLowerCase().includes(secret)))
    .slice(0, 3);
}

// Everything a question needs, ready to be sent out.
function bauwerkFrage(building, kindName) {
  const correct = KINDS[kindName].answer(building);
  const options = [correct, ...distractorsFor(kindName, correct)].sort(
    () => Math.random() - 0.5
  );

  return {
    text: KINDS[kindName].question(building),
    image: building.image,
    hint: hintsFor(building, kindName, correct),
    options,
    correct,
  };
}

module.exports = {
  KINDS,
  KIND_NAMES,
  kindsFor,
  distractorsFor,
  hintsFor,
  bauwerkFrage,
  label,
  pick,
};
