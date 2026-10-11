const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const examRoutes = require("./routes/exams");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// In production the built client lives here; in development Vite serves it instead.
const PUBLIC_DIR = path.join(__dirname, "..", "public");

if (fs.existsSync(path.join(PUBLIC_DIR, "index.html"))) {
  app.use(express.static(PUBLIC_DIR));

  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    res.sendFile(path.join(PUBLIC_DIR, "index.html"));
  });
}

module.exports = app;
