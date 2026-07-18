import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase.js'
import { generateQuotePdf } from './quotePdf.js'

const TZS = (n) => new Intl.NumberFormat('en-US').format(Math.round(n || 0)) + ' TZS'

const CATEGORY_LABELS = {
  '3d': 'Mabango ya 3D',
  '2d': 'Mabango ya 2D',
  kawaida_taa: 'Kawaida (yanawaka taa)',
  kawaida_bila: 'Kawaida (hayawaki taa)',
  ndani: 'Mabango ya Ndani',
  cnc: 'CNC Cutting',
  banner_sqm: 'Banner / Stika / Vehicle (kwa m²)',
}

export default function StaffApp() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (loading)
    return <div className="flex min-h-screen items-center justify-center font-body">Inapakia...</div>

  return session ? <Calculator session={session} /> : <Login />
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const signIn = async () => {
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email au password si sahihi. Jaribu tena.')
    setBusy(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-mist/60 px-4 font-body">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <img src="/logo.png" alt="Joel Media Branding" className="mx-auto h-14 w-auto" />
        <h1 className="mt-4 text-center font-display text-xl text-brand-purple">Staff Login</h1>
        <p className="mt-1 text-center text-sm text-brand-ink/60">Kwa wafanyakazi tu</p>
        <div className="mt-6 space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-brand-mist px-4 py-2.5 outline-none focus:border-brand-purple"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && signIn()}
            className="w-full rounded-xl border border-brand-mist px-4 py-2.5 outline-none focus:border-brand-purple"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            onClick={signIn}
            disabled={busy}
            className="w-full rounded-xl bg-brand-purple py-2.5 font-semibold text-white transition hover:bg-brand-purpledark disabled:opacity-50"
          >
            {busy ? 'Inaingia...' : 'Ingia'}
          </button>
          <a href="#/" className="block text-center text-sm text-brand-ink/50 hover:text-brand-purple">
            ← Rudi kwenye website
          </a>
        </div>
      </div>
    </div>
  )
}

