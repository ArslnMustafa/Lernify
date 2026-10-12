const { RESEND_API_KEY, LOGIN_ALERT_TO, LOGIN_ALERT_FROM } = require("./config");
const { describeDevice, lookupLocation } = require("./clientinfo");

const RESEND_URL = "https://api.resend.com/emails";

const enabled = Boolean(RESEND_API_KEY && LOGIN_ALERT_TO);

if (!enabled) {
  console.log(
    "[Lernify] Anmelde-Benachrichtigung aus: RESEND_API_KEY und LOGIN_ALERT_TO fehlen in .env"
  );
}

const escape = (value) =>
  String(value ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function berlinTime(date) {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(date);
}

// Login must succeed even when the mail does not, so this never throws and is
// never awaited by the request.
async function sendLoginAlert({ name, username, ip, userAgent }) {
  if (!enabled) return;

  const location = await lookupLocation(ip);

  const rows = [
    ["Wer", `${name} (${username})`],
    ["Wann", berlinTime(new Date())],
    ["Ort", location || "unbekannt"],
    ["Gerät", describeDevice(userAgent) || "unbekannt"],
    ["IP", ip],
  ];

  const html = `
    <div style="font-family:system-ui,sans-serif;color:#3d372c">
      <h2 style="margin:0 0 12px">Anmeldung bei Lernify</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="color:#948773">${label}</td><td><strong>${escape(
                value
              )}</strong></td></tr>`
          )
          .join("")}
      </table>
      <p style="margin:16px 0 0;font-size:11px;color:#b8ab97">${escape(userAgent)}</p>
    </div>`;

  try {
    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: LOGIN_ALERT_FROM,
        to: LOGIN_ALERT_TO.split(",").map((address) => address.trim()),
        subject: `Lernify: ${name} hat sich angemeldet`,
        html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error(`[Lernify] Resend ${response.status}: ${detail.slice(0, 300)}`);
    }
  } catch (error) {
    console.error(`[Lernify] Resend nicht erreichbar: ${error.message}`);
  }
}

module.exports = { sendLoginAlert, loginAlertEnabled: enabled };
