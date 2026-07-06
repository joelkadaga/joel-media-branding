# Joel Media Branding — Website & Quoting System

Phase 1: Public homepage (React + Vite + Tailwind), deployed free on Cloudflare Pages.

## ⚠️ Kabla ya kuanza — Badilisha namba ya WhatsApp

Fungua `src/App.jsx`, mstari wa 4:

```js
const WHATSAPP_NUMBER = '255XXXXXXXXX' // weka namba yako, mfano: 255712345678
const PHONE_DISPLAY = '+255 XXX XXX XXX'
```

## Hatua ya 1 — Weka code kwenye GitHub

**Njia rahisi (bila kuandika commands):**
1. Nenda github.com → login → **New repository**
2. Jina: `joel-media-branding` → Create repository
3. Bonyeza **uploading an existing file** → buruta (drag) mafaili YOTE ya folda hii (isipokuwa `node_modules` kama ipo) → **Commit changes**

**Au kwa git commands (kama unatumia kompyuta yenye git):**
```bash
git init
git add .
git commit -m "Phase 1: homepage"
git branch -M main
git remote add origin https://github.com/USERNAME/joel-media-branding.git
git push -u origin main
```

## Hatua ya 2 — Deploy kwenye Cloudflare Pages (BURE)

1. Nenda dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Chagua repository `joel-media-branding`
3. Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Bonyeza **Save and Deploy**

Baada ya dakika 1–2, site yako iko live kwenye `joel-media-branding.pages.dev` — BURE kabisa.

## Hatua ya 3 — Unganisha domain yako

1. Nunua `joelmediabranding.com` (Cloudflare Registrar ni rahisi zaidi, ~$10/mwaka)
2. Kwenye Pages project → **Custom domains** → **Set up a custom domain** → andika `joelmediabranding.com`
3. Cloudflare inaunganisha automatic (kama domain iko Cloudflare)

## Kufanya kazi kwenye kompyuta yako (optional)

```bash
npm install
npm run dev      # inafungua http://localhost:5173
npm run build    # inatengeneza folda ya dist/ kwa ajili ya production
```

## Phases zinazofuata

- **Phase 2:** Katalogi + Portfolio (picha za kazi) + Supabase
- **Phase 3:** Staff login + Quote Calculator (rate table)
- **Phase 4:** Quote PDF + kutuma WhatsApp/Email
- **Phase 5:** Customers + Job tracking
- **Phase 6:** Manager.io integration (invoices automatic)

Angalia `MASTER-PLAN.md` kwa maelezo kamili.
