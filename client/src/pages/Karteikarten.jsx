import { useEffect, useState } from 'react'
import { api } from '../api'
import Nav from '../components/Nav.jsx'
import StudyImage from '../components/StudyImage.jsx'

export default function Karteikarten() {
  const [buildings, setBuildings] = useState([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [suche, setSuche] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .listBuildings()
      .then((data) => setBuildings(shuffle(data.buildings)))
      .catch((err) => setError(err.message))
  }, [])

  // Searching turns the pile into a reference: type a name and the card is there.
  const treffer = suche.trim()
    ? buildings.filter((b) =>
        `${b.name} ${b.location || ''} ${b.architect || ''} ${b.style || ''}`
          .toLowerCase()
          .includes(suche.trim().toLowerCase())
      )
    : buildings

  function go(step) {
    setFlipped(false)
    setIndex((i) => (i + step + treffer.length) % treffer.length)
  }

  const card = treffer[Math.min(index, Math.max(treffer.length - 1, 0))]

  return (
    <div className="min-h-screen bg-[var(--flaeche)]">
      <Nav />

      <main className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[var(--text)]">Karteikarten</h2>
          {treffer.length > 0 && (
            <span className="text-xs text-[var(--text-schwach)]">
              {Math.min(index + 1, treffer.length)} / {treffer.length}
            </span>
          )}
        </div>

        <input
          value={suche}
          onChange={(e) => {
            setSuche(e.target.value)
            setIndex(0)
            setFlipped(false)
          }}
          placeholder="Suchen: Bauwerk, Ort, Architekt oder Stil"
          className="w-full mb-3 px-3 py-2.5 bg-[var(--karte)] border border-[var(--rand)] rounded-xl text-[15px] sm:text-sm outline-none focus:ring-1 focus:ring-[var(--knopf)]"
        />

        {error && <p className="text-sm text-[var(--rot)]">{error}</p>}
        {!error && !card && (
          <p className="text-sm text-[var(--text-leise)]">
            {buildings.length === 0 ? 'Wird geladen...' : 'Kein Bauwerk gefunden.'}
          </p>
        )}

        {card && (
          <>
            <button
              onClick={() => setFlipped((f) => !f)}
              className="w-full text-left bg-[var(--karte)] border border-[var(--rand)] rounded-2xl overflow-hidden hover:shadow-sm transition"
            >
              <div className="p-6 pb-0">
                <StudyImage src={card.image} />
              </div>

              <div className="px-6 pb-6">
                {!flipped ? (
                  <p className="text-sm text-[var(--text-schwach)]">
                    Welches Bauwerk ist das? Tippe auf die Karte für die Lösung.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text)]">{card.name}</h3>
                      <p className="text-sm text-[var(--text-leise)]">{card.location}</p>
                    </div>

                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                      <dt className="text-[var(--text-schwach)]">Architekt</dt>
                      <dd className="text-[var(--text)]">{card.architect}</dd>
                      <dt className="text-[var(--text-schwach)]">Jahr</dt>
                      <dd className="text-[var(--text)]">{card.year}</dd>
                      <dt className="text-[var(--text-schwach)]">Stil</dt>
                      <dd className="text-[var(--text)]">{card.style}</dd>
                    </dl>

                    <ul className="list-disc list-inside text-sm text-[var(--text-mittel)]">
                      {(card.features || []).map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </button>

            <div className="flex justify-between mt-5">
              <button
                onClick={() => go(-1)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-leise)] hover:text-[var(--text)] transition"
              >
                Vorherige
              </button>
              <button
                onClick={() => go(1)}
                className="px-5 py-2.5 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-medium hover:bg-[var(--knopf-tief)] transition"
              >
                Nächste
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function shuffle(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
