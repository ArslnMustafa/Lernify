// Mails each user what is waiting for them today. Meant for a cron entry on
// the server, once a day:
//
//   0 8 * * *  cd /home/mustafaarslan.com/Lernify/server && /usr/bin/node scripts/erinnerung.js >> /tmp/lernify-erinnerung.log 2>&1
//
// Without RESEND_API_KEY and LOGIN_ALERT_TO in .env it only prints what it
// would have sent, so a dry run is safe.

const db = require("../src/db");
const { buildings } = require("../src/bauwerke");
const { RESEND_API_KEY, LOGIN_ALERT_TO, LOGIN_ALERT_FROM } = require("../src/config");

const FIRST_BOX = 1;

const jetzt = () => db.prepare("SELECT datetime('now') AS jetzt").get().jetzt;

function stand(userId) {
  const rows = db
    .prepare("SELECT item_key, box, due_at, wrong_count FROM trainer_progress WHERE user_id = ?")
    .all(userId);
  const fortschritt = new Map(rows.map((row) => [row.item_key, row]));
  const now = jetzt();

  let faellig = 0;
  let fehler = 0;
  let gelernt = 0;

  for (const bauwerk of buildings) {
    const eintrag = fortschritt.get(bauwerk.key);
    if (!eintrag?.due_at || eintrag.due_at <= now) faellig += 1;
    if ((eintrag?.wrong_count ?? 0) > 0) fehler += 1;
    if ((eintrag?.box ?? FIRST_BOX) === 3) gelernt += 1;
  }

  return { faellig, fehler, gelernt, gesamt: buildings.length };
}

const escape = (value) =>
  String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function senden(name, zahlen) {
  const html = `
    <div style="font-family:system-ui,sans-serif;color:#3d372c">
      <h2 style="margin:0 0 12px">Lernify: ${escape(name)}, heute warten ${zahlen.faellig} Karten</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        <tr><td style="color:#948773">Heute fällig</td><td><strong>${zahlen.faellig}</strong></td></tr>
        <tr><td style="color:#948773">Schon einmal falsch</td><td><strong>${zahlen.fehler}</strong></td></tr>
        <tr><td style="color:#948773">Gelernt</td><td><strong>${zahlen.gelernt} von ${zahlen.gesamt}</strong></td></tr>
      </table>
    </div>`;

  if (!RESEND_API_KEY || !LOGIN_ALERT_TO) {
    console.log(`[Probelauf] ${name}: ${zahlen.faellig} fällig, ${zahlen.fehler} Fehlerkarten`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: LOGIN_ALERT_FROM,
      to: LOGIN_ALERT_TO.split(",").map((address) => address.trim()),
      subject: `Lernify: ${zahlen.faellig} Karten für ${name}`,
      html,
    }),
  });

  if (!response.ok) {
    console.error(`Resend ${response.status}: ${(await response.text()).slice(0, 200)}`);
  } else {
    console.log(`${name}: Erinnerung verschickt (${zahlen.faellig} fällig).`);
  }
}

(async () => {
  const users = db.prepare("SELECT id, name FROM users ORDER BY id").all();

  for (const user of users) {
    const zahlen = stand(user.id);
    // Nothing to do, nothing to say.
    if (zahlen.faellig === 0) {
      console.log(`${user.name}: nichts fällig, keine Mail.`);
      continue;
    }
    await senden(user.name, zahlen);
  }
})();
