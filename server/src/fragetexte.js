// The exact wording of every generated question, in one place. The seed writes
// these texts, and scripts/apply-images.js recognises questions by them when
// they were created before questions carried their origin (source_key).

const architektenFrage = (building) =>
  `Wer ist der Architekt des Bauwerks "${building.name}" (${building.location}, ${building.year})?`;

const theorieFrage = (item) => item.q.replace(/^\d+\.\s*/, "");

const rueckblickFrage = (card) =>
  `„${card.name}" (${card.meta}) — beschreibe das Bauwerk mit mindestens vier Aussagen: Baukörper/Form, Material/Konstruktion, Fassade/Raum/Städtebau, Einordnung/Bedeutung.`;

const epochenFrage = (epoch) => `In welchen Zeitraum fällt die Epoche „${epoch.epoche}"?`;

module.exports = { architektenFrage, theorieFrage, rueckblickFrage, epochenFrage };
