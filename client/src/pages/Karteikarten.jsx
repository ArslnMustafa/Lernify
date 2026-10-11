import { useEffect, useState } from 'react'
import { api } from '../api'
import Nav from '../components/Nav.jsx'
import StudyImage from '../components/StudyImage.jsx'

export default function Karteikarten() {
  const [buildings, setBuildings] = useState([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .listBuildings()
      .then((data) => setBuildings(shuffle(data.buildings)))
      .catch((err) => setError(err.message))
  }, [])

  function go(step) {
    setFlipped(false)
    setIndex((i) => (i + step + buildings.length) % buildings.length)
  }

  const card = buildings[index]

  return (
    <div className="min-h-screen bg-[#e9e0d2]">
      <Nav />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#24211a]">Karteikarten</h2>
          {buildings.length > 0 && (
            <span className="text-xs text-[#948773]">
              {index + 1} / {buildings.length}
            </span>
          )}
        </div>

        {error && <p className="text-sm text-[#8c4b3f]">{error}</p>}
        {!error && !card && <p className="text-sm text-[#736856]">Wird geladen...</p>}

        {card && (
          <>
            <button
              onClick={() => setFlipped((f) => !f)}
              className="w-full text-left bg-[#fdfaf4] border border-[#d9ccb6] rounded-2xl overflow-hidden hover:shadow-sm transition"
            >
              <div className="p-6 pb-0">
                <StudyImage src={card.image} />
              </div>

              <div className="px-6 pb-6">
                {!flipped ? (
                  <p className="text-sm text-[#948773]">
                    Welches Bauwerk ist das? Tippe auf die Karte für die Lösung.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-[#24211a]">{card.name}</h3>
                      <p className="text-sm text-[#736856]">{card.location}</p>
                    </div>

                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                      <dt className="text-[#948773]">Architekt</dt>
                      <dd className="text-[#24211a]">{card.architect}</dd>
                      <dt className="text-[#948773]">Jahr</dt>
                      <dd className="text-[#24211a]">{card.year}</dd>
                      <dt className="text-[#948773]">Stil</dt>
                      <dd className="text-[#24211a]">{card.style}</dd>
                    </dl>

                    <ul className="list-disc list-inside text-sm text-[#595042]">
                      {card.features.map((feature) => (
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
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#736856] hover:text-[#24211a] transition"
              >
                Vorherige
              </button>
              <button
                onClick={() => go(1)}
                className="px-5 py-2.5 rounded-xl bg-[#3d372c] text-[#e9e0d2] text-sm font-medium hover:bg-[#24211a] transition"
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
