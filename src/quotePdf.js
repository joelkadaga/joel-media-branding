import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const PURPLE = [77, 80, 162]
const ORANGE = [252, 188, 101]
const INK = [38, 40, 79]

const TZS = (n) => new Intl.NumberFormat('en-US').format(Math.round(n || 0))

let logoCache = null
async function loadLogo() {
  if (logoCache) return logoCache
  const blob = await (await fetch('/logo.png')).blob()
  const dataUrl = await new Promise((res) => {
    const r = new FileReader()
    r.onload = () => res(r.result)
    r.readAsDataURL(blob)
  })
  const img = await new Promise((res) => {
    const i = new Image()
    i.onload = () => res(i)
    i.src = dataUrl
  })
  logoCache = { dataUrl, ratio: img.height / img.width }
  return logoCache
}

/**
 * quote:    { quote_number, created_at, valid_until, subtotal, extras[], discount, total, deposit_percent }
 * customer: { name, business_name, phone }
 * items:    [{ description, size_value, unit_price, line_total }]
 */
export async function generateQuotePdf({ quote, customer, items }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const M = 15

  // ===== Header band =====
  doc.setFillColor(...PURPLE)
  doc.rect(0, 0, W, 36, 'F')

  try {
    const logo = await loadLogo()
    const lw = 52
    const lh = lw * logo.ratio
    // white card behind logo for readability
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(M - 3, 18 - lh / 2 - 3, lw + 6, lh + 6, 2, 2, 'F')
    doc.addImage(logo.dataUrl, 'PNG', M, 18 - lh / 2, lw, lh)
  } catch {
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('JOEL MEDIA BRANDING', M, 20)
  }

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('NUKUU YA BEI', W - M, 16, { align: 'right' })
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('QUOTATION', W - M, 22, { align: 'right' })
  doc.setFillColor(...ORANGE)
  doc.rect(W - M - 60, 26, 60, 0.8, 'F')

  // ===== Meta =====
  let y = 45
  doc.setTextColor(...INK)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Joel Media Branding · Dar es Salaam, Tanzania', M, y)
  doc.text('+255 745 152 680 / +255 627 150 780 · joelmediabranding.com', M, y + 4.5)

  doc.setFont('helvetica', 'bold')
  doc.text(`Namba: ${quote.quote_number}`, W - M, y, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  const dt = (d) => new Date(d).toLocaleDateString('sw-TZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
  doc.text(`Tarehe: ${dt(quote.created_at || Date.now())}`, W - M, y + 4.5, { align: 'right' })
  doc.text(`Inatumika hadi: ${dt(quote.valid_until)}`, W - M, y + 9, { align: 'right' })

  // ===== Customer =====
  y += 16
  doc.setFillColor(244, 244, 251)
  doc.roundedRect(M, y, W - 2 * M, 16, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('KWA:', M + 4, y + 6)
  doc.setFont('helvetica', 'normal')
  const custLine = [customer.name, customer.business_name, customer.phone].filter(Boolean).join('  ·  ')
  doc.text(custLine, M + 16, y + 6)
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 140)
  doc.text('Asante kwa kutuamini. Hii ni makadirio rasmi ya gharama za kazi yako.', M + 4, y + 12)
  doc.setTextColor(...INK)

  // ===== Items table =====
  y += 22
  const rows = items.map((it, i) => [
    String(i + 1),
    it.description,
    it.size_value ? String(it.size_value) : '-',
    TZS(it.unit_price),
    TZS(it.line_total),
  ])
  for (const ex of quote.extras || []) {
    rows.push(['+', ex.label, '-', '-', TZS(ex.amount)])
  }

  autoTable(doc, {
    startY: y,
    margin: { left: M, right: M },
    head: [['#', 'Maelezo', 'Kiasi', 'Bei (TZS)', 'Jumla (TZS)']],
    body: rows,
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 9, textColor: INK, lineColor: [225, 225, 235], lineWidth: 0.2 },
    headStyles: { fillColor: PURPLE, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 32, halign: 'right' },
    },
  })

  // ===== Totals =====
  let ty = doc.lastAutoTable.finalY + 6
  const depositPct = quote.deposit_percent || 70
  const totalRows = []
  if (quote.discount) totalRows.push(['Punguzo', '-' + TZS(quote.discount)])
  totalRows.push(['JUMLA KUU', TZS(quote.total) + ' TZS'])
  totalRows.push([`Malipo ya awali (${depositPct}%)`, TZS(quote.total * depositPct / 100) + ' TZS'])
  totalRows.push([`Baada ya kazi (${100 - depositPct}%)`, TZS(quote.total * (100 - depositPct) / 100) + ' TZS'])

  autoTable(doc, {
    startY: ty,
    margin: { left: W - M - 90, right: M },
    body: totalRows,
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 10, textColor: INK },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55 }, 1: { halign: 'right', cellWidth: 35 } },
    didParseCell: (d) => {
      if (d.row.index === (quote.discount ? 1 : 0)) {
        d.cell.styles.fillColor = PURPLE
        d.cell.styles.textColor = [255, 255, 255]
        d.cell.styles.fontStyle = 'bold'
        d.cell.styles.fontSize = 11
      }
    },
  })

  // ===== Payment details =====
  let py = doc.lastAutoTable.finalY + 8
  doc.setFillColor(244, 244, 251)
  doc.roundedRect(M, py, W - 2 * M, 34, 2, 2, 'F')
  doc.setFillColor(...ORANGE)
  doc.rect(M, py, 2, 34, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('NJIA ZA MALIPO', M + 6, py + 7)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Bank: CRDB Bank  ·  Jina: JOEL MEDIA  ·  Akaunti: 015C001K1KU00', M + 6, py + 14)
  doc.text('M-Pesa Lipa Namba: 37180938  ·  Jina: Joel Media', M + 6, py + 20)
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 140)
  doc.text('Baada ya kufanya malipo tutaarifu kwa kutuma muamala ili tuendelee na hatua inayofuata.', M + 6, py + 27)
  doc.setTextColor(...INK)

  // ===== Terms + footer =====
  let fy = py + 42
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 140)
  doc.text(
    [
      `· Nukuu hii inatumika kwa siku 30 tangu tarehe ya kutolewa.`,
      `· Kazi huanza baada ya malipo ya awali ya ${depositPct}%.`,
      `· Bei zinajumuisha kazi kama ilivyoelezwa; mabadiliko ya design/kipimo yanaweza kubadilisha bei.`,
    ],
    M,
    fy
  )

  doc.setFillColor(...PURPLE)
  doc.rect(0, 285, W, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.text('Joel Media Branding — Bango lako, biashara yako.', W / 2, 292, { align: 'center' })

  doc.save(`${quote.quote_number}.pdf`)
}
