const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Du musst angemeldet sein." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, username: payload.username, name: payload.name };
    next();
  } catch {
    return res.status(401).json({ error: "Sitzung ungültig oder abgelaufen." });
  }
}

module.exports = { requireAuth };
