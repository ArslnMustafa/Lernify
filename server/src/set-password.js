const db = require("./db");
const { hashPassword } = require("./password");

const [username, password] = process.argv.slice(2);

if (!username || !password) {
  console.error("Kullanım: node src/set-password.js kullaniciadi yenisifre");
  process.exit(1);
}

const { hash, salt } = hashPassword(password);
const info = db
  .prepare("UPDATE users SET password_hash = ?, password_salt = ? WHERE username = ?")
  .run(hash, salt, username);

if (info.changes === 0) {
  console.error(`Kullanıcı bulunamadı: ${username}`);
  process.exit(1);
}

console.log(`${username} kullanıcısının şifresi güncellendi.`);
