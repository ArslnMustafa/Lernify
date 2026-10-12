// Gives every question a picture: looks the missing ones up on Wikipedia and
// Wikimedia Commons and stores them in data/bilder.json. Needs internet
// access, so it runs on the server:
//
//   node scripts/fetch-images.js
//   node scripts/fetch-images.js ersetzen   (also replaces non-Wikimedia pictures)
//   node scripts/fetch-images.js pruefen    (asks a few test queries and shows what comes back)
//
// Pictures that were already found are kept, so the script can be run again as
// often as needed — a second run only retries what is still missing. Every hit
// prints the article it came from; hits that came from a search instead of an
// exact article title are listed again at the end, because those are the ones
// that can be wrong. When nothing is found, the reason is printed, so a blocked
// or throttled request never looks like "this building has no photo".

const fs = require("fs");
const path = require("path");
const { keys, load, save, reader, istSchwacheQuelle, FILE } = require("../src/bilder");

const DATA_DIR = path.join(__dirname, "..", "data");

const mode = process.argv[2] || "";
const replaceWeakSources = mode === "ersetzen";
const diagnoseOnly = mode === "pruefen";

const WIKIS = ["de", "en"];
const THUMB_SIZE = 1600;
const PAUSE_MS = 250;
const TRIES = 3;

// Wikimedia asks for a user agent that says who is calling and where to
// complain; requests without one get throttled or refused.
const USER_AGENT = "Lernify/1.0 (Lernhilfe Baugeschichte; https://github.com/ArslnMustafa/Lernify)";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalise = (value) => value.toLowerCase().replace(/[^a-zäöüß0-9]/g, "");

// Why the last attempt came back empty — printed so a throttled run is visible.
let lastReason = null;

// A refused or unanswered request is about the connection, not about the
// building: once a few in a row go unanswered there is no point in asking the
// remaining strategies, and once whole entries fail that way there is no point
// in working through the rest of the list.
const REFUSED_PER_ENTRY = 3;
const GIVE_UP_AFTER_ENTRIES = 4;

let refused = 0; // unanswered requests for the entry being looked up

function unanswered(reason) {
  lastReason = reason;
  refused += 1;
  return null;
}

async function ask(url) {
  for (let attempt = 1; attempt <= TRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        signal: AbortSignal.timeout(20000),
      });

      if (response.ok) {
        refused = 0;
        return await response.json();
      }

      // Throttling and server trouble are worth waiting out; a 403 is not.
      if (response.status !== 429 && response.status < 500) {
        return unanswered(`HTTP ${response.status}`);
      }
      lastReason = `HTTP ${response.status}`;

      const retryAfter = Number(response.headers.get("retry-after"));
      await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : attempt * 3000);
    } catch (error) {
      lastReason = error.name === "TimeoutError" ? "Zeitüberschreitung" : error.message;
      // A name that does not resolve or a port that stays silent will not
      // answer on the third try either.
      if (attempt >= 2) break;
      await sleep(1000);
    }
  }

  return unanswered(lastReason || "unbekannt");
}

// --- the four ways a picture can be found, from safest to loosest -----------

const wikiUrl = (wiki, params) =>
  `https://${wiki}.wikipedia.org/w/api.php?action=query&format=json&formatversion=2` +
  `&prop=pageimages&piprop=thumbnail&pithumbsize=${THUMB_SIZE}&${params}`;

function fromWikiPages(data, wiki) {
  const page = data?.query?.pages?.[0];
  if (!page) {
    lastReason = lastReason || "keine Seite gefunden";
    return null;
  }
  if (page.missing) {
    lastReason = "Artikel existiert nicht";
    return null;
  }
  if (!page.thumbnail?.source) {
    lastReason = `Artikel "${page.title}" hat kein Bild`;
    return null;
  }
  return { title: page.title, image: page.thumbnail.source, wiki };
}

// An article of exactly that name is a safe hit, a search hit only a guess.
async function byTitle(wiki, query) {
  const data = await ask(wikiUrl(wiki, `titles=${encodeURIComponent(query)}&redirects=1`));
  return data && fromWikiPages(data, wiki);
}

async function bySearch(wiki, query) {
  const data = await ask(
    wikiUrl(wiki, `generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1`)
  );
  return data && fromWikiPages(data, wiki);
}

