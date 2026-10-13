const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { verifyPassword } = require("../password");
const { JWT_SECRET } = require("../config");
const { requireAuth } = require("../middleware/auth");
const { sendLoginAlert } = require("../notify");

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

// A session lasts seven days, so most visits never reach /login. The owner
// wants to hear about those too — but one page load may ask who it is more
// than once, and that is one visit, not two.
const SAME_VISIT_MS = 60 * 1000;
const lastSeen = new Map();

function isSameVisit(key) {
  const now = Date.now();
  const previous = lastSeen.get(key);
  lastSeen.set(key, now);

  // Keep the map from growing forever on a long-running server.
  if (lastSeen.size > 500) {
    for (const [entry, seen] of lastSeen) {
      if (now - seen > SAME_VISIT_MS) lastSeen.delete(entry);
    }
  }

  return previous !== undefined && now - previous < SAME_VISIT_MS;
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
    return res.status(400).json({ error: "Name und PIN sind erforderlich." });
  }

  const key = `${req.ip}:${username.toLowerCase()}`;
  if (tooManyAttempts(key)) {
    return res
      .status(429)
      .json({ error: "Zu viele Versuche. Bitte warte einige Minuten." });
  }

  // The login screen shows display names, so accept either spelling.
  const user = db
    .prepare(
      "SELECT * FROM users WHERE lower(username) = lower(?) OR lower(name) = lower(?)"
    )
    .get(username, username);

  if (!user || !verifyPassword(password, user.password_hash, user.password_salt)) {
    recordFailure(key);
    return res.status(401).json({ error: "Name oder PIN ist falsch." });
  }

  failures.delete(key);

  // A fresh sign-in always counts, and it starts the visit window.
  isSameVisit(`${user.username}:${req.ip}:${req.get("user-agent")}`);

  sendLoginAlert({
    name: user.name,
    username: user.username,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    anlass: "anmeldung",
  });

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
  const userAgent = req.get("user-agent");

  if (!isSameVisit(`${req.user.username}:${req.ip}:${userAgent}`)) {
    sendLoginAlert({
      name: req.user.name,
      username: req.user.username,
      ip: req.ip,
      userAgent,
      anlass: "geoeffnet",
    });
  }

  res.json({ user: req.user });
});

module.exports = router;
