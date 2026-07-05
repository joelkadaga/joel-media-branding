# MASTER PLAN — Joel Media Branding: Website & Quoting System

**System name:** Joel Media Branding
**Domain:** joelmediabranding.com
**Brand colors (from logo):** Purple/Indigo (primary) + Warm Orange (accent), white backgrounds
**Logo:** provided (Artboard_2.png) — use on website header, admin panel, and quote PDFs
**Owner:** Joel Media (CNC branding office, Dar es Salaam, Tanzania)
**Goal:** A public catalog website + internal staff system for quoting, customer management, and job tracking, integrated with Manager.io (Cloud edition) for invoicing.
**Cost target:** Free-tier hosting (Cloudflare Pages + Supabase). Domain only paid item.
**Languages:** Public site in Swahili (primary) with English toggle. Admin panel in English.

---

## 1. SYSTEM OVERVIEW

Two parts, one codebase:

1. **Public website (catalog)** — for customers who are not technical. No prices shown. No jargon. Big photos, simple Swahili descriptions, WhatsApp contact everywhere.
2. **Staff system (admin)** — login-protected. Quote calculator with the official rate table, customer records, quote PDF generator, job tracking, Manager.io sync.

**Stack:**
- Frontend: React + Vite + Tailwind CSS
- Database/Auth/Storage: Supabase (free tier)
- Hosting: Cloudflare Pages (free), auto-deploy from GitHub
- Serverless functions: Cloudflare Workers (Manager.io API calls, PDF generation, keeping the access token secret)
- Manager.io Cloud API (api2, X-Api-Key access token stored as a Cloudflare secret — NEVER in frontend code)

---

## 2. PUBLIC WEBSITE (CUSTOMER-FACING)

### Pages
1. **Home** — hero with best signage photo, short intro, category cards, WhatsApp button (floating, always visible)
2. **Katalogi (Catalog)** — gallery filtered by category:
   - Mabango ya 3D
   - Mabango ya 2D
   - Mabango ya Kawaida (yanawaka taa / hayawaki taa)
   - Mabango ya Ndani
   - CNC Cutting (maua, decorative panels)
   - Mabanner, Stika, Vehicle Branding, Office Branding
3. **Kazi Zetu (Portfolio)** — finished projects with client shop photos (before/after where possible)
4. **Kuhusu Sisi (About)** — the office, the machines (CNC), the team
5. **Wasiliana Nasi (Contact)** — WhatsApp click-to-chat, phone, location map, simple inquiry form (name, phone, "nini unahitaji?")

### Design rules for non-technical customers
- Every catalog item: 1 big photo + 2-line plain-Swahili description + "Uliza bei kwa WhatsApp" button that pre-fills a WhatsApp message with the item name
- No technical words without explanation (e.g. "Bango la 3D — herufi zinazoinuka kama sanamu, zinawaka taa usiku")
- Mobile-first: most customers will view on phones
- Fast loading: compressed images via Supabase Storage + Cloudflare CDN

---

## 3. STAFF SYSTEM (ADMIN PANEL)

Login via Supabase Auth (email + password, roles: admin / staff).

### 3.1 Quote Calculator
Staff selects, system calculates — no guessing.

**Official Rate Table (editable in admin settings):**

| Category | Size | Price (TZS) |
|---|---|---|
| Mabango ya 3D | Mita 1 | 500,000 |
| Mabango ya 3D | Mita 2 | 850,000 |
| Mabango ya 3D | Mita 3 | 1,200,000 |
| Mabango ya 3D | Mita 4 | 1,600,000 |
| Mabango ya 3D | Mita 5 | 2,000,000 |
| Mabango ya 2D | Mita 1 | 350,000 |
| Mabango ya 2D | Mita 2 | 600,000 |
| Mabango ya 2D | Mita 3 | 800,000 |
| Kawaida (yanawaka taa) | Mita 1 | 200,000 |
| Kawaida (yanawaka taa) | Mita 2 | 350,000 |
| Kawaida (yanawaka taa) | Mita 3 | 500,000 |
| Kawaida (hayawaki taa) | Mita 1 | 200,000 |
| Kawaida (hayawaki taa) | Mita 2 | 300,000 |
| Kawaida (hayawaki taa) | Mita 3 | 400,000 |
| Mabango ya Ndani (2D) | Lenye kuwaka taa | 250,000 (flat) |
| Mabango ya Ndani (2D) | Lisilowaka taa | 150,000 (flat) |
| CNC Cutting — kawaida | Per sheet | 20,000 |
| CNC Cutting — kuchonga maua | Per sheet | 50,000 |
| Mabanner / Stika / Vehicle Branding | Per square meter | 30,000 |
| Site visit + nauli | Flat | 20,000 |

**Size definition:** "Mita 1/2/3..." = the WIDTH of the signage. Height is always standard at 1 meter. The calculator asks for width only; if a customer needs non-standard height, staff prices manually.

