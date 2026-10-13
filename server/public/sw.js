// Keeps Lernify usable on a phone with a bad connection: the app itself is
// served from the cache, the photos are kept after they have been seen once,
// and anything that talks to the server always goes to the server.

const VERSION = "v1";
const HUELLE = `lernify-huelle-${VERSION}`; // the app: HTML, JS, CSS, icons
const BILDER = `lernify-bilder-${VERSION}`; // the building photos
const BILDER_MAX = 400;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const namen = await caches.keys();
      await Promise.all(
        namen.filter((name) => ![HUELLE, BILDER].includes(name)).map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

// Oldest first, so the cache does not grow without end.
async function aufraeumen(cache, maximum) {
  const schluessel = await cache.keys();
  if (schluessel.length <= maximum) return;
  await Promise.all(schluessel.slice(0, schluessel.length - maximum).map((k) => cache.delete(k)));
}

async function ausCacheSonstNetz(request, cacheName, maximum) {
  const cache = await caches.open(cacheName);
  const gespeichert = await cache.match(request);
  if (gespeichert) return gespeichert;

  const antwort = await fetch(request);

  // Storing happens on the side: a cache that refuses a response must never
  // cost the picture that was just fetched.
  if (antwort.ok || antwort.type === "opaque") {
    cache
      .put(request, antwort.clone())
      .then(() => (maximum ? aufraeumen(cache, maximum) : undefined))
      .catch(() => {});
  }

  return antwort;
}

// The page itself: ask the server first so a new version is picked up, and
// fall back to the last one that worked when there is no connection.
async function netzSonstCache(request) {
  const cache = await caches.open(HUELLE);
  try {
    const antwort = await fetch(request);
    if (antwort.ok) await cache.put("/index.html", antwort.clone());
    return antwort;
  } catch (fehler) {
    const gespeichert = await cache.match("/index.html");
    if (gespeichert) return gespeichert;
    throw fehler;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Questions, answers and the sign-in always come from the server.
  if (url.origin === self.location.origin && url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(netzSonstCache(request));
    return;
  }

  // Building photos, which is what makes the app slow on mobile data.
  if (/wikimedia\.org|gstatic\.com/.test(url.hostname)) {
    event.respondWith(ausCacheSonstNetz(request, BILDER, BILDER_MAX).catch(() => fetch(request)));
    return;
  }

  // The built files carry a hash in their name, so a cached one is never stale.
  if (url.origin === self.location.origin && /\.(js|css|png|svg|webmanifest|woff2?)$/.test(url.pathname)) {
    event.respondWith(ausCacheSonstNetz(request, HUELLE).catch(() => fetch(request)));
  }
});
