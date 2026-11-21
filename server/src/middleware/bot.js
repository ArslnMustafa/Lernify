// Zugang fuer den Telegram-Bot von mustafaarslan.com.
// Der Bot meldet sich mit einem gemeinsamen Schluessel (BOT_KEY, in beiden Apps derselbe
// Wert, nur als Umgebungsvariable) und nennt den Benutzernamen, fuer den er fragt.
// Ohne BOT_KEY ist dieser Zugang abgeschaltet.
const crypto = require("crypto");
const db = require("../db");

const KEY = process.env.BOT_KEY || "";

function gleich(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

function botZugang(req, res, next) {
  if (!KEY) return res.status(404).json({ error: "Nicht gefunden." });
  if (!gleich(req.get("X-Bot-Key") || "", KEY)) return res.status(401).json({ error: "Schlüssel falsch." });
  const username = String(req.get("X-Bot-User") || "").trim().toLowerCase();
  const u = username && db.prepare("SELECT id, username, name FROM users WHERE lower(username) = ?").get(username);
  if (!u) return res.status(404).json({ error: "Benutzer nicht gefunden." });
  req.user = { id: u.id, username: u.username, name: u.name };
  next();
}

module.exports = { botZugang };
