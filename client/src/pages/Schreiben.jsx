import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import Nav from '../components/Nav.jsx'
import StudyImage from '../components/StudyImage.jsx'

export default function Schreiben() {
  const [aufgabe, setAufgabe] = useState(null)
  const [text, setText] = useState('')
  const [loesung, setLoesung] = useState(null)
  const [treffer, setTreffer] = useState([])
  const [bewertet, setBewertet] = useState(null)
  const [statistik, setStatistik] = useState(null)
  const [error, setError] = useState('')

  const ladeStatistik = useCallback(() => {
    api.schreibStatistik().then(setStatistik).catch(() => {})
  }, [])

  const naechste = useCallback(async () => {
    setText('')
    setLoesung(null)
    setTreffer([])
    setBewertet(null)
    setError('')
    try {
      setAufgabe(await api.schreibNaechste())
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    naechste()
    ladeStatistik()
  }, [naechste, ladeStatistik])

  async function aufdecken() {
    try {
      const data = await api.schreibLoesung(aufgabe.karte.key)
      setLoesung(data.loesung)
    } catch (err) {
      setError(err.message)
    }
  }

  async function speichern() {
    try {
      setBewertet(await api.schreibBewerten(aufgabe.karte.key, treffer))
      ladeStatistik()
    } catch (err) {
      setError(err.message)
    }
  }

  const umschalten = (id) =>
    setTreffer((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  return (
    <div className="min-h-screen bg-[#e9e0d2]">
      <Nav />

      <main className="max-w-2xl mx-auto px-3 sm:px-6 py-3 sm:py-8">
        {error && <p className="text-sm text-[#8c4b3f] mb-3">{error}</p>}

        {aufgabe && (
          <>
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="text-sm font-bold text-[#24211a]">Schreiben</h2>
              <span className="text-[11px] text-[#948773]">
                {aufgabe.geschrieben} von {aufgabe.gesamt} Karten geschrieben
              </span>
            </div>

            <div className="bg-[#fdfaf4] border border-[#d9ccb6] rounded-2xl p-3.5 sm:p-6">
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <h3 className="text-[15px] sm:text-base font-bold text-[#24211a]">
                  {aufgabe.karte.name}
                </h3>
                {aufgabe.karte.altklausur && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f1e9dc] border border-[#d9ccb6] text-[#595042] whitespace-nowrap">
                    Altklausur
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#948773] mb-3">{aufgabe.karte.meta}</p>

              <StudyImage src={aufgabe.karte.image} />

              <p className="text-[13px] text-[#736856] mb-2">
                Beschreibe das Bauwerk mit vier Aussagen: Bildmerkmale, Form/Raum,
                Konstruktion/Wirkung und Einordnung.
              </p>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                placeholder="Schreib deine Antwort..."
                className="w-full p-3 bg-[#f1e9dc]/50 border border-[#d9ccb6] rounded-xl text-[15px] sm:text-sm outline-none text-[#24211a] focus:ring-1 focus:ring-[#3d372c] transition resize-none"
              />

              {!loesung && (
                <button
                  onClick={aufdecken}
                  className="mt-3 px-4 py-2.5 rounded-xl bg-[#3d372c] text-[#e9e0d2] text-sm font-medium hover:bg-[#24211a] transition"
                >
                  Musterlösung zeigen
                </button>
              )}

              {loesung && (
                <div className="mt-4 flex flex-col gap-2">
                  <p className="text-[11px] uppercase tracking-wide text-[#948773]">
                    Hake ab, was du geschrieben hast
                  </p>

                  {loesung.map((teil) => {
                    const an = treffer.includes(teil.id)
                    return (
                      <button
                        key={teil.id}
                        onClick={() => !bewertet && umschalten(teil.id)}
                        disabled={!!bewertet}
                        className={`text-left rounded-xl border px-3 py-2.5 transition ${
                          an
                            ? 'bg-[#6b7250]/15 border-[#6b7250]'
                            : 'bg-[#f1e9dc]/40 border-[#d9ccb6] hover:border-[#b8ab97]'
                        }`}
                      >
                        <span className="flex items-center gap-2 mb-1">
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                              an
                                ? 'bg-[#6b7250] border-[#6b7250] text-[#f7f4ef]'
                                : 'border-[#b8ab97] text-transparent'
                            }`}
                          >
                            ✓
                          </span>
                          <span className="text-[12px] font-bold text-[#24211a]">{teil.titel}</span>
                        </span>
                        <span className="block text-[13px] text-[#4a4336]">{teil.text}</span>
                      </button>
                    )
                  })}

                  {!bewertet ? (
                    <button
                      onClick={speichern}
                      className="self-start mt-2 px-4 py-2.5 rounded-xl bg-[#6b7250] text-[#f7f4ef] text-sm font-semibold hover:bg-[#5a6143] transition"
                    >
                      {treffer.length} / {loesung.length} — speichern
                    </button>
                  ) : (
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-[13px] text-[#736856]">
                        {bewertet.punkte} von {bewertet.von} Aussagen hattest du.
                      </p>
                      <button
                        onClick={naechste}
                        className="px-5 py-2.5 rounded-xl bg-[#3d372c] text-[#e9e0d2] text-sm font-medium hover:bg-[#24211a] transition whitespace-nowrap"
                      >
                        Nächste Karte
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {statistik && statistik.versuche > 0 && <Auswertung statistik={statistik} />}
      </main>
    </div>
  )
}

// Which of the four is the one that keeps getting left out.
function Auswertung({ statistik }) {
  const [offen, setOffen] = useState(false)

  return (
    <div className="mt-3 bg-[#fdfaf4] border border-[#d9ccb6] rounded-2xl p-4">
      <button
        onClick={() => setOffen((value) => !value)}
        className="text-[13px] sm:text-xs font-semibold text-[#595042] hover:text-[#24211a]"
      >
        {offen ? 'Auswertung ausblenden' : `Auswertung · Schnitt ${Math.round(statistik.schnitt * 100)}%`}
      </button>

      {offen && (
        <div className="mt-3 flex flex-col gap-2">
          {statistik.bausteine.map((baustein) => {
            const prozent = Math.round(baustein.quote * 100)
            return (
              <div key={baustein.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[13px] sm:text-xs text-[#4a4336]">{baustein.titel}</span>
                  <span className="text-[11px] text-[#948773]">
                    {prozent}% · {baustein.treffer}/{baustein.versuche}
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded bg-[#e9e0d2] overflow-hidden">
                  <div
                    className={`h-full rounded ${
                      prozent >= 80 ? 'bg-[#6b7250]' : prozent >= 50 ? 'bg-[#b08968]' : 'bg-[#8c4b3f]'
                    }`}
                    style={{ width: `${Math.max(prozent, 3)}%` }}
                  />
                </div>
              </div>
            )
          })}

          <p className="text-[11px] text-[#948773] mt-1">
            {statistik.karten} von {statistik.gesamt} Karten geschrieben, {statistik.versuche}{' '}
            Versuche. Der schwächste Baustein steht oben.
          </p>
        </div>
      )}
    </div>
  )
}
