const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SECRET_FILE = path.join(__dirname, "..", ".jwt-secret");

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

module.exports = {
  JWT_SECRET: loadJwtSecret(),
  PORT: process.env.PORT || 4000,
};
