import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import Nav from '../components/Nav.jsx'

export default function Verwalten() {
  return (
    <div className="min-h-screen bg-[var(--flaeche)]">
      <Nav />

      <main className="max-w-2xl mx-auto px-3 sm:px-6 py-3 sm:py-8 flex flex-col gap-3">
        <h2 className="text-sm font-bold text-[var(--text)]">Verwalten</h2>
        <Bauwerke />
        <Fortschritt />
        <Pin />
      </main>
    </div>
  )
}

const FELDER = [
  { id: 'name', titel: 'Name' },
  { id: 'location', titel: 'Ort' },
  { id: 'architect', titel: 'Architekt' },
  { id: 'year', titel: 'Zeitraum' },
  { id: 'style', titel: 'Stil / Thema' },
  { id: 'image', titel: 'Bildadresse' },
  { id: 'bildmerkmale', titel: 'Bildmerkmale' },
]

// Wrong picture, wrong architect, a typo: correcting it here beats waiting for
// the next deployment.
function Bauwerke() {
  const [suche, setSuche] = useState('')
  const [treffer, setTreffer] = useState([])
  const [offen, setOffen] = useState(null)
  const [entwurf, setEntwurf] = useState({})
  const [hinweis, setHinweis] = useState('')
  const [error, setError] = useState('')

  const laden = useCallback(async (text) => {
    try {
      const data = await api.verwaltenBauwerke(text)
      setTreffer(data.bauwerke)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    const warten = setTimeout(() => laden(suche), 250)
    return () => clearTimeout(warten)
  }, [suche, laden])

  function oeffnen(bauwerk) {
    setHinweis('')
    setOffen(bauwerk.key === offen ? null : bauwerk.key)
    setEntwurf(Object.fromEntries(FELDER.map(({ id }) => [id, bauwerk[id] || ''])))
  }

  async function speichern(key) {
    setError('')
    try {
      const data = await api.verwaltenBauwerkSpeichern({ key, ...entwurf })
      setTreffer((prev) => prev.map((b) => (b.key === key ? data.bauwerk : b)))
      setHinweis('Gespeichert.')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="bg-[var(--karte)] border border-[var(--rand)] rounded-2xl p-4">
      <h3 className="text-[13px] font-bold text-[var(--text)] mb-1">Bauwerke bearbeiten</h3>
      <p className="text-[11px] text-[var(--text-schwach)] mb-3">
        Änderungen gelten sofort — auch für Training, Vergleich und Simulation.
      </p>

      <input
        value={suche}
        onChange={(e) => setSuche(e.target.value)}
        placeholder="Suchen: Name, Ort oder Architekt"
        className="w-full px-3 py-2.5 bg-[var(--feld)]/50 border border-[var(--rand)] rounded-xl text-[15px] sm:text-sm outline-none focus:ring-1 focus:ring-[var(--knopf)]"
      />

      {error && <p className="text-[12px] text-[var(--rot)] mt-2">{error}</p>}

      <div className="mt-3 flex flex-col gap-1.5">
        {treffer.map((bauwerk) => (
          <div key={bauwerk.key}>
            <button
              onClick={() => oeffnen(bauwerk)}
              className="w-full flex items-center gap-3 text-left px-3 py-2 rounded-xl border border-[var(--rand)] bg-[var(--feld)]/40 hover:border-[var(--rand-stark)] transition"
            >
              <span className="w-10 h-10 rounded-lg bg-[var(--flaeche)] overflow-hidden shrink-0">
                {bauwerk.image && (
                  <img
                    src={bauwerk.image}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-[var(--text)] truncate">
                  {bauwerk.name}
                </span>
                <span className="block text-[11px] text-[var(--text-schwach)] truncate">
                  {[bauwerk.architect, bauwerk.year, bauwerk.herkunft].filter(Boolean).join(' · ')}
                </span>
              </span>
            </button>

            {offen === bauwerk.key && (
              <div className="mt-1.5 mb-2 px-3 py-3 rounded-xl border border-[var(--rand)] bg-[var(--feld)]/25 flex flex-col gap-2">
                {FELDER.map(({ id, titel }) => (
                  <label key={id} className="flex flex-col gap-1">
                    <span className="text-[11px] text-[var(--text-schwach)]">{titel}</span>
                    {id === 'bildmerkmale' ? (
                      <textarea
                        rows={2}
                        value={entwurf[id] || ''}
                        onChange={(e) => setEntwurf((prev) => ({ ...prev, [id]: e.target.value }))}
                        className="px-3 py-2 bg-[var(--karte)] border border-[var(--rand)] rounded-lg text-[13px] outline-none resize-none focus:ring-1 focus:ring-[var(--knopf)]"
                      />
                    ) : (
                      <input
                        value={entwurf[id] || ''}
                        onChange={(e) => setEntwurf((prev) => ({ ...prev, [id]: e.target.value }))}
                        className="px-3 py-2 bg-[var(--karte)] border border-[var(--rand)] rounded-lg text-[13px] outline-none focus:ring-1 focus:ring-[var(--knopf)]"
                      />
                    )}
                  </label>
                ))}

                {entwurf.image && (
                  <img
                    src={entwurf.image}
                    alt=""
                    className="w-full h-32 object-contain rounded-lg bg-[var(--flaeche)]"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => speichern(bauwerk.key)}
                    className="px-4 py-2 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-[13px] font-semibold hover:bg-[var(--knopf-tief)] transition"
                  >
                    Speichern
                  </button>
                  {hinweis && <span className="text-[12px] text-[var(--gruen)]">{hinweis}</span>}
                </div>
              </div>
            )}
          </div>
        ))}

        {treffer.length === 0 && (
          <p className="text-[12px] text-[var(--text-schwach)]">Nichts gefunden.</p>
        )}
      </div>
    </section>
  )
}

function Fortschritt() {
  const [bereiche, setBereiche] = useState([])
  const [frage, setFrage] = useState(null)
  const [hinweis, setHinweis] = useState('')

  const laden = useCallback(() => {
    api.verwaltenFortschritt().then((data) => setBereiche(data.bereiche)).catch(() => {})
  }, [])

  useEffect(laden, [laden])

  async function zuruecksetzen(id) {
    const data = await api.verwaltenZuruecksetzen(id)
    setHinweis(`${data.geloescht} Einträge gelöscht.`)
    setFrage(null)
    laden()
  }

  return (
    <section className="bg-[var(--karte)] border border-[var(--rand)] rounded-2xl p-4">
      <h3 className="text-[13px] font-bold text-[var(--text)] mb-3">Fortschritt zurücksetzen</h3>

      <div className="flex flex-col gap-2">
        {bereiche.map((bereich) => (
          <div key={bereich.id} className="flex items-center justify-between gap-3">
            <span className="text-[13px] text-[var(--text-weich)]">
              {bereich.titel}
              <span className="text-[11px] text-[var(--text-schwach)]"> · {bereich.anzahl} Einträge</span>
            </span>

            {frage === bereich.id ? (
              <span className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => zuruecksetzen(bereich.id)}
                  className="px-3 py-1.5 rounded-lg bg-[var(--rot)] text-[var(--auf-farbe)] text-[12px] font-semibold"
                >
                  Wirklich löschen
                </button>
                <button
                  onClick={() => setFrage(null)}
                  className="text-[12px] text-[var(--text-leise)]"
                >
                  Abbrechen
                </button>
              </span>
            ) : (
              <button
                onClick={() => setFrage(bereich.id)}
                disabled={bereich.anzahl === 0}
                className="px-3 py-1.5 rounded-lg border border-[var(--rand)] text-[12px] text-[var(--text-mittel)] disabled:opacity-40 hover:border-[var(--rand-stark)] transition shrink-0"
              >
                Zurücksetzen
              </button>
            )}
          </div>
        ))}
      </div>

      {hinweis && <p className="text-[12px] text-[var(--gruen)] mt-2">{hinweis}</p>}
    </section>
  )
}

function Pin() {
  const [alt, setAlt] = useState('')
  const [neu, setNeu] = useState('')
  const [hinweis, setHinweis] = useState('')
  const [error, setError] = useState('')

  async function speichern(e) {
    e.preventDefault()
    setError('')
    setHinweis('')
    try {
      await api.pinAendern(alt, neu)
      setHinweis('Neue PIN gespeichert.')
      setAlt('')
      setNeu('')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="bg-[var(--karte)] border border-[var(--rand)] rounded-2xl p-4">
      <h3 className="text-[13px] font-bold text-[var(--text)] mb-1">PIN ändern</h3>
      <p className="text-[11px] text-[var(--text-schwach)] mb-3">
        Die Start-PIN steht öffentlich im Projekt — eine eigene ist besser.
      </p>

      <form onSubmit={speichern} className="flex flex-col gap-2">
        <input
          type="password"
          inputMode="numeric"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Alte PIN"
          className="px-3 py-2.5 bg-[var(--feld)]/50 border border-[var(--rand)] rounded-xl text-[15px] sm:text-sm outline-none focus:ring-1 focus:ring-[var(--knopf)]"
        />
        <input
          type="password"
          inputMode="numeric"
          value={neu}
          onChange={(e) => setNeu(e.target.value)}
          placeholder="Neue PIN (mindestens vier Zeichen)"
          className="px-3 py-2.5 bg-[var(--feld)]/50 border border-[var(--rand)] rounded-xl text-[15px] sm:text-sm outline-none focus:ring-1 focus:ring-[var(--knopf)]"
        />
        <button
          type="submit"
          disabled={!alt || !neu}
          className="self-start px-4 py-2 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-[13px] font-semibold hover:bg-[var(--knopf-tief)] transition disabled:opacity-40"
        >
          PIN ändern
        </button>
      </form>

      {hinweis && <p className="text-[12px] text-[var(--gruen)] mt-2">{hinweis}</p>}
      {error && <p className="text-[12px] text-[var(--rot)] mt-2">{error}</p>}
    </section>
  )
}