function Calculator({ session }) {
  const [rates, setRates] = useState([])
  const [recent, setRecent] = useState([])

  // Customer
  const [custName, setCustName] = useState('')
  const [custPhone, setCustPhone] = useState('')
  const [custBusiness, setCustBusiness] = useState('')

  // Item
  const [category, setCategory] = useState('3d')
  const [tierId, setTierId] = useState('')          // rate id kwa tiers
  const [manualMode, setManualMode] = useState(false)
  const [manualSize, setManualSize] = useState('')
  const [manualPrice, setManualPrice] = useState('')
  const [qty, setQty] = useState('1')                // sheets au m²

  // Extras
  const [siteVisit, setSiteVisit] = useState(false)
  const [installation, setInstallation] = useState('')
  const [transport, setTransport] = useState('')
  const [designFee, setDesignFee] = useState('')
  const [discount, setDiscount] = useState('')

  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [lastSaved, setLastSaved] = useState(null)

  useEffect(() => {
    supabase.from('rate_table').select('*').eq('active', true).order('id').then(({ data }) => setRates(data || []))
    loadRecent()
  }, [])

  const loadRecent = () =>
    supabase
      .from('quotes')
      .select('quote_number,total,status,created_at,customers(name)')
      .order('id', { ascending: false })
      .limit(8)
      .then(({ data }) => setRecent(data || []))

  const catRates = rates.filter((r) => r.category === category && r.category !== 'extra')
  const siteVisitRate = rates.find((r) => r.category === 'extra')?.price_tzs || 20000
  const selectedTier = catRates.find((r) => String(r.id) === String(tierId))
  const isMeterCategory = ['3d', '2d', 'kawaida_taa', 'kawaida_bila'].includes(category)
  const isPerUnit = category === 'cnc' || category === 'banner_sqm'

  const itemTotal = useMemo(() => {
    if (manualMode && isMeterCategory) return Number(manualPrice) || 0
    if (!selectedTier) return 0
    if (isPerUnit) return selectedTier.price_tzs * (Number(qty) || 0)
    return selectedTier.price_tzs
  }, [manualMode, manualPrice, selectedTier, qty, isMeterCategory, isPerUnit])

  const extrasTotal =
    (siteVisit ? siteVisitRate : 0) +
    (Number(installation) || 0) +
    (Number(transport) || 0) +
    (Number(designFee) || 0)

  const total = Math.max(0, itemTotal + extrasTotal - (Number(discount) || 0))

  const itemDescription = () => {
    const label = CATEGORY_LABELS[category]
    if (manualMode && isMeterCategory) return `${label} — Mita ${manualSize} (bei maalum)`
    if (!selectedTier) return label
    if (category === 'cnc') return `${selectedTier.size_label} × ${qty} sheets`
    if (category === 'banner_sqm') return `Banner/Stika — ${qty} m²`
    return `${label} — ${selectedTier.size_label}`
  }

  const saveQuote = async () => {
    if (!custName || !custPhone) return alert('Weka jina na simu ya mteja kwanza.')
    if (itemTotal <= 0) return alert('Chagua bidhaa na bei kwanza.')
    setSaving(true)
    try {
      const { data: cust, error: e1 } = await supabase
        .from('customers')
        .insert({ name: custName, phone: custPhone, business_name: custBusiness })
        .select()
        .single()
      if (e1) throw e1

      const { data: qn, error: e2 } = await supabase.rpc('next_quote_number')
      if (e2) throw e2

      const extras = []
      if (siteVisit) extras.push({ label: 'Site visit + nauli', amount: siteVisitRate })
      if (Number(installation)) extras.push({ label: 'Installation', amount: Number(installation) })
      if (Number(transport)) extras.push({ label: 'Transport', amount: Number(transport) })
      if (Number(designFee)) extras.push({ label: 'Design', amount: Number(designFee) })

      const validUntil = new Date()
      validUntil.setDate(validUntil.getDate() + 30)

      const { data: quote, error: e3 } = await supabase
        .from('quotes')
        .insert({
          quote_number: qn,
          customer_id: cust.id,
          status: 'draft',
          subtotal: itemTotal,
          extras,
          discount: Number(discount) || 0,
          total,
          valid_until: validUntil.toISOString().slice(0, 10),
          created_by: session.user.id,
        })
        .select()
        .single()
      if (e3) throw e3

      const { error: e4 } = await supabase.from('quote_items').insert({
        quote_id: quote.id,
        category,
        description: itemDescription(),
        size_value: manualMode ? Number(manualSize) || null : Number(qty) || selectedTier?.meters || null,
        unit_price: manualMode ? Number(manualPrice) : selectedTier?.price_tzs || 0,
        manual_override: manualMode,
        line_total: itemTotal,
      })
      if (e4) throw e4

      setSavedMsg(`✅ Quote ${qn} imehifadhiwa — Jumla: ${TZS(total)} (Advance 70%: ${TZS(total * 0.7)})`)
      setLastSaved({
        quote: { quote_number: qn, created_at: new Date().toISOString(), valid_until: validUntil, subtotal: itemTotal, extras, discount: Number(discount) || 0, total, deposit_percent: 70 },
        customer: { name: custName, business_name: custBusiness, phone: custPhone },
        items: [{ description: itemDescription(), size_value: manualMode ? Number(manualSize) || null : Number(qty) || selectedTier?.meters || null, unit_price: manualMode ? Number(manualPrice) : selectedTier?.price_tzs || 0, line_total: itemTotal }],
      })
      loadRecent()
    } catch (err) {
      alert('Imeshindikana kuhifadhi: ' + err.message)
    }
    setSaving(false)
  }

  const downloadPdfFor = async (quoteNumber) => {
    const { data: q } = await supabase
      .from('quotes')
      .select('*, customers(name,business_name,phone), quote_items(*)')
      .eq('quote_number', quoteNumber)
      .single()
    if (!q) return alert('Quote haikupatikana.')
    await generateQuotePdf({ quote: q, customer: q.customers || {}, items: q.quote_items || [] })
  }

  const field = 'w-full rounded-xl border border-brand-mist px-4 py-2.5 outline-none focus:border-brand-purple'
  const label = 'mb-1 block text-sm font-semibold text-brand-ink/70'

  return (
    <div className="min-h-screen bg-brand-mist/60 font-body text-brand-ink">
      <header className="sticky top-0 z-40 border-b border-brand-mist bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="h-10 w-auto" />
            <span className="font-display text-brand-purple">Quote Calculator</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-brand-ink/50 sm:block">{session.user.email}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="rounded-full border border-brand-mist px-4 py-1.5 font-semibold text-brand-ink/70 hover:border-brand-purple hover:text-brand-purple"
            >
              Toka
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Mteja */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg text-brand-purple">1. Mteja</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <label className={label}>Jina *</label>
                <input className={field} value={custName} onChange={(e) => setCustName(e.target.value)} />
              </div>
              <div>
                <label className={label}>Simu *</label>
                <input className={field} value={custPhone} onChange={(e) => setCustPhone(e.target.value)} placeholder="0712..." />
              </div>
              <div>
                <label className={label}>Biashara</label>
                <input className={field} value={custBusiness} onChange={(e) => setCustBusiness(e.target.value)} />
              </div>
            </div>
          </section>

          {/* Bidhaa */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg text-brand-purple">2. Bidhaa</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className={label}>Aina ya kazi</label>
                <select
                  className={field}
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value)
                    setTierId('')
                    setManualMode(false)
                    setQty('1')
                  }}
                >
                  {Object.entries(CATEGORY_LABELS).map(([id, l]) => (
                    <option key={id} value={id}>{l}</option>
                  ))}
                </select>
              </div>

              {isMeterCategory && !manualMode && (
                <div>
                  <label className={label}>Upana (urefu ni 1m standard)</label>
                  <div className="flex flex-wrap gap-2">
                    {catRates.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setTierId(r.id)}
                        className={
                          'rounded-xl border px-4 py-2 text-sm font-semibold transition ' +
                          (String(tierId) === String(r.id)
                            ? 'border-brand-purple bg-brand-purple text-white'
                            : 'border-brand-mist bg-white hover:border-brand-purple')
                        }
                      >
                        {r.size_label}
                        <span className="block text-xs font-normal opacity-80">{TZS(r.price_tzs)}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => setManualMode(true)}
                      className="rounded-xl border border-dashed border-brand-orange px-4 py-2 text-sm font-semibold text-brand-orangedeep hover:bg-brand-orange/10"
                    >
                      Size nyingine (bei maalum)
                    </button>
                  </div>
                </div>
              )}

              {isMeterCategory && manualMode && (
                <div className="rounded-xl border border-brand-orange/50 bg-brand-orange/5 p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className={label}>Upana (mita)</label>
                      <input className={field} type="number" step="0.1" value={manualSize} onChange={(e) => setManualSize(e.target.value)} placeholder="k.m. 2.5" />
                    </div>
                    <div>
                      <label className={label}>Bei unayopanga (TZS)</label>
                      <input className={field} type="number" value={manualPrice} onChange={(e) => setManualPrice(e.target.value)} placeholder="k.m. 1000000" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-brand-ink/60">
                    Rejea: {catRates.map((r) => `${r.size_label} = ${TZS(r.price_tzs)}`).join(' · ')}
                  </p>
                  <button onClick={() => setManualMode(false)} className="mt-2 text-sm font-semibold text-brand-purple hover:underline">
                    ← Rudi kwenye size za kawaida
                  </button>
                </div>
              )}

              {category === 'ndani' && (
                <div>
                  <label className={label}>Aina</label>
                  <div className="flex flex-wrap gap-2">
                    {catRates.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setTierId(r.id)}
                        className={
                          'rounded-xl border px-4 py-2 text-sm font-semibold transition ' +
                          (String(tierId) === String(r.id)
                            ? 'border-brand-purple bg-brand-purple text-white'
                            : 'border-brand-mist bg-white hover:border-brand-purple')
                        }
                      >
                        {r.size_label}
                        <span className="block text-xs font-normal opacity-80">{TZS(r.price_tzs)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isPerUnit && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={label}>{category === 'cnc' ? 'Aina ya cutting' : 'Kiwango'}</label>
                    <select className={field} value={tierId} onChange={(e) => setTierId(e.target.value)}>
                      <option value="">— chagua —</option>
                      {catRates.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.size_label} ({TZS(r.price_tzs)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={label}>{category === 'cnc' ? 'Idadi ya sheets' : 'Mita za mraba (m²)'}</label>
                    <input className={field} type="number" step="0.1" min="0" value={qty} onChange={(e) => setQty(e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Extras */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg text-brand-purple">3. Nyongeza</h2>
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={siteVisit} onChange={(e) => setSiteVisit(e.target.checked)} className="h-5 w-5 accent-brand-purple" />
                <span>Site visit + nauli ({TZS(siteVisitRate)})</span>
              </label>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={label}>Installation (TZS)</label>
                  <input className={field} type="number" value={installation} onChange={(e) => setInstallation(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className={label}>Transport (TZS)</label>
                  <input className={field} type="number" value={transport} onChange={(e) => setTransport(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label className={label}>Design (TZS)</label>
                  <input className={field} type="number" value={designFee} onChange={(e) => setDesignFee(e.target.value)} placeholder="0" />
                </div>
              </div>
              <div className="sm:w-1/3">
                <label className={label}>Punguzo / Discount (TZS)</label>
                <input className={field} type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" />
              </div>
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="space-y-4">
          <div className="sticky top-20 space-y-4">
            <div className="rounded-2xl bg-brand-purple p-6 text-white shadow-lg">
              <h3 className="font-display text-lg">Muhtasari</h3>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="opacity-80">Bidhaa</span><span>{TZS(itemTotal)}</span></div>
                <div className="flex justify-between"><span className="opacity-80">Nyongeza</span><span>{TZS(extrasTotal)}</span></div>
                <div className="flex justify-between"><span className="opacity-80">Punguzo</span><span>-{TZS(Number(discount) || 0)}</span></div>
                <div className="mt-3 flex justify-between border-t border-white/20 pt-3 text-base font-bold">
                  <span>JUMLA</span><span>{TZS(total)}</span>
                </div>
                <div className="flex justify-between text-brand-orange">
                  <span>Advance 70%</span><span>{TZS(total * 0.7)}</span>
                </div>
                <div className="flex justify-between opacity-80">
                  <span>Baada ya kazi 30%</span><span>{TZS(total * 0.3)}</span>
                </div>
              </div>
              <button
                onClick={saveQuote}
                disabled={saving}
                className="mt-5 w-full rounded-xl bg-brand-orange py-2.5 font-semibold text-brand-ink transition hover:bg-brand-orangedeep disabled:opacity-50"
              >
                {saving ? 'Inahifadhi...' : 'Hifadhi Quote'}
              </button>
              {savedMsg && <p className="mt-3 text-sm">{savedMsg}</p>}
              {lastSaved && (
                <button
                  onClick={() => generateQuotePdf(lastSaved)}
                  className="mt-3 w-full rounded-xl border-2 border-brand-orange bg-transparent py-2.5 font-semibold text-white transition hover:bg-white/10"
                >
                  📄 Pakua PDF ({lastSaved.quote.quote_number})
                </button>
              )}
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="font-display text-sm text-brand-purple">Quotes za karibuni</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {recent.length === 0 && <li className="text-brand-ink/50">Hakuna bado.</li>}
                {recent.map((q) => (
                  <li key={q.quote_number} className="flex items-center justify-between gap-2 border-b border-brand-mist pb-1 last:border-0">
                    <span>
                      {q.quote_number}
                      <span className="block text-xs text-brand-ink/50">{q.customers?.name}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-semibold">{TZS(q.total)}</span>
                      <button
                        onClick={() => downloadPdfFor(q.quote_number)}
                        title="Pakua PDF"
                        className="rounded-lg border border-brand-mist px-2 py-1 text-xs font-semibold text-brand-purple hover:border-brand-purple"
                      >
                        PDF
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
