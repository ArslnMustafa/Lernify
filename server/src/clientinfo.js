// Turns the two things a request tells us about its sender into something
// readable in a mail: the user agent and the address it came from.

const OPERATING_SYSTEMS = [
  [/iPhone/, "iPhone"],
  [/iPad/, "iPad"],
  [/Android/, "Android"],
  [/Windows NT/, "Windows"],
  [/Mac OS X|Macintosh/, "Mac"],
  [/CrOS/, "ChromeOS"],
  [/Linux/, "Linux"],
];

// Order matters: Edge and Opera also claim to be Chrome, Chrome also claims Safari.
const BROWSERS = [
  [/Edg\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/SamsungBrowser/, "Samsung Internet"],
  [/Firefox\//, "Firefox"],
  [/Chrome\//, "Chrome"],
  [/Safari\//, "Safari"],
];

function match(list, value) {
  const found = list.find(([pattern]) => pattern.test(value));
  return found ? found[1] : null;
}

function describeDevice(userAgent) {
  if (!userAgent) return null;

  const os = match(OPERATING_SYSTEMS, userAgent);
  const browser = match(BROWSERS, userAgent);

  if (os && browser) return `${os} · ${browser}`;
  return os || browser || userAgent;
}

function isPrivateAddress(ip) {
  return (
    !ip ||
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
  );
}

// Best effort only: a missing location must never hold up or fail the mail.
async function lookupLocation(ip) {
  if (isPrivateAddress(ip)) return null;

  try {
    const response = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      signal: AbortSignal.timeout(4000),
      headers: { "User-Agent": "Lernify" },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.error) return null;

    const parts = [data.city, data.region, data.country_name].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  } catch {
    return null;
  }
}

module.exports = { describeDevice, lookupLocation };
