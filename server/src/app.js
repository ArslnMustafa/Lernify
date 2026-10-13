const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const examRoutes = require("./routes/exams");
const catalogRoutes = require("./routes/catalog");
const trainerRoutes = require("./routes/trainer");
const vergleichRoutes = require("./routes/vergleich");
const simulationRoutes = require("./routes/simulation");
const schreibenRoutes = require("./routes/schreiben");
const verwaltenRoutes = require("./routes/verwalten");

const app = express();

// OpenLiteSpeed proxies from localhost, so without this every request looks
// like it comes from 127.0.0.1 and the login throttle cannot tell callers apart.
app.set("trust proxy", "loopback");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/trainer", trainerRoutes);
app.use("/api/vergleich", vergleichRoutes);
app.use("/api/simulation", simulationRoutes);
app.use("/api/schreiben", schreibenRoutes);
app.use("/api/verwalten", verwaltenRoutes);

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
