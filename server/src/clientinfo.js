// Turns the two things a request tells us about its sender into something
// readable in a mail: the user agent and the address it came from.

// Order matters: Edge and Opera also claim to be Chrome, Chrome also claims Safari.
const BROWSERS = [
  [/Edg\/(\d+)/, "Edge"],
  [/OPR\/(\d+)/, "Opera"],
  [/SamsungBrowser\/(\d+)/, "Samsung Internet"],
  [/Firefox\/(\d+)/, "Firefox"],
  [/Chrome\/(\d+)/, "Chrome"],
  [/Version\/(\d+)[\d.]*\s+(?:Mobile\/\S+\s+)?Safari/, "Safari"],
  [/Safari\/(\d+)/, "Safari"],
];

function describeSystem(userAgent) {
  const iOS = userAgent.match(/(iPhone|iPad); CPU (?:iPhone )?OS (\d+)[_.](\d+)/);
  if (iOS) return `${iOS[1]} (iOS ${iOS[2]}.${iOS[3]})`;
  if (/iPhone|iPad/.test(userAgent)) return userAgent.includes("iPad") ? "iPad" : "iPhone";

  const android = userAgent.match(/Android (\d+(?:\.\d+)?)[^)]*?;\s*([^;)]+?)(?:\s+Build|\))/);
  if (android) {
    const model = android[2].trim();
    return model && model !== "wv" ? `Android ${android[1]}, ${model}` : `Android ${android[1]}`;
  }
  if (/Android/.test(userAgent)) return "Android";

  if (/Windows NT 10/.test(userAgent)) return "Windows 10/11";
  if (/Windows/.test(userAgent)) return "Windows";

  const mac = userAgent.match(/Mac OS X (\d+)[_.](\d+)/);
  if (mac) return `Mac (macOS ${mac[1]}.${mac[2]})`;
  if (/Macintosh/.test(userAgent)) return "Mac";

  if (/CrOS/.test(userAgent)) return "ChromeOS";
  if (/Linux/.test(userAgent)) return "Linux";
  return null;
}

function describeBrowser(userAgent) {
  for (const [pattern, name] of BROWSERS) {
    const found = userAgent.match(pattern);
    if (found) return found[1] ? `${name} ${found[1]}` : name;
  }
  return null;
}

function describeDevice(userAgent) {
  if (!userAgent) return null;

  const system = describeSystem(userAgent);
  const browser = describeBrowser(userAgent);

  if (system && browser) return `${system} · ${browser}`;
  return system || browser || userAgent;
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

    const place = [data.city, data.region, data.country_name].filter(Boolean).join(", ");
    return place || null;
  } catch {
    return null;
  }
}

module.exports = { describeDevice, lookupLocation };
