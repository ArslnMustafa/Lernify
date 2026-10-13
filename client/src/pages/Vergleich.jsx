import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import Nav from '../components/Nav.jsx'

export default function Vergleich() {
  const [pairs, setPairs] = useState([])
  const [chosen, setChosen] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .listVergleiche()
      .then((data) => setPairs(data.vergleiche))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="min-h-screen bg-[#e9e0d2]">
      <Nav />

      <main className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <h2 className="text-base sm:text-lg font-bold text-[#24211a] mb-1">Vergleich</h2>
        <p className="text-xs text-[#736856] mb-6">
          Zwei Bauwerke nebeneinander: Erkenne, auf welches von beiden eine Aussage zutrifft.
        </p>

        {error && <p className="text-sm text-[#8c4b3f] mb-4">{error}</p>}

        {chosen ? (
          <Runde id={chosen} onBack={() => setChosen(null)} />
        ) : (
          <div className="flex flex-col gap-3">
            {pairs.map((pair) => (
              <button
                key={pair.id}
                onClick={() => setChosen(pair.id)}
                className="text-left bg-[#fdfaf4] border border-[#d9ccb6] rounded-2xl p-4 hover:border-[#b8ab97] transition"
              >
                <p className="text-sm font-bold text-[#24211a]">{pair.thema}</p>
                <p className="text-xs text-[#736856] mt-1 mb-3">{pair.frage}</p>

                <div className="grid grid-cols-2 gap-3">
                  {[pair.a, pair.b].map((seite) => (
                    <div key={seite.name}>
                      <Bild src={seite.image} className="h-24" />
                      <p className="text-xs font-semibold text-[#24211a] mt-1.5">{seite.name}</p>
                      <p className="text-[11px] text-[#948773]">
                        {[seite.ort, seite.jahr].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-[#948773] mt-3">{pair.fragen} Aussagen</p>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function Runde({ id, onBack }) {
  const [pair, setPair] = useState(null)
  const [frage, setFrage] = useState(null)
  const [gestellt, setGestellt] = useState([])
  const [picked, setPicked] = useState(null)
  const [result, setResult] = useState(null)
  const [score, setScore] = useState({ richtig: 0, gesamt: 0 })
  const [tabelle, setTabelle] = useState(false)
  const [error, setError] = useState('')

  const naechste = useCallback(
    async (bisher) => {
      setPicked(null)
      setResult(null)
      try {
        const data = await api.vergleichFrage(id, bisher)
        setFrage(data.frage)
      } catch (err) {
        setError(err.message)
      }
    },
    [id]
  )

  useEffect(() => {
    api
      .getVergleich(id)
      .then((data) => setPair(data.vergleich))
      .catch((err) => setError(err.message))
    naechste([])
  }, [id, naechste])

  async function antworten(wert) {
    if (result) return
    setPicked(wert)
    try {
      const data = await api.vergleichAntwort({ id, index: frage.index, antwort: wert })
      setResult(data)
      setGestellt((prev) => [...prev, frage.index])
      setScore((prev) => ({
        richtig: prev.richtig + (data.correct ? 1 : 0),
        gesamt: prev.gesamt + 1,
      }))
    } catch (err) {
      setError(err.message)
    }
  }

  if (!pair) return <p className="text-sm text-[#736856]">{error || 'Wird geladen...'}</p>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <button onClick={onBack} className="text-xs text-[#736856] hover:text-[#24211a]">
          ← Andere Paarung
        </button>
        <span className="text-xs text-[#948773]">
          {score.richtig} / {score.gesamt} richtig
        </span>
      </div>

      <div className="bg-[#fdfaf4] border border-[#d9ccb6] rounded-2xl p-4">
        <div className="grid grid-cols-2 gap-4">
          {[pair.a, pair.b].map((seite) => (
            <div key={seite.name}>
              <Bild src={seite.image} className="h-28 sm:h-40" />
              <p className="text-sm font-bold text-[#24211a] mt-2">{seite.name}</p>
              <p className="text-[11px] text-[#736856]">{seite.architekt || '—'}</p>
              <p className="text-[11px] text-[#948773]">
                {[seite.ort, seite.jahr].filter(Boolean).join(' · ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-[#8c4b3f]">{error}</p>}

      {frage ? (
        <div className="bg-[#fdfaf4] border border-[#d9ccb6] rounded-2xl p-4 sm:p-6">
          <p className="text-[11px] uppercase tracking-wide text-[#948773] mb-2">
            {frage.aspekt}
          </p>
          <h3 className="text-sm font-bold text-[#24211a] mb-3 sm:mb-5">{frage.text}</h3>

          <div className="flex flex-col gap-1.5 sm:gap-2">
            {frage.optionen.map((option) => {
              const isAnswer = result && option.wert === result.gilt
              const isWrongPick = result && option.wert === picked && !result.correct

              let tone = 'bg-[#f1e9dc]/50 text-[#24211a] border-[#d9ccb6]'
              if (isAnswer) tone = 'bg-[#6b7250] text-[#f7f4ef] border-[#6b7250]'
              else if (isWrongPick) tone = 'bg-[#8c4b3f] text-[#f7f4ef] border-[#8c4b3f]'
              else if (!result) tone += ' hover:border-[#b8ab97]'

              return (
                <button
                  key={option.wert}
                  onClick={() => antworten(option.wert)}
                  disabled={!!result}
                  className={`text-left px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl text-[13px] sm:text-sm border transition ${tone}`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>

          {result && (
            <div className="mt-5 flex flex-col gap-3">
              <p className="text-xs text-[#736856]">
                {result.correct ? 'Richtig.' : `Leider falsch — richtig ist ${result.richtig}.`}
              </p>

              {result.gegenstueck && (
                <div className="bg-[#f1e9dc]/60 border border-[#d9ccb6] rounded-xl px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-[#948773] mb-1">
                    Dagegen {result.gegenstueckLabel}
                  </p>
                  <p className="text-xs text-[#4a4336]">{result.gegenstueck}</p>
                </div>
              )}

              <button
                onClick={() => naechste([...gestellt, frage.index])}
                className="self-start bg-[#3d372c] text-[#e9e0d2] text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#24211a] transition"
              >
                Nächste Aussage
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#fdfaf4] border border-[#d9ccb6] rounded-2xl p-8 text-center">
          <p className="text-sm text-[#24211a] font-semibold mb-1">Paarung durchgearbeitet.</p>
          <p className="text-xs text-[#736856] mb-4">
            {score.richtig} von {score.gesamt} Aussagen richtig zugeordnet.
          </p>
          <button
            onClick={() => {
              setGestellt([])
              setScore({ richtig: 0, gesamt: 0 })
              naechste([])
            }}
            className="bg-[#3d372c] text-[#e9e0d2] text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#24211a] transition"
          >
            Noch einmal
          </button>
        </div>
      )}

      <div className="bg-[#fdfaf4] border border-[#d9ccb6] rounded-2xl p-4">
        <button
          onClick={() => setTabelle((value) => !value)}
          className="text-xs font-semibold text-[#595042] hover:text-[#24211a]"
        >
          {tabelle ? 'Vergleichstabelle ausblenden' : 'Vergleichstabelle anzeigen'}
        </button>

        {tabelle && (
          <div className="mt-4 flex flex-col gap-4">
            {pair.aspekte.map((aspekt) => (
              <div key={aspekt.aspekt}>
                <p className="text-[11px] uppercase tracking-wide text-[#948773] mb-1.5">
                  {aspekt.aspekt}
                </p>
                <div className="grid sm:grid-cols-2 gap-2">
                  <p className="text-xs text-[#4a4336] bg-[#f1e9dc]/60 border border-[#d9ccb6] rounded-xl px-3 py-2">
                    <strong className="block text-[#24211a] mb-0.5">{pair.a.name}</strong>
                    {aspekt.a}
                  </p>
                  <p className="text-xs text-[#4a4336] bg-[#f1e9dc]/60 border border-[#d9ccb6] rounded-xl px-3 py-2">
                    <strong className="block text-[#24211a] mb-0.5">{pair.b.name}</strong>
                    {aspekt.b}
                  </p>
                </div>
              </div>
            ))}

            <div>
              <p className="text-[11px] uppercase tracking-wide text-[#948773] mb-1.5">
                Gemeinsamkeiten
              </p>
              <ul className="flex flex-col gap-1.5">
                {pair.gemeinsam.map((satz) => (
                  <li
                    key={satz}
                    className="text-xs text-[#4a4336] bg-[#f1e9dc]/60 border border-[#d9ccb6] rounded-xl px-3 py-2"
                  >
                    {satz}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Small, fixed frame: the two pictures have to line up next to each other.
function Bild({ src, className }) {
  if (!src) {
    return (
      <div className={`${className} w-full rounded-xl bg-[#f1e9dc] border border-[#d9ccb6]`} />
    )
  }
  return (
    <div className={`${className} w-full rounded-xl bg-[#f1e9dc] border border-[#d9ccb6] overflow-hidden`}>
      <img
        src={src}
        alt=""
        loading="lazy"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
    </div>
  )
}
