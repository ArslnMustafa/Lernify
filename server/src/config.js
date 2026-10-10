const JWT_SECRET = process.env.JWT_SECRET || "lernify-dev-secret-change-me";

if (!process.env.JWT_SECRET) {
  console.warn(
    "[Lernify] JWT_SECRET env var is not set, using an insecure dev default. Set JWT_SECRET in production."
  );
}

module.exports = {
  JWT_SECRET,
  PORT: process.env.PORT || 4000,
};
