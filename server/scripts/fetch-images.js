// Gives every question a picture: looks the missing ones up on Wikipedia and
// stores them in data/bilder.json. Needs internet access, so it runs on the
// server:
//
//   node scripts/fetch-images.js
//   node scripts/fetch-images.js ersetzen   (also replaces non-Wikimedia pictures)
//
// Pictures that were already found are kept, so the script can be run again as
// often as needed. Every hit prints the article it came from, and hits that
// came from a search instead of an exact article title are listed again at the
// end, because those are the ones that can be wrong.

const fs = require("fs");
const path = require("path");
const { keys, load, save, reader, FILE } = require("../src/bilder");

const DATA_DIR = path.join(__dirname, "..", "data");

const replaceWeakSources = process.argv.includes("ersetzen");

const WIKIS = ["de", "en"];
const THUMB_SIZE = 1600;
const PAUSE_MS = 250;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Google thumbnails are tiny and expire; other random hosts may block hotlinking.
const isWeakSource = (url) => Boolean(url) && !/upload\.wikimedia\.org/.test(url);

const normalise = (value) => value.toLowerCase().replace(/[^a-zäöüß0-9]/g, "");

async function askWiki(wiki, params) {
  const url =
    `https://${wiki}.wikipedia.org/w/api.php?action=query&format=json&formatversion=2` +
    `&prop=pageimages&piprop=thumbnail&pithumbsize=${THUMB_SIZE}&${params}`;

  const response = await fetch(url, {
    headers: { "User-Agent": "Lernify/1.0 (Lernhilfe Baugeschichte)" },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) return null;

  const data = await response.json();
  const page = data?.query?.pages?.[0];
  if (!page || page.missing || !page.thumbnail?.source) return null;

  return { title: page.title, image: page.thumbnail.source, wiki };
}

// An article of exactly that name is a safe hit, a search hit only a guess.
const byTitle = (wiki, query) =>
  askWiki(wiki, `titles=${encodeURIComponent(query)}&redirects=1`);

const bySearch = (wiki, query) =>
  askWiki(wiki, `generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1`);

async function findImage(queries) {
  for (const lookup of [byTitle, bySearch]) {
    for (const wiki of WIKIS) {
      for (const query of queries) {
        try {
          const hit = await lookup(wiki, query);
          await sleep(PAUSE_MS);
          if (hit) return { ...hit, exact: lookup === byTitle };
        } catch (error) {
          console.error(`   ! ${wiki} "${query}": ${error.message}`);
        }
      }
    }
  }
  return null;
}

const read = (file) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));

(async () => {
  const catalogue = read("baugeschichte.json");
  const cards = read("rueckblicke.json");
  const epochen = read("epochen.json");

  const overlay = load();
  const bild = reader(overlay);

  const inCatalogue = new Set(catalogue.baseBuildings.map((b) => normalise(b.name)));

  const targets = [];

  const add = (key, label, current, queries) => {
    const wanted = queries.filter(Boolean);
    const image = bild(key, current);
    if (wanted.length === 0) return;
    if (!image || (replaceWeakSources && isWeakSource(image))) {
      targets.push({ key, label, queries: wanted });
    }
  };

  for (const building of catalogue.baseBuildings) {
    add(keys.bauwerk(building.name), building.name, building.image, [
      building.location ? `${building.name} ${building.location}` : null,
      building.name,
    ]);
  }

  for (const card of cards) {
    // Cards that share a name with the catalogue use the catalogue picture.
    if (inCatalogue.has(normalise(card.name))) continue;
    add(keys.karte(card.name), card.name, card.image, [
      card.bildSuche,
      card.location ? `${card.name} ${card.location}` : null,
      card.name,
    ]);
  }

  catalogue.theoryItems.forEach((item, index) => {
    add(
      keys.theorie(index),
      item.q.replace(/^\d+\.\s*/, "").slice(0, 60),
      item.image,
      [item.bildSuche]
    );
  });

  for (const epoch of epochen) {
    // Epochs with "bildVon" take their picture from that catalogue building.
    if (epoch.bildVon) continue;
    add(keys.epoche(epoch.epoche), epoch.epoche, epoch.image, [epoch.bildSuche]);
  }

  console.log(`Bild gesucht für ${targets.length} Einträge\n`);

  let found = 0;
  const guessed = [];
  const missing = [];

  for (const [index, target] of targets.entries()) {
    process.stdout.write(`${index + 1}/${targets.length} ${target.label} ... `);

    const hit = await findImage(target.queries);
    if (!hit) {
      missing.push(target.label);
      console.log("kein Bild");
      continue;
    }

    overlay[target.key] = {
      image: hit.image,
      quelle: `${hit.wiki}.wikipedia.org/wiki/${hit.title.replace(/ /g, "_")}`,
      treffer: hit.exact ? "titel" : "suche",
    };
    save(overlay); // after every hit, so an interrupted run keeps what it found
    found += 1;

    console.log(`ok  (${hit.wiki}: ${hit.title}${hit.exact ? "" : " — Suchtreffer"})`);
    if (!hit.exact) guessed.push(`${target.label}  ->  ${hit.wiki}: ${hit.title}`);
  }

  save(overlay);

  console.log(`\nGefunden: ${found} von ${targets.length}  (${FILE})`);
  if (guessed.length > 0) {
    console.log(`\nAus einer Suche, bitte kurz prüfen:\n  ${guessed.join("\n  ")}`);
  }
  if (missing.length > 0) {
    console.log(`\nOhne Bild geblieben:\n  ${missing.join("\n  ")}`);
  }
  console.log("\nDanach: node scripts/check-images.js  und  node src/seed.js");
})();
