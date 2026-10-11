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
    <div className="min-h-screen bg-[#f2eee9]">
      <Nav />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-bold text-[#24211a]">
            Theorie — Fragen und Antworten
          </h2>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen..."
            className="px-3.5 py-2 bg-white border border-[#e8e2d5] rounded-xl text-sm outline-none text-[#24211a] placeholder:text-[#b8ab97] focus:ring-1 focus:ring-[#3d372c] transition sm:w-56"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {!error && theory.length === 0 && (
          <p className="text-sm text-[#736856]">Wird geladen...</p>
        )}
        {theory.length > 0 && visible.length === 0 && (
          <p className="text-sm text-[#736856]">Keine Treffer.</p>
        )}

        <div className="flex flex-col gap-2">
          {visible.map((item, i) => (
            <div
              key={item.id}
              className="bg-white border border-[#e8e2d5] rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpen((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-[#f5f2eb]/60 transition"
              >
                <span className="text-xs font-semibold text-[#b8ab97] mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-[#24211a] flex-1">
                  {item.question}
                </span>
                <span className="text-[#b8ab97] text-xs mt-0.5">
                  {open[item.id] ? '−' : '+'}
                </span>
              </button>

              {open[item.id] && (
                <div
                  className="px-5 pb-5 pt-1 text-sm text-[#3d372c] leading-relaxed border-t border-[#f0ebe1] [&_b]:font-semibold [&_i]:italic"
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