// Many lecture topics have no article of their own but plenty of photographs on
// Commons, so the file archive is the last resort.
async function onCommons(wiki, query) {
  if (wiki !== "de") return null; // Commons is one archive, asking twice is pointless

  const data = await ask(
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2" +
      `&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=1` +
      `&prop=imageinfo&iiprop=url&iiurlwidth=${THUMB_SIZE}`
  );

  const file = data?.query?.pages?.[0];
  const info = file?.imageinfo?.[0];
  if (!info?.thumburl && !info?.url) {
    lastReason = lastReason || "nichts auf Commons";
    return null;
  }

  return {
    title: file.title,
    image: info.thumburl || info.url,
    wiki: "commons",
  };
}

const STRATEGIES = [
  { name: "Titel", run: byTitle, exact: true },
  { name: "Suche", run: bySearch, exact: false },
  { name: "Commons", run: onCommons, exact: false },
];

async function findImage(queries) {
  lastReason = null;
  refused = 0;

  for (const strategy of STRATEGIES) {
    for (const wiki of WIKIS) {
      for (const query of queries) {
        const hit = await strategy.run(wiki, query);
        if (hit) return { ...hit, exact: strategy.exact, strategy: strategy.name };
        if (refused >= REFUSED_PER_ENTRY) return null; // nobody is answering
        await sleep(PAUSE_MS);
      }
    }
  }
  return null;
}

const read = (file) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));

// --- "pruefen": one request per strategy, with everything on show -----------

async function diagnose() {
  console.log(`User-Agent: ${USER_AGENT}\n`);

  const probes = [
    ["Titel de", () => byTitle("de", "Kölner Dom")],
    ["Titel en", () => byTitle("en", "Iron Bridge")],
    ["Suche de", () => bySearch("de", "Gartenstadt Ebenezer Howard")],
    ["Suche en", () => bySearch("en", "Walking City Archigram")],
    ["Commons", () => onCommons("de", "Weißenhofsiedlung")],
  ];

  for (const [label, run] of probes) {
    lastReason = null;
    const hit = await run();
    if (hit) {
      console.log(`${label.padEnd(10)} ok     ${hit.wiki}: ${hit.title}`);
      console.log(`${"".padEnd(10)}        ${hit.image}`);
    } else {
      console.log(`${label.padEnd(10)} LEER   ${lastReason || "unbekannt"}`);
    }
    await sleep(PAUSE_MS);
  }

  console.log(
    "\nAlle Zeilen LEER mit HTTP 403/429: Wikipedia blockt die Anfragen." +
      "\nAlle LEER mit Zeitüberschreitung: der Server kommt nicht raus (Firewall/DNS)."
  );
}

(async () => {
  if (diagnoseOnly) return diagnose();

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
    if (!image || (replaceWeakSources && istSchwacheQuelle(image))) {
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
  let stumm = 0; // entries in a row whose requests went unanswered
  const guessed = [];
  const missing = [];

  for (const [index, target] of targets.entries()) {
    process.stdout.write(`${index + 1}/${targets.length} ${target.label} ... `);

    const hit = await findImage(target.queries);

    if (!hit) {
      missing.push(`${target.label}  (${lastReason || "unbekannt"})`);
      console.log(`kein Bild — ${lastReason || "unbekannt"}`);

      stumm = refused >= REFUSED_PER_ENTRY ? stumm + 1 : 0;
      if (stumm >= GIVE_UP_AFTER_ENTRIES) {
        console.log(
          `\nAbgebrochen: ${stumm} Einträge hintereinander ohne Antwort (${lastReason}).` +
            "\nWas los ist, zeigt:  node scripts/fetch-images.js pruefen" +
            "\nDas Gefundene ist gespeichert, ein neuer Start macht da weiter."
        );
        break;
      }
      continue;
    }

    overlay[target.key] = {
      image: hit.image,
      quelle: `${hit.wiki}.wikimedia/wikipedia: ${hit.title}`,
      treffer: hit.strategy,
    };
    save(overlay); // after every hit, so an interrupted run keeps what it found
    found += 1;
    stumm = 0;

    console.log(`ok  (${hit.wiki}: ${hit.title}${hit.exact ? "" : ` — ${hit.strategy}`})`);
    if (!hit.exact) guessed.push(`${target.label}  ->  ${hit.wiki}: ${hit.title}`);
  }

  save(overlay);

  console.log(`\nGefunden: ${found} von ${targets.length}  (${FILE})`);
  if (guessed.length > 0) {
    console.log(`\nAus einer Suche, bitte kurz prüfen:\n  ${guessed.join("\n  ")}`);
  }
  if (missing.length > 0) {
    console.log(`\nOhne Bild geblieben:\n  ${missing.join("\n  ")}`);
    console.log("\nNoch einmal starten holt nur die fehlenden nach.");
  }
  console.log("\nDanach: node scripts/apply-images.js  und  node scripts/check-images.js");
})();
