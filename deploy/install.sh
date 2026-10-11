#!/usr/bin/env bash
# Lernify kurulum betiği (CyberPanel + PM2 olan sunucular için).
# Calistirma:  bash install.sh
set -euo pipefail

REPO_URL="https://github.com/ArslnMustafa/Lernify.git"
BRANCH="${LERNIFY_BRANCH:-main}"
BASE_DIR="${LERNIFY_BASE_DIR:-/home/mustafaarslan.com}"
APP_DIR="$BASE_DIR/Lernify"
PM2_NAME="lernify"
PORT="${PORT:-4000}"

say() { printf "\n\033[1m==> %s\033[0m\n" "$1"; }
fail() { printf "\n\033[31mHATA: %s\033[0m\n" "$1" >&2; exit 1; }

say "Gereksinimler kontrol ediliyor"
command -v git >/dev/null || fail "git kurulu degil."
command -v node >/dev/null || fail "node kurulu degil."
command -v npm >/dev/null || fail "npm kurulu degil."
command -v pm2 >/dev/null || fail "pm2 kurulu degil."

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
NODE_MINOR=$(node -p "process.versions.node.split('.')[1]")
if [ "$NODE_MAJOR" -lt 22 ] || { [ "$NODE_MAJOR" -eq 22 ] && [ "$NODE_MINOR" -lt 5 ]; }; then
  fail "Node 22.5 veya ustu gerekiyor. Mevcut: $(node -v)"
fi
echo "Node $(node -v), pm2 $(pm2 -v) bulundu."

# Already-installed app holds the port itself, so only check it on a fresh install.
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  APP_EXISTS=1
  echo "Mevcut $PM2_NAME uygulamasi bulundu, guncellenecek."
else
  APP_EXISTS=0
  if ! node -e '
    const net = require("net");
    const s = net.createServer();
    s.once("error", (e) => process.exit(e.code === "EADDRINUSE" ? 1 : 0));
    s.once("listening", () => s.close(() => process.exit(0)));
    s.listen(Number(process.argv[1]), "0.0.0.0");
  ' "$PORT"; then
    fail "$PORT portu dolu. Baska bir port icin:  PORT=4001 bash install.sh"
  fi
  echo "$PORT portu bos."
fi

[ -d "$BASE_DIR" ] || fail "$BASE_DIR dizini yok. LERNIFY_BASE_DIR ile farkli bir dizin verebilirsin."

say "Kod indiriliyor"
if [ -d "$APP_DIR/.git" ]; then
  echo "Mevcut kurulum bulundu, guncelleniyor."
  git -C "$APP_DIR" fetch origin "$BRANCH"
  git -C "$APP_DIR" checkout "$BRANCH"
  git -C "$APP_DIR" pull origin "$BRANCH"
else
  [ -e "$APP_DIR" ] && fail "$APP_DIR zaten var ama git deposu degil. Once onu tasiyin."
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

say "Bagimliliklar kuruluyor"
cd "$APP_DIR/server"
npm install --omit=dev --no-audit --no-fund

if [ -f "lernify.db" ]; then
  say "Veritabani zaten var, dokunulmuyor"
  echo "Sifirdan kurmak istersen once lernify.db dosyasini sil."
else
  say "Veritabani olusturuluyor"
  node src/seed.js
fi

say "PM2 ile baslatiliyor"
if [ "$APP_EXISTS" -eq 1 ]; then
  PORT="$PORT" pm2 restart "$PM2_NAME" --update-env
else
  PORT="$PORT" pm2 start src/index.js --name "$PM2_NAME"
fi
pm2 save

sleep 2
say "Kontrol"
if ! node -e '
  fetch("http://127.0.0.1:" + process.argv[1] + "/api/health")
    .then((r) => process.exit(r.ok ? 0 : 1))
    .catch(() => process.exit(1));
' "$PORT"; then
  fail "Uygulama yanit vermiyor. Loglar:  pm2 logs $PM2_NAME"
fi
echo "Lernify calisiyor: http://127.0.0.1:$PORT"

cat <<INFO

================================================
 Kurulum tamam.
 Dizin : $APP_DIR
 Port  : $PORT
 PM2   : $PM2_NAME

 SIRADAKI ADIM - sifreleri degistir (demo sifreler herkese acik):
   cd $APP_DIR/server
   node src/set-password.js zeynep YENI_SIFRE
   node src/set-password.js mustafa YENI_SIFRE

 Alan adina baglamak icin CyberPanel uzerinden
 reverse proxy kurulacak (127.0.0.1:$PORT adresine).
================================================
INFO
