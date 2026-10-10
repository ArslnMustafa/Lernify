const app = require("./app");
const { PORT } = require("./config");

app.listen(PORT, () => {
  console.log(`Lernify API http://localhost:${PORT} adresinde çalışıyor`);
});
