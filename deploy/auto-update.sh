#!/usr/bin/env bash
# Holt neue Commits und bringt die Seite auf diesen Stand. Gedacht für einen
# Cron-Eintrag auf dem Server, damit eine Änderung vom Handy von selbst live
# geht:
#
#   */2 * * * * /home/mustafaarslan.com/Lernify/deploy/auto-update.sh >> /var/log/lernify-update.log 2>&1
#
# Wenn die Seite nach dem Neustart nicht antwortet, geht der alte Stand
# zurück an den Platz - lieber die vorige Version als gar keine.
set -uo pipefail

APP_DIR="${LERNIFY_APP_DIR:-/home/mustafaarslan.com/Lernify}"
BRANCH="${LERNIFY_BRANCH:-main}"
RESTART="${LERNIFY_RESTART:-pm2 restart lernify --update-env}"
HEALTH_URL="${LERNIFY_HEALTH_URL:-http://127.0.0.1:4000/api/health}"
VERSUCHE="${LERNIFY_HEALTH_TRIES:-5}"

sag() { printf '%s  %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1"; }

cd "$APP_DIR" 2>/dev/null || { sag "FEHLER: $APP_DIR gibt es nicht."; exit 1; }

if ! git diff --quiet || ! git diff --cached --quiet; then
  sag "ABBRUCH: im Verzeichnis liegen eigene Änderungen, die ein Update überschreiben würde."
  exit 1
fi

git fetch --quiet origin "$BRANCH" || { sag "FEHLER: git fetch ging nicht."; exit 1; }

ALT="$(git rev-parse HEAD)"
NEU="$(git rev-parse "origin/$BRANCH")"

# Der häufigste Fall: es gibt nichts Neues. Dann auch keine Zeile im Log.
[ "$ALT" = "$NEU" ] && exit 0

sag "Neuer Stand: ${ALT:0:7} -> ${NEU:0:7}"
git log --oneline "$ALT..$NEU" | sed 's/^/           /'

if ! git merge --ff-only "origin/$BRANCH" --quiet; then
  sag "FEHLER: kein Schnellvorlauf möglich (lokale Commits?). Von Hand nachsehen."
  exit 1
fi

# Die gebaute Oberfläche liegt im Repo, nur die Server-Pakete können neu sein.
if ! git diff --quiet "$ALT" "$NEU" -- server/package-lock.json server/package.json; then
  sag "Server-Pakete haben sich geändert, npm install laeuft."
  (cd server && npm install --omit=dev --no-audit --no-fund >/dev/null) \
    || { sag "FEHLER: npm install."; }
fi

sag "Neustart: $RESTART"
$RESTART >/dev/null 2>&1 || sag "WARNUNG: Neustart meldete einen Fehler."

gesund() {
  for _ in $(seq "$VERSUCHE"); do
    sleep 2
    curl -fsS --max-time 8 "$HEALTH_URL" >/dev/null 2>&1 && return 0
  done
  return 1
}

if gesund; then
  sag "Seite läuft auf ${NEU:0:7}."
  exit 0
fi

sag "Seite antwortet nicht - zurück auf ${ALT:0:7}."
git reset --hard "$ALT" --quiet
$RESTART >/dev/null 2>&1

if gesund; then
  sag "Alter Stand läuft wieder. Der neue Commit bleibt im Repo, aber nicht auf der Seite."
else
  sag "FEHLER: Seite antwortet auch mit dem alten Stand nicht. pm2 logs ansehen."
fi
exit 1
