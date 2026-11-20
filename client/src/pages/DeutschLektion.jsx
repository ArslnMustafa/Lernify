import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'
import Nav from '../components/Nav.jsx'
import Fett from '../deutsch/Fett.jsx'
import { Hoeren, feiern } from '../deutsch/ui.jsx'

// Eine Lektion in fuenf Schritten: Konu anlatimi, Hatalar ve tueyolar, Kaliplar, Alistirma, Ozet.
const SCHRITTE = ['Konu', 'Hatalar & tüyolar', 'Kalıplar', 'Alıştırma', 'Özet']

export default function DeutschLektion() {
  const { thema } = useParams()
  const [l, setL] = useState(null)
  const [schritt, setSchritt] = useState(0)
  const [antworten, setAntworten] = useState({})
  const [error, setError] = useState('')
  const oben = useRef(null)

  // Neue Lektion: von vorn. "Nochmal": dieselbe Lektion, neu gemischt, direkt zu den Uebungen.
  function laden(zuSchritt) {
    setAntworten({})
    setError('')
    api.deutschLektion(thema).then((daten) => {
      setL(daten)
      setSchritt(zuSchritt)
    }).catch((err) => setError(err.message))
  }

  useEffect(() => {
    setL(null)
    laden(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thema])

  useEffect(() => {
    oben.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [schritt])

  async function gehe(n) {
    // Wer die Erklaerung hinter sich laesst, hat sie gelesen
    if (schritt === 0 && n > 0 && l && !l.gelesen) {
      try {
        const r = await api.deutschGelesen(l.key)
        setL((x) => ({ ...x, gelesen: true }))
        if (r.xp) feiern(null, r.xp)
      } catch { /* weiterlesen geht trotzdem */ }
    }
    setSchritt(n)
  }

  async function antworte(u, option, el) {
    if (antworten[u.i]) return
    setAntworten((a) => ({ ...a, [u.i]: { gewaehlt: option } }))
    try {
      const r = await api.deutschThemaAntwort({ thema, i: u.i, antwort: option })
      setAntworten((a) => ({ ...a, [u.i]: { gewaehlt: option, ergebnis: r } }))
      if (r.richtig) feiern(el, r.xp)
    } catch (err) {
      setError(err.message)
    }
  }

  const fertig = l ? Object.values(antworten).filter((a) => a.ergebnis) : []
  const richtig = fertig.filter((a) => a.ergebnis.richtig).length

  return (
    <div className="min-h-screen bg-[var(--flaeche)]">
      <Nav />
      <main className="[overflow-x:clip] max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div ref={oben} className="scroll-mt-20" />
        <Link to="/deutsch" className="text-xs font-medium text-[var(--text-leise)] hover:text-[var(--text)]">← Deutsch</Link>
        {error && <p className="text-sm text-[var(--rot)] mt-4">{error}</p>}
        {!l && !error && <p className="text-sm text-[var(--text-leise)] mt-4">Wird geladen...</p>}

        {l && (
          <>
            <p className="mt-3 text-xs font-semibold text-[var(--text-schwach)]">Lektion {l.nr} von {l.von}</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">{l.titel}</h2>
            <p className="text-sm text-[var(--text-leise)]">{l.kurz}</p>

            {/* Schritte */}
            <nav aria-label="Schritte" className="mt-5 flex gap-1.5 overflow-x-auto pb-1">
              {SCHRITTE.map((name, i) => (
                <button
                  key={name}
                  onClick={() => gehe(i)}
                  aria-current={schritt === i ? 'step' : undefined}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                    schritt === i
                      ? 'bg-[var(--knopf)] text-[var(--auf-knopf)] border-[var(--knopf)]'
                      : i < schritt
                        ? 'bg-[var(--gruen-leise)] text-[var(--gruen-tief)] border-transparent'
                        : 'bg-[var(--karte)] text-[var(--text-mittel)] border-[var(--rand)]'
                  }`}
                >
                  {i + 1}. {name}
                </button>
              ))}
            </nav>
            <div className="mt-2 h-1 rounded-full bg-[var(--feld)] overflow-hidden">
              <div className="h-full bg-[var(--gold)] transition-all duration-500" style={{ width: `${((schritt + 1) / SCHRITTE.length) * 100}%` }} />
            </div>

            <div key={schritt} className="de-schritt mt-5">
              {schritt === 0 && <Konu l={l} />}
              {schritt === 1 && <Hatalar l={l} />}
              {schritt === 2 && <Kaliplar l={l} />}
              {schritt === 3 && (
                <Uebungen l={l} antworten={antworten} antworte={antworte} richtig={richtig} fertig={fertig.length} />
              )}
              {schritt === 4 && <Ozet l={l} richtig={richtig} fertig={fertig.length} nochmal={() => laden(3)} />}
            </div>

            {schritt < 4 && (
              <div className="mt-6 flex justify-between gap-3">
                <button
                  onClick={() => gehe(schritt - 1)}
                  disabled={schritt === 0}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-leise)] hover:text-[var(--text)] disabled:invisible"
                >
                  Zurück
                </button>
                <button
                  onClick={() => gehe(schritt + 1)}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-semibold hover:bg-[var(--knopf-tief)]"
                >
                  {schritt === 0 ? 'Verstanden, weiter' : schritt === 3 ? 'Zur Zusammenfassung' : 'Weiter'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function Karte({ children, className = '' }) {
  return <section className={`rounded-2xl bg-[var(--karte)] border border-[var(--rand)] p-4 sm:p-5 ${className}`}>{children}</section>
}

function Satz({ de, tr }) {
  return (
    <li className="flex items-start gap-3 py-2">
      <Hoeren text={de} klein className="mt-0.5" />
      <span className="min-w-0">
        <span className="block text-[15px] text-[var(--text)]">{de}</span>
        {tr && <span className="block text-xs text-[var(--text-leise)]">{tr}</span>}
      </span>
    </li>
  )
}

function Konu({ l }) {
  return (
    <div className="flex flex-col gap-4">
      <Karte className="bg-[var(--feld)]">
        <p className="text-[15px] leading-relaxed text-[var(--text-weich)]">{l.einstieg}</p>
      </Karte>
      <Karte>
        <div className="flex flex-col gap-2.5 text-[15px] leading-relaxed text-[var(--text-weich)]">
          {l.erklaerung.map((a) => <p key={a}><Fett text={a} /></p>)}
        </div>
      </Karte>
      {l.tabelle && (
        <div className="overflow-x-auto rounded-2xl border border-[var(--rand)] bg-[var(--karte)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--feld)]">
                {l.tabelle.kopf.map((k, i) => <th key={i} className="text-left px-3 py-2 font-semibold text-[var(--text-mittel)] whitespace-nowrap">{k}</th>)}
              </tr>
            </thead>
            <tbody>
              {l.tabelle.zeilen.map((z, i) => (
                <tr key={i} className="border-t border-[var(--rand)]">
                  {z.map((c, j) => <td key={j} className={`px-3 py-2 ${j === 0 ? 'font-semibold text-[var(--text)]' : 'text-[var(--text-weich)]'}`}>{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Karte>
        <p className="text-xs font-semibold text-[var(--text-schwach)]">Beispiele zum Anhören</p>
        <ul className="divide-y divide-[var(--rand)]">{l.beispiele.map((b) => <Satz key={b} de={b} />)}</ul>
      </Karte>
    </div>
  )
}

function Hatalar({ l }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-bold text-[var(--text)]">Sık yapılan hatalar</h3>
      {l.fehler.map(([falsch, richtig, warum]) => (
        <Karte key={falsch}>
          <p className="text-[15px] text-[var(--rot)] line-through decoration-2">{falsch}</p>
          <p className="mt-1 flex items-center gap-2 text-[15px] font-semibold text-[var(--gruen-tief)]">
            <span>✓ {richtig}</span><Hoeren text={richtig} klein />
          </p>
          <p className="mt-1.5 text-sm text-[var(--text-mittel)]">{warum}</p>
        </Karte>
      ))}
      <h3 className="mt-2 font-bold text-[var(--text)]">Tüyolar</h3>
      {l.tipps.map((t, i) => (
        <div key={i} className="flex gap-3 p-4 rounded-2xl border border-[var(--gold)] bg-[color-mix(in_srgb,var(--gold)_10%,var(--karte))]">
          <span aria-hidden="true" className="text-xl">💡</span>
          <p className="text-[15px] leading-relaxed text-[var(--text-weich)]">{t}</p>
        </div>
      ))}
    </div>
  )
}

function Kaliplar({ l }) {
  return (
    <Karte>
      <h3 className="font-bold text-[var(--text)]">Bu konuyla ilgili hazır kalıplar</h3>
      <p className="text-xs text-[var(--text-leise)] mt-0.5">Dinle, yüksek sesle tekrar et. İkinci kez dokunursan yavaş okur.</p>
      <ul className="mt-2 divide-y divide-[var(--rand)]">{l.kaliplar.map(([de, tr]) => <Satz key={de} de={de} tr={tr} />)}</ul>
    </Karte>
  )
}

function Uebungen({ l, antworten, antworte, richtig, fertig }) {
  return (
    <>
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="font-bold text-[var(--text)]">Übungen</h3>
        <span className="text-xs tabular-nums text-[var(--text-mittel)]">
          {fertig ? `${richtig} von ${fertig} richtig` : `${l.uebungen.length} Sätze`}
        </span>
      </div>
      <ol className="flex flex-col gap-3">
        {l.uebungen.map((u) => {
          const a = antworten[u.i]
          const r = a?.ergebnis
          return (
            <li key={u.i} className={`rounded-2xl bg-[var(--karte)] border border-[var(--rand)] p-4 ${r ? (r.richtig ? 'de-richtig' : 'de-falsch') : ''}`}>
              <p className="text-[16px] text-[var(--text)] leading-snug">
                <Luecke satz={u.satz} fuellung={r ? r.loesung : a?.gewaehlt} richtig={r?.richtig} />
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {u.optionen.map((o) => {
                  const istLoesung = r && o === r.loesung
                  const istFalsch = r && o === a.gewaehlt && !r.richtig
                  return (
                    <button
                      key={o}
                      onClick={(e) => antworte(u, o, e.currentTarget)}
                      disabled={Boolean(a)}
                      className={`px-3.5 py-2 rounded-xl border text-sm font-medium transition ${
                        istLoesung ? 'border-[var(--gruen)] bg-[var(--gruen-leise)] text-[var(--text)]'
                          : istFalsch ? 'border-[var(--rot-rand)] bg-[var(--rot-flaeche)] text-[var(--rot)]'
                            : 'border-[var(--rand)] bg-[var(--feld)] text-[var(--text)] hover:border-[var(--rand-stark)] hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0'
                      }`}
                    >
                      {o}
                    </button>
                  )
                })}
              </div>
              {r && (
                <p className={`mt-2.5 text-sm ${r.richtig ? 'text-[var(--gruen-tief)]' : 'text-[var(--rot)]'}`}>
                  {r.richtig ? 'Richtig. ' : 'Falsch. '}<span className="text-[var(--text-mittel)]">{r.hinweis}</span>
                </p>
              )}
            </li>
          )
        })}
      </ol>
    </>
  )
}

function Ozet({ l, richtig, fertig, nochmal }) {
  return (
    <div className="flex flex-col gap-4">
      <Karte>
        <h3 className="font-bold text-[var(--text)]">Özet</h3>
        <ul className="mt-2 flex flex-col gap-2">
          {l.ozet.map((o) => (
            <li key={o} className="flex gap-2 text-[15px] text-[var(--text-weich)]"><span className="text-[var(--gold)]">●</span>{o}</li>
          ))}
        </ul>
      </Karte>
      {fertig > 0 && (
        <Karte className="text-center">
          <p className="text-3xl font-extrabold text-[var(--text)]">{richtig}/{fertig}</p>
          <p className="text-sm text-[var(--text-leise)] mt-1">
            {richtig === fertig ? 'Harika! Bu konu oturmuş.' : 'Yanlışları açıklamalarıyla tekrar oku, sonra bir tur daha dene.'}
          </p>
        </Karte>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={nochmal} className="flex-1 px-4 py-3 rounded-xl border border-[var(--rand-stark)] bg-[var(--karte)] text-sm font-semibold text-[var(--text)]">
          Übungen nochmal
        </button>
        {l.naechste ? (
          <Link to={`/deutsch/lektion/${l.naechste.key}`} className="flex-1 text-center px-4 py-3 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-semibold">
            Nächste Lektion: {l.naechste.titel}
          </Link>
        ) : (
          <Link to="/deutsch/wiederholung" className="flex-1 text-center px-4 py-3 rounded-xl bg-[var(--knopf)] text-[var(--auf-knopf)] text-sm font-semibold">
            Zur Wiederholung
          </Link>
        )}
      </div>
    </div>
  )
}

// Satz mit Luecke; nach der Antwort steht die Loesung darin. "rufe … an" fuellt zwei Luecken.
export function Luecke({ satz, fuellung, richtig }) {
  const teile = satz.split('___')
  const stuecke = fuellung ? fuellung.split(' … ') : []
  return teile.map((teil, i) => (
    <span key={i}>
      {teil}
      {i < teile.length - 1 && (
        <span className={`inline-block min-w-[3.5em] px-1 mx-0.5 border-b-2 text-center font-semibold ${
          fuellung == null ? 'border-[var(--rand-stark)] text-transparent'
            : richtig === false ? 'border-[var(--gruen)] text-[var(--gruen-tief)]' : 'border-[var(--gruen)] text-[var(--text)]'
        }`}>
          {fuellung == null ? '…' : (stuecke[i] ?? '').replace('–', '') || ' '}
        </span>
      )}
    </span>
  ))
}