**Calculator behavior:**
- Staff picks category → enters width in meters (height standard 1m), or number of sheets for CNC cutting, or square meters for banners/stickers/vehicle branding
- Exact tier match → exact price automatically
- In-between sizes (e.g. 1.5m, 2.5m) → NO automatic interpolation. Staff sets the price manually (system shows the nearest tiers as reference, and logs the manual price with staff name)
- Checkboxes for extras: Site visit (+20,000), Installation (manual amount), Transport (manual amount), Design fee (manual amount)
- Optional discount field (percentage or fixed, requires admin role above a set limit)
- Live total shown in TZS

### 3.2 Quote Generator
- One click → branded PDF quote: Joel Media Branding logo (purple/orange), quote number (JMB-2026-0001), date, valid-until (**30 days**), customer details, itemized lines, subtotal, extras, total, payment terms (**70% deposit, balance on completion**), signature line
- **Payment details printed on every quote (Njia za Malipo):**
  - Bank: CRDB Bank — Business name: JOEL MEDIA — Account No: 015C001K1KU00
  - M-Pesa Lipa Namba: 37180938 — Account Name: Joel Media
  - Note in Swahili: "Baada ya kufanya malipo tutaarifu kwa kutuma muamala ili tuendelee na hatua inayofuata"
- Buttons: "Send via WhatsApp" (opens wa.me link with message + PDF), "Send via Email", "Download PDF"
- Every quote saved with status: Draft → Sent → Approved → Rejected / Expired

### 3.3 Customer Management
- Customer record: name, business name, phone (WhatsApp), email, location, notes
- History of all quotes and jobs per customer
- Initial import: pull existing customers from Manager.io via API (one-time sync), then two-way: new customers created in the system are pushed to Manager.io

### 3.4 Job Tracking
When a quote is approved it becomes a **Job**:
- Statuses: Approved → Deposit Paid → In Production → Ready → Installed/Delivered → Completed
- Fields: deposit amount/date, balance, expected completion date, assigned staff, site photos on completion (feeds the portfolio!)
- Dashboard: jobs in progress, quotes awaiting reply, this month's totals

### 3.5 Manager.io Integration (Cloud API)
- Access token created in Manager.io → Settings → Access Tokens, stored as Cloudflare Worker secret
- On quote approval: create Sales Invoice in Manager.io automatically (customer, line items, amounts)
- On deposit recorded: optionally create Receipt in Manager.io
- Customer sync: check by name/phone before creating duplicates
- All accounting/tax reporting stays in Manager.io — this system does NOT replicate accounting

### 3.6 Settings (admin only)
- Edit rate table prices (history of changes kept)
- Company details for quote PDF (logo, phone, TIN, payment accounts)
- Staff accounts and roles
- Quote validity days (default 30), deposit percentage (default 70%)

---

## 4. DATABASE DESIGN (Supabase)

- **customers** — id, name, business_name, phone, email, location, manager_io_id, notes, created_at
- **rate_table** — id, category, size_label, meters (nullable), price_tzs, unit (per_item/per_sheet/flat), active, updated_by, updated_at
- **quotes** — id, quote_number, customer_id, status, subtotal, extras_json, discount, total, valid_until, created_by, pdf_url, created_at
- **quote_items** — id, quote_id, category, description, meters/qty, unit_price, manual_override (bool), line_total
- **jobs** — id, quote_id, customer_id, status, deposit_amount, deposit_date, balance, expected_date, assigned_to, completed_at
- **portfolio_items** — id, title_sw, title_en, description_sw, description_en, category, image_urls, featured, job_id (nullable), published
- **staff** — handled by Supabase Auth + profiles table (name, role)
- **activity_log** — who did what, when (price changes, overrides, quote sends)

Row Level Security: public can read only published portfolio_items; everything else requires auth.

---

## 5. BUILD ORDER (step by step with Claude)

1. **Phase 1 — Foundation:** GitHub repo, Vite + React + Tailwind setup, Supabase project, deploy "hello world" to Cloudflare Pages (proves the pipeline works)
2. **Phase 2 — Public site:** Home, Catalog, Portfolio, Contact pages with WhatsApp integration; admin upload for portfolio images
3. **Phase 3 — Auth + Calculator:** Staff login, rate table in database, quote calculator with interpolation + overrides
4. **Phase 4 — Quote PDF + sending:** Branded PDF generation, WhatsApp/email send, quote statuses
5. **Phase 5 — Customers + Jobs:** Customer records, job tracking dashboard
6. **Phase 6 — Manager.io sync:** Cloudflare Worker, customer import, invoice creation on approval
7. **Phase 7 — Polish:** Swahili/English toggle, activity log, mobile testing, launch

Each phase is independently useful — the site can go live after Phase 2 while the rest is built.

---

## 6. CONFIRMED DECISIONS (Joel, July 2026)

1. In-between sizes: **staff always sets price manually** (no auto interpolation; nearest tiers shown as reference)
2. "Mita" = **width**; height is always standard **1 meter**
3. Mabango ya 3D, Mita 4 = **TZS 1,600,000**
4. Deposit: **70%** upfront. Payments: CRDB Bank (JOEL MEDIA, 015C001K1KU00) and M-Pesa Lipa Namba 37180938
5. Quote validity: **30 days**
6. Domain: **joelmediabranding.com**
7. Banners / stickers / vehicle branding: **TZS 30,000 per square meter** (in the rate table)
8. System name: **Joel Media Branding** — brand colors purple + orange from logo
