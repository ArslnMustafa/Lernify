import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import Nav from '../components/Nav.jsx'
import { ZielRing, Zaehler, MitArtikel } from '../deutsch/ui.jsx'

// Startseite Deutsch: Tagesziel und Serie, Lernpfad durch die Lektionen,
// Wortschatz (haeufige Woerter zuerst), Niveau-Leiter A1 bis B2, Kaliplar, Tueyolar und Wiederholung.
const WUERFEL = [
  ['der Termin', 'randevu'], ['die Wohnung', 'ev'], ['das Gehalt', 'maaş'],
  ['die Stelle', 'iş, pozisyon'], ['der Urlaub', 'izin, tatil'], ['das Rezept', 'reçete'],
]
const WOCHENTAG = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
// Zickzack des Lernpfads (Verschiebung nach rechts in Pixeln)
const ZICKZACK = [0, 46, 72, 46, 0, -46, -72, -46]

export default function Deutsch() {
  const [d, setD] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.deutschUebersicht().then(setD).catch((err) => setError(err.message))
  }, [])

  const faellig = d ? d.bereiche.reduce((s, b) => s + (b.faellig - b.neu), 0) : 0
  const naechste = d?.grammatik.find((t) => t.key === d.naechste)

  return (
    <div className="min-h-screen bg-[var(--flaeche)]">
      <Nav />
      <main className="max-w-3xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
        {error && <p className="text-sm text-[var(--rot)]">{error}</p>}
        {!d && !error && <p className="text-sm text-[var(--text-leise)]">Wird geladen...</p>}

        {d && (
          <>
            {/* ---------- Kopf: Ziel, Serie, Wuerfel ---------- */}
            <section className="de-auf relative overflow-hidden rounded-3xl bg-[var(--karte)] border border-[var(--rand)] p-5 sm:p-6 flex flex-col sm:flex-row gap-6 items-center">
              <div className="flex-1 w-full">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">Deutsch lernen</h2>
                <p className="text-sm text-[var(--text-leise)] mt-1">A2'den B2'ye, her gün biraz.</p>

                <div className="mt-5 flex items-center gap-4">
                  <div className="relative w-[92px] h-[92px] shrink-0">
                    <ZielRing wert={d.xp.heute} ziel={d.xp.ziel} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-extrabold text-[var(--text)] tabular-nums"><Zaehler wert={d.xp.heute} /></span>
                      <span className="text-[10px] text-[var(--text-leise)]">von {d.xp.ziel} XP</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text)]">
                      <span className="de-flamme mr-1" aria-hidden="true">🔥</span>
                      {d.xp.serie > 0 ? `${d.xp.serie} ${d.xp.serie === 1 ? 'Tag' : 'Tage'} in Folge` : 'Heute die Serie starten'}
                    </p>
                    <p className="text-xs text-[var(--text-leise)] mt-0.5">
                      {d.xp.heute >= d.xp.ziel ? 'Tagesziel erreicht. Stark!' : `Noch ${d.xp.ziel - d.xp.heute} XP bis zum Tagesziel`}
                    </p>
                    <div className="mt-3 flex items-end gap-1.5 h-12" aria-label="XP der letzten sieben Tage">
                      {d.xp.woche.map((w, i) => {
                        const h = Math.max(4, Math.min(48, (w.xp / d.xp.ziel) * 40))
                        return (
                          <div key={w.tag} className="flex flex-col items-center gap-1 flex-1">
                            <span
                              className={`w-full max-w-[18px] rounded-md ${w.xp >= d.xp.ziel ? 'bg-[var(--gold)]' : w.xp > 0 ? 'bg-[var(--mittel)]' : 'bg-[var(--feld)]'}`}
                              style={{ height: h, transition: `height .8s ${i * 0.06}s cubic-bezier(.2,.8,.2,1)` }}
                              title={`${w.tag}: ${w.xp} XP`}
                            />
                            <span className="text-[9px] text-[var(--text-schwach)]">{WOCHENTAG[new Date(w.tag + 'T12:00:00').getDay()]}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Platz rundherum, damit der gedrehte Wuerfel nicht am Rand abgeschnitten wird */}
              <div className="de-buehne shrink-0 my-4 sm:my-2 sm:mx-10" aria-hidden="true">
                <div className="de-wuerfel">
                  {WUERFEL.map(([de, tr]) => (
                    <div key={de} className="de-seite">
                      <b><MitArtikel text={de} /></b>
                      <small>{tr}</small>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ---------- Niveau-Leiter: wie viele Woerter je Stufe sitzen ---------- */}
            <section className="de-auf de-auf-1 mt-4 p-4 rounded-2xl bg-[var(--karte)] border border-[var(--rand)]" aria-label="Fortschritt nach Niveau">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-[var(--text)]">Dein Weg bis B2</span>
                <span className="text-[11px] text-[var(--text-leise)]">sichere Wörter je Niveau</span>
              </div>
              <ol className="grid grid-cols-4 gap-2">
                {d.niveaus.map((n, i) => {
                  const anteil = n.woerter ? n.sicher / n.woerter : 0
                  return (
                    <li key={n.niveau} className="min-w-0">
                      <span className="flex items-baseline justify-between gap-1">
                        <span className="text-sm font-extrabold text-[var(--text)]">{n.niveau}</span>
                        <span className="text-[10px] tabular-nums text-[var(--text-leise)] truncate">{n.sicher}/{n.woerter}</span>
                      </span>
                      <span className="mt-1 block h-2 rounded-full bg-[var(--feld)] overflow-hidden">
                        <span className="block h-full rounded-full bg-[var(--gruen)]"
                          style={{ width: `${Math.round(anteil * 100)}%`, transition: `width 1s ${0.2 + i * 0.1}s cubic-bezier(.2,.8,.2,1)` }} />
                      </span>
                    </li>
                  )
                })}
              </ol>
            </section>

            {/* ---------- Weiter ---------- */}
            <div className="de-auf de-auf-2 mt-4 grid gap-3 sm:grid-cols-2">
              <Link
                to={naechste ? `/deutsch/lektion/${naechste.key}` : '/deutsch/wiederholung'}
                className="group flex items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-[var(--knopf)] text-[var(--auf-knopf)] hover:bg-[var(--knopf-tief)] transition"
              >
                <span className="min-w-0">
                  <span className="block text-xs opacity-75">{naechste ? 'Weiter mit der Lektion' : 'Alle Lektionen geschafft'}</span>
                  <span className="block font-bold truncate">{naechste ? naechste.titel : 'Wiederholen'}</span>
                </span>
                <span aria-hidden="true" className="text-xl transition group-hover:translate-x-1">→</span>
              </Link>
              <Link
                to="/deutsch/karten"
                className="group flex items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-[var(--karte)] border border-[var(--rand)] hover:border-[var(--rand-stark)] transition"
              >
                <span className="min-w-0">
                  <span className="block text-xs text-[var(--text-leise)]">Wortschatz</span>
                  <span className="block font-bold text-[var(--text)]">
                    {faellig > 0 ? `${faellig} ${faellig === 1 ? 'Wort' : 'Wörter'} wiederholen` : 'Neue Wörter lernen'}
                  </span>
                </span>
                <span aria-hidden="true" className="text-xl text-[var(--text-mittel)] transition group-hover:translate-x-1">→</span>
              </Link>
            </div>

            {/* ---------- Lernpfad ---------- */}
            <h3 className="de-auf de-auf-3 mt-8 mb-1 text-lg font-bold text-[var(--text)]">Dein Lernpfad</h3>
            <p className="text-xs text-[var(--text-leise)] mb-4">Her ders: konu anlatımı, sık hatalar, tüyolar, kalıplar, alıştırma ve özet.</p>
            <ol className="de-pfad flex flex-col items-center gap-2 py-2">
              {d.grammatik.map((t, i) => {
                const jetzt = t.key === d.naechste
                const zustand = t.fertig ? 'fertig' : jetzt ? 'jetzt' : ''
                const neueStufe = i === 0 || d.grammatik[i - 1].niveau !== t.niveau
                return (
                  <li key={t.key} className="de-auf w-full flex flex-col items-center" style={{ animationDelay: `${0.2 + i * 0.04}s` }}>
                    {neueStufe && (
                      <span className="my-3 flex items-center gap-3 w-full max-w-sm text-xs font-bold text-[var(--text-mittel)]">
                        <span className="flex-1 h-px bg-[var(--rand-stark)]" />
                        Niveau {t.niveau}
                        <span className="flex-1 h-px bg-[var(--rand-stark)]" />
                      </span>
                    )}
                    <Link
                      to={`/deutsch/lektion/${t.key}`}
                      className="flex items-center gap-3 group"
                      style={{ transform: `translateX(${ZICKZACK[i % ZICKZACK.length]}px)` }}
                    >
                      <span className={jetzt ? 'de-puls' : ''}>
                        <span
                          className={`de-knoten ${zustand} w-14 h-14 rounded-full flex items-center justify-center text-lg font-extrabold ${
                            t.fertig ? 'bg-[var(--gruen)] text-[var(--auf-farbe)]'
                              : jetzt ? 'bg-[var(--gold)] text-[#2b1d0c]'
                                : 'bg-[var(--karte)] text-[var(--text-mittel)] border border-[var(--rand-stark)]'
                          }`}
                        >
                          {t.fertig ? '✓' : i + 1}
                        </span>
                      </span>
                      <span className="w-40 sm:w-52">
                        <span className="block text-sm font-bold text-[var(--text)] leading-tight group-hover:underline">{t.titel}</span>
                        <span className="block text-[11px] text-[var(--text-leise)] leading-snug">
                          {t.fertig ? 'geschafft' : t.gemacht ? `${t.sicher} von ${t.uebungen} sicher` : t.kurz}
                        </span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ol>

            {/* ---------- Wortschatz ---------- */}
            <div className="mt-8 mb-3 flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-bold text-[var(--text)]">Wortschatz</h3>
              <Link to="/deutsch/woerter" className="text-xs font-semibold text-[var(--text-mittel)] hover:text-[var(--text)] hover:underline">Wortliste →</Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {d.bereiche.map((b, i) => (
                <Link
                  key={b.key}
                  to={`/deutsch/karten?bereich=${b.key}`}
                  className={`de-auf de-auf-${Math.min(i + 1, 6)} block p-4 rounded-2xl border hover:-translate-y-0.5 transition ${
                    b.key === 'haeufig'
                      ? 'sm:col-span-2 bg-[color-mix(in_srgb,var(--gold)_12%,var(--karte))] border-[var(--gold)]'
                      : 'bg-[var(--karte)] border-[var(--rand)] hover:border-[var(--rand-stark)]'
                  }`}
                >
                  {b.key === 'haeufig' && <span className="block text-[11px] font-bold text-[var(--text-mittel)] mb-1">⭐ Öncelik: önce bunlar öğretilir</span>}
                  <span className="block font-bold text-[var(--text)]">{b.name}</span>
                  <span className="block text-xs text-[var(--text-leise)] mt-0.5 min-h-[2.5em]">{b.beschreibung}</span>
                  <span className="block mt-3 h-1.5 rounded-full bg-[var(--feld)] overflow-hidden" aria-hidden="true">
                    <span className="block h-full rounded-full bg-[var(--gruen)]" style={{ width: `${Math.round((b.sicher / b.woerter) * 100)}%`, transition: 'width 1s' }} />
                  </span>
                  <span className="block text-xs text-[var(--text-mittel)] mt-1.5">
                    {b.sicher} von {b.woerter} sicher{b.faellig - b.neu > 0 ? ` · ${b.faellig - b.neu} fällig` : ''}
                  </span>
                </Link>
              ))}
            </div>

            {/* ---------- Mehr ---------- */}
            <h3 className="mt-8 mb-3 text-lg font-bold text-[var(--text)]">Nachschlagen und wiederholen</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Kachel to="/deutsch/woerter" titel="Wortliste" text="Bütün kelimeler: ara, filtrele, dinle" zeichen="📖" />
              <Kachel to="/deutsch/kaliplar" titel="Kalıplar" text={`${d.kaliplar} durumda hazır cümleler, sesli`} zeichen="💬" />
              <Kachel to="/deutsch/tipps" titel="Tüyolar" text={`${d.tipps} püf noktası: artikel, kelime sırası, sınav`} zeichen="💡" />
              <Kachel to="/deutsch/wiederholung" titel="Konu tekrarı" text="Başladığın konulardan karışık sorular ve özetler" zeichen="🔁" />
            </div>

            {/* ---------- Pruefung ---------- */}
            <Link
              to="/deutsch/pruefung"
              className="group mt-8 flex items-center gap-4 p-5 rounded-2xl bg-[var(--knopf)] text-[var(--auf-knopf)] hover:bg-[var(--knopf-tief)] transition"
            >
              <span className="text-3xl transition group-hover:scale-110" aria-hidden="true">🎓</span>
              <span className="flex-1 min-w-0">
                <span className="block font-bold">Prüfungssimulation</span>
                <span className="block text-xs opacity-80">{d.pruefungen} deneme sınavı · DTZ / Goethe B1 ve B2 · Lesen süreli, Hören sesli</span>
              </span>
              <span aria-hidden="true" className="text-xl transition group-hover:translate-x-1">→</span>
            </Link>

            <h3 className="mt-8 mb-3 text-sm font-bold text-[var(--text-mittel)]">Bald</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Bald titel="Schreiben" text="Mektup, e-posta ve görüş yazısı; örnek cevap ve kontrol listesiyle." />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function Kachel({ to, titel, text, zeichen }) {
  return (
    <Link
      to={to}
      className="group block p-4 rounded-2xl bg-[var(--karte)] border border-[var(--rand)] hover:border-[var(--rand-stark)] hover:-translate-y-0.5 transition"
    >
      <span className="block text-2xl transition group-hover:scale-110 origin-left" aria-hidden="true">{zeichen}</span>
      <span className="block mt-2 font-bold text-[var(--text)]">{titel}</span>
      <span className="block text-xs text-[var(--text-leise)] mt-0.5">{text}</span>
    </Link>
  )
}

function Bald({ titel, text }) {
  return (
    <div className="p-4 rounded-2xl border border-dashed border-[var(--rand-stark)] text-[var(--text-leise)]">
      <span className="block font-semibold text-[var(--text-mittel)]">{titel}</span>
      <span className="block text-xs mt-0.5">{text}</span>
    </div>
  )
}
