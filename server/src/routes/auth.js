const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { verifyPassword } = require("../password");
const { JWT_SECRET } = require("../config");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: "Kullanıcı adı ve şifre gerekli." });
  }

  const user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);

  if (!user || !verifyPassword(password, user.password_hash, user.password_salt)) {
    return res.status(401).json({ error: "Kullanıcı adı veya şifre hatalı." });
  }

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
