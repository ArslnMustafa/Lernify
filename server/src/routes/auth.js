const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { verifyPassword } = require("../password");
const { JWT_SECRET } = require("../config");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// The login screen lists the accounts, so throttle guessing against a known name.
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;
const failures = new Map();

function tooManyAttempts(key) {
  const entry = failures.get(key);
  if (!entry) return false;
  if (Date.now() - entry.firstAt > WINDOW_MS) {
    failures.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(key) {
  const entry = failures.get(key);
  if (!entry || Date.now() - entry.firstAt > WINDOW_MS) {
    failures.set(key, { count: 1, firstAt: Date.now() });
  } else {
    entry.count += 1;
  }
}

router.get("/users", (req, res) => {
  const users = db
    .prepare("SELECT username, name FROM users ORDER BY name")
    .all();
  res.json({ users });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Benutzername und Passwort sind erforderlich." });
  }

  const key = `${req.ip}:${username}`;
  if (tooManyAttempts(key)) {
    return res
      .status(429)
      .json({ error: "Zu viele Versuche. Bitte warte einige Minuten." });
  }

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

  if (!user || !verifyPassword(password, user.password_hash, user.password_salt)) {
    recordFailure(key);
    return res.status(401).json({ error: "Benutzername oder Passwort ist falsch." });
  }

  failures.delete(key);

  const token = jwt.sign(
    { sub: user.id, username: user.username, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: { id: user.id, username: user.username, name: user.name },
  });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
