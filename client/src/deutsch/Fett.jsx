// **so** geschriebene Stellen in den Grammatik-Erklaerungen fett zeigen
export default function Fett({ text }) {
  return text.split('**').map((teil, i) =>
    i % 2 ? (
      <strong key={i} className="font-bold text-[var(--text)]">{teil}</strong>
    ) : (
      <span key={i}>{teil}</span>
    )
  )
}
