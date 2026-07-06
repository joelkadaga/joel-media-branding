import React, { useState } from 'react'
import { PORTFOLIO, CATEGORIES } from './portfolio.js'

// ====== BADILISHA HAPA (Edit here) ======
const WHATSAPP_NUMBER = '255XXXXXXXXX' // Weka namba yako ya WhatsApp bila alama ya +
const PHONE_DISPLAY = '+255 XXX XXX XXX'
// ========================================

const waLink = (msg) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`

const services = [
  {
    title: 'Mabango ya 3D',
    desc: 'Herufi zinazoinuka, zinawaka taa usiku. Duka lako linaonekana la kisasa.',
    emoji: '🔠',
  },
  {
    title: 'Mabango ya 2D',
    desc: 'Mabango bapa yenye ubora wa hali ya juu, ya kuwaka taa au ya kawaida.',
    emoji: '🪧',
  },
  {
    title: 'CNC Cutting',
    desc: 'Ukataji wa usahihi kwa mashine ya CNC — maua, maandishi na maumbo yoyote.',
    emoji: '⚙️',
  },
  {
    title: 'Mabanner na Stika',
    desc: 'Mabanner, stika na vehicle branding — biashara yako inaonekana kila mahali.',
    emoji: '🚗',
  },
]

function Gallery() {
  const [filter, setFilter] = useState('zote')
  const items =
    filter === 'zote' ? PORTFOLIO : PORTFOLIO.filter((p) => p.category === filter)

  return (
    <div>
      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={
              'rounded-full px-4 py-1.5 text-sm font-semibold transition ' +
              (filter === c.id
                ? 'bg-brand-purple text-white'
                : 'bg-white text-brand-ink/70 hover:bg-brand-purple/10')
            }
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <div
            key={p.id}
            className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={p.image}
                alt={p.title}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <h3 className="font-display text-lg text-brand-purple">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-ink/70">{p.desc}</p>
              <a
                href={waLink(`Habari Joel Media Branding! Nimeona kazi yenu ya "${p.title}" kwenye website. Nataka bango kama hilo la biashara yangu.`)}
                className="mt-4 inline-block rounded-full bg-brand-orange px-5 py-2 text-sm font-semibold text-brand-ink transition hover:bg-brand-orangedeep"
              >
                Nataka kama hii →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-brand-paper font-body text-brand-ink">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-brand-mist bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <img src="/logo.png" alt="Joel Media Branding" className="h-12 w-auto" />
          <a
            href={waLink('Habari Joel Media Branding, naomba maelezo zaidi.')}
            className="rounded-full bg-brand-purple px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-purpledark"
          >
            Wasiliana Nasi
          </a>
        </div>
      </header>

      {/* Hero — the headline itself is a 3D sign */}
      <section className="bg-brand-purple">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-brand-orange">
            Karibu Joel Media Branding
          </p>
          <h1 className="sign-3d font-display text-5xl leading-tight sm:text-7xl">
            BANGO LAKO,
            <br />
            BIASHARA YAKO.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/85">
            Tunatengeneza mabango ya 3D na 2D, CNC cutting, mabanner na stika —
            duka lako lionekane, wateja wakufikie.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={waLink('Habari, nimependa kazi zenu. Nataka bango la biashara yangu.')}
              className="rounded-full bg-brand-orange px-8 py-3 font-semibold text-brand-ink transition hover:bg-brand-orangedeep"
            >
              Uliza Bei kwa WhatsApp
            </a>
            <a
              href="#huduma"
              className="rounded-full border border-white/40 px-8 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Ona Huduma Zetu
            </a>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="huduma" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl text-brand-purple">Huduma Zetu</h2>
        <p className="mt-2 max-w-2xl text-brand-ink/70">
          Kila kitu cha kuitangaza biashara yako — kutoka kwenye wazo hadi bango
          limesimama dukani kwako.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-brand-mist bg-brand-mist/40 p-6 transition hover:-translate-y-1 hover:border-brand-orange hover:shadow-lg"
            >
              <div className="text-3xl">{s.emoji}</div>
              <h3 className="mt-3 font-display text-lg text-brand-purple">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-ink/70">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Kazi Zetu — Portfolio gallery */}
      <section id="kazi-zetu" className="bg-brand-mist/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-display text-3xl text-brand-purple">Kazi Zetu</h2>
          <p className="mt-2 max-w-2xl text-brand-ink/70">
            Baadhi ya kazi tulizokamilisha. Ukiona unachokipenda, bonyeza
            &quot;Nataka kama hii&quot; — tutakuletea bei mara moja.
          </p>
          <Gallery />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-display text-lg">Joel Media Branding</p>
            <p className="mt-1 text-sm text-white/70">
              Dar es Salaam, Tanzania · {PHONE_DISPLAY}
            </p>
          </div>
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Joel Media Branding. Haki zote zimehifadhiwa.
          </p>
        </div>
      </footer>

      {/* Floating WhatsApp button */}
      <a
        href={waLink('Habari Joel Media Branding!')}
        aria-label="Wasiliana nasi kwa WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-xl transition hover:scale-110"
      >
        <svg viewBox="0 0 32 32" className="h-8 w-8 fill-white" aria-hidden="true">
          <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.7 6L4 29l8.2-1.6c1.2.6 2.5.9 3.8.9 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 22c-1.2 0-2.4-.3-3.5-.8l-.6-.3-4.9 1 1-4.7-.3-.6c-.9-1.5-1.4-3.2-1.4-4.9C6.3 9.6 10.6 5.3 16 5.3S25.7 9.6 25.7 15 21.4 25 16 25zm5.3-7.2c-.3-.1-1.7-.8-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.4z" />
        </svg>
      </a>
    </div>
  )
}
