const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SERVER_DIR = path.join(__dirname, "..");
const SECRET_FILE = path.join(SERVER_DIR, ".jwt-secret");
const ENV_FILE = path.join(SERVER_DIR, ".env");

// Settings live in a file next to the app so they survive a pm2 restart without
// having to be passed on the command line.
function loadEnvFile() {
  if (!fs.existsSync(ENV_FILE)) return;

  for (const line of fs.readFileSync(ENV_FILE, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

// Generated once per install and kept out of git, so no secret has to be set by hand.
function loadJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;

  if (fs.existsSync(SECRET_FILE)) {
    const stored = fs.readFileSync(SECRET_FILE, "utf8").trim();
    if (stored) return stored;
  }

  const secret = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(SECRET_FILE, secret, { mode: 0o600 });
  console.log(`[Lernify] Yeni JWT anahtarı üretildi: ${SECRET_FILE}`);
  return secret;
}

loadEnvFile();

module.exports = {
  JWT_SECRET: loadJwtSecret(),
  PORT: process.env.PORT || 4000,
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  LOGIN_ALERT_TO: process.env.LOGIN_ALERT_TO || "",
  LOGIN_ALERT_FROM: process.env.LOGIN_ALERT_FROM || "Lernify <onboarding@resend.dev>",
};
