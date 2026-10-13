import { useEffect, useState } from 'react'
import { api } from '../api'
import Nav from '../components/Nav.jsx'

export default function Theorie() {
  const [theory, setTheory] = useState([])
  const [open, setOpen] = useState({})
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .listTheory()
      .then((data) => setTheory(data.theory))
      .catch((err) => setError(err.message))
  }, [])

  const needle = query.trim().toLowerCase()
  const visible = needle
    ? theory.filter(
        (item) =>
          item.question.toLowerCase().includes(needle) ||
          item.answer.toLowerCase().includes(needle)
      )
    : theory

  return (
    <div className="min-h-screen bg-[var(--flaeche)]">
      <Nav />

      <main className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-bold text-[var(--text)]">
            Theorie — Fragen und Antworten
          </h2>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen..."
            className="px-3.5 py-2 bg-[var(--karte)] border border-[var(--rand)] rounded-xl text-sm outline-none text-[var(--text)] placeholder:text-[var(--rand-stark)] focus:ring-1 focus:ring-[var(--knopf)] transition sm:w-56"
          />
        </div>

        {error && <p className="text-sm text-[var(--rot)]">{error}</p>}
        {!error && theory.length === 0 && (
          <p className="text-sm text-[var(--text-leise)]">Wird geladen...</p>
        )}
        {theory.length > 0 && visible.length === 0 && (
          <p className="text-sm text-[var(--text-leise)]">Keine Treffer.</p>
        )}

        <div className="flex flex-col gap-1.5 sm:gap-2">
          {visible.map((item, i) => (
            <div
              key={item.id}
              className="bg-[var(--karte)] border border-[var(--rand)] rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpen((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-[var(--feld)]/60 transition"
              >
                <span className="text-xs font-semibold text-[var(--rand-stark)] mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-[var(--text)] flex-1">
                  {item.question}
                </span>
                <span className="text-[var(--rand-stark)] text-xs mt-0.5">
                  {open[item.id] ? '−' : '+'}
                </span>
              </button>

              {open[item.id] && (
                <div
                  className="px-5 pb-5 pt-1 text-sm text-[var(--knopf)] leading-relaxed border-t border-[var(--feld)] [&_b]:font-semibold [&_i]:italic"
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
