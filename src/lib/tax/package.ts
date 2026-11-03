// src/lib/tax/package.ts
// The folder you hand to the Steuerberater, as a list of files (CSV for German Excel and plain text). Pure: data in, files out.

import type { ZipFile } from '../zip'
import { estimateTax } from './estimate'
import { inYear, steuerberaterCsv, summarize } from './report'
import { displayName } from './revolut'
import type { LedgerTx, TaxSettings } from './types'

export interface StatementLite { bank: string; account: string; currency: string; from: string | null; to: string | null; opening: number | null; closing: number | null; bankDebit: [number | null, number | null]; bankCredit: [number | null, number | null]; readDebit: [number, number]; readCredit: [number, number]; verified: boolean; note: string }
export interface MatchLite { id: string; kind: 'exchange' | 'payment'; status: 'suggested' | 'confirmed' | 'rejected'; auto: boolean; egpTxId: string; eurTxId: string | null; checkoutId: string | null; dealId: string | null; expected: string | null; rate: number | null }
export interface SaleLite { source: 'website' | 'manual'; code: string; date: string; customer: string; items: string; totalEgp: number; depositEgp: number; depositStatus: string; bankDate: string | null; bankAmount: number | null; status: string; deliveredAt: string | null; checkoutId: string | null; dealId: string | null }

export interface PackageInput { year: number; generatedOn: string; txs: LedgerTx[]; statements: StatementLite[]; matches: MatchLite[]; sales: SaleLite[]; settings: TaxSettings }

const BOM = '﻿'
const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100
const de = (n: number | null | undefined) => (n === null || n === undefined ? '' : n.toFixed(2).replace('.', ','))
const cell = (v: unknown) => { const s = v === null || v === undefined ? '' : String(v); return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
const csv = (head: string[], rows: unknown[][]) => BOM + [head, ...rows].map((r) => r.map(cell).join(';')).join('\r\n') + '\r\n'

export function buildPackage(i: PackageInput): ZipFile[] {
  const byId = new Map(i.txs.map((t) => [t.id, t]))
  const yr = (t: { date: string }) => inYear(t, i.year)
  const s = summarize(i.txs, i.year)
  const est = estimateTax({ profit: s.profit, turnover: s.income, priorYearTurnover: i.settings.priorYearTurnover, salaryTaxable: i.settings.salaryTaxableEur, hebesatzPct: i.settings.hebesatzPct })

  // exchanges of the year
  const exchanges = i.matches.filter((m) => m.kind === 'exchange' && m.status !== 'rejected').map((m) => ({ m, egp: byId.get(m.egpTxId), eur: m.eurTxId ? byId.get(m.eurTxId) : undefined })).filter((x) => x.egp && yr(x.egp))
  const confirmedEx = exchanges.filter((x) => x.m.status === 'confirmed' && x.eur)
  const exEgp = r2(confirmedEx.reduce((sum, x) => sum + Math.abs(x.egp!.amount), 0))
  const exEur = r2(confirmedEx.reduce((sum, x) => sum + x.eur!.amount, 0))
  const avgRate = exEur > 0 ? r2(exEgp / exEur) : null

  // EGP money that customers paid, as the bank shows it
  const egpIn = i.txs.filter((t) => t.currency === 'EGP' && t.amount > 0 && yr(t))
  const payByTx = new Map(i.matches.filter((m) => m.kind === 'payment' && m.status !== 'rejected').map((m) => [m.egpTxId, m]))
  const customerEgp = r2(egpIn.filter((t) => t.treatment === 'business').reduce((sum, t) => sum + t.amount, 0))
  const sales = i.sales.filter((x) => x.date.startsWith(`${i.year}-`))

  const unreviewed = i.txs.filter((t) => yr(t) && t.treatment === 'unreviewed')
  const noReceipt = i.txs.filter((t) => yr(t) && t.treatment === 'business' && t.currency === 'EUR' && t.amount < 0 && !t.hasReceipt)
  const suggested = i.matches.filter((m) => m.status === 'suggested')
  const unproven = i.statements.filter((x) => !x.verified)

  const summary = [
    `PULSE GEAR EGYPT - Steuerunterlagen ${i.year} / Tax documents ${i.year}`,
    `Erstellt / created: ${i.generatedOn}`,
    '',
    'WICHTIG / IMPORTANT',
    'Dies ist eine Vorbereitung des Inhabers, keine Steuererklaerung. Alle Zahlen muessen vom Steuerberater geprueft werden.',
    'This is the owner\'s preparation, not a tax return. Every figure must be reviewed by the Steuerberater.',
    '',
    'ERGEBNIS NACH EUER (Zufluss/Abfluss auf dem Revolut-Konto in EUR) / RESULT, cash basis, Revolut EUR account',
    `Betriebseinnahmen / business income:  ${de(s.income)} EUR  (${s.incomeCount} Zahlungen)`,
    `Betriebsausgaben / business expenses: ${de(s.expenses)} EUR`,
    `Gewinn / profit:                       ${de(s.profit)} EUR`,
    '',
    'ANDERE SICHT: KUNDENZAHLUNGEN IN AEGYPTEN / OTHER VIEW: customer payments received in Egypt',
    `Zahlungen von Kunden auf das CIB/QNB-Konto / customer payments in EGP: ${de(customerEgp)} EGP`,
    avgRate ? `Tatsaechlich erzielter Durchschnittskurs aus ${confirmedEx.length} bestaetigten Umtauschvorgaengen: ${avgRate.toFixed(2).replace('.', ',')} EGP je EUR` : 'Noch kein bestaetigter Umtausch, daher kein Durchschnittskurs.',
    avgRate ? `Grobe Umrechnung dieser Zahlungen / rough conversion: ${de(r2(customerEgp / avgRate))} EUR (nur Schaetzung)` : '',
    'FRAGE AN DEN STEUERBERATER: Welcher Zeitpunkt zaehlt als Einnahme (Zahlungseingang in Aegypten oder Eingang der Euro auf Revolut), und welcher Kurs?',
    '',
    'GESCHAETZTE STEUER (nur Planung) / ESTIMATED TAX (planning only)',
    `Einkommensteuer-Mehrbetrag ${de(est.incomeTaxExtra)} EUR, Soli ${de(est.soliExtra)} EUR, Gewerbesteuer ${de(est.tradeTax)} EUR (angerechnet: ${de(est.tradeTaxCredit)} EUR)`,
    `Gesamt / total: ${de(est.totalTax)} EUR${est.reservePct !== null ? ` = ca. ${est.reservePct} % des Gewinns` : ''}`,
    `Kleinunternehmer: ${est.kleinunternehmer.eligible ? 'Grenzen eingehalten (nach Eingaben des Inhabers)' : 'Grenzen ueberschritten'}`,
    ...est.notes.map((n) => `- ${n}`),
    '',
    'OFFENE PUNKTE / OPEN ITEMS',
    `Nicht zugeordnete Buchungen / undecided lines: ${unreviewed.length}`,
    `Ausgaben ohne Beleg / expenses without receipt: ${noReceipt.length}`,
    `Vorgeschlagene, noch nicht bestaetigte Zuordnungen / matches awaiting confirmation: ${suggested.length}`,
    `Kontoauszuege ohne Vollstaendigkeitsnachweis / statements not proven complete: ${unproven.length}`,
    '(Details: 07-offene-punkte.csv)',
    '',
  ].filter((l) => l !== undefined).join('\r\n')

  const readme = [
    'INHALT / CONTENTS',
    '01-zusammenfassung.txt        Ergebnis, Schaetzung, offene Punkte',
    '02-einnahmen-ausgaben.csv     Betriebseinnahmen und -ausgaben (Revolut, EUR) mit Belegstatus',
    '03-waehrungsumtausch.csv      EGP gesendet <-> EUR erhalten, mit tatsaechlichem Kurs',
    '04-kundenzahlungen-egp.csv    Eingaenge auf dem CIB/QNB-Konto, zugeordnet zu Bestellungen',
    '05-verkaeufe.csv              Alle Bestellungen: Kunde, Artikel, Betrag, Anzahlung, Bankbeleg, Lieferung',
    '06-kontoauszuege-pruefung.csv Kontrollsummen der Bank neben den gelesenen Summen (Vollstaendigkeit)',
    '07-offene-punkte.csv          Was noch geklaert werden muss',
    '08-bankumsaetze-egp.csv       Alle CIB/QNB-Buchungen des Jahres',
    '',
    'Beizulegen (nicht in diesem Ordner): Original-Kontoauszuege (PDF), Belege, WhatsApp-Chats der Umtauschvorgaenge.',
    'To add yourself: original bank statement PDFs, receipts, the WhatsApp chats of the exchanges.',
  ].join('\r\n')

  const exchangeCsv = csv(['Datum EGP gesendet', 'EGP', 'Datum EUR erhalten', 'EUR', 'Kurs EGP je EUR', 'Empfaenger (Bank)', 'Absender (Revolut)', 'CIB-Referenz', 'Status'],
    exchanges.sort((a, b) => a.egp!.date.localeCompare(b.egp!.date)).map((x) => [x.egp!.date, de(Math.abs(x.egp!.amount)), x.eur?.date ?? '', de(x.eur?.amount), x.m.rate ? x.m.rate.toFixed(4).replace('.', ',') : '', x.egp!.counterpartyName ?? '', x.eur ? displayName(x.eur.merchantKey) : '', x.egp!.reference ?? '', x.m.status === 'confirmed' ? (x.m.auto ? 'bestaetigt (automatisch)' : 'bestaetigt') : 'NOCH ZU PRUEFEN']))

  const customerCsv = csv(['Datum', 'Betrag EGP', 'Zahler Telefon', 'Zahler Name', 'Bank-Referenz', 'Bestellung', 'Betrag entspricht', 'Behandlung'],
    egpIn.sort((a, b) => a.date.localeCompare(b.date)).map((t) => {
      const m = payByTx.get(t.id)
      const sale = m ? i.sales.find((x) => (m.checkoutId && x.checkoutId === m.checkoutId) || (m.dealId && x.dealId === m.dealId)) : undefined
      return [t.date, de(t.amount), t.counterpartyPhone ?? '', t.counterpartyName ?? '', t.reference ?? '', sale?.code ?? '', m ? (m.expected === 'deposit' ? 'Anzahlung' : m.expected === 'full' ? 'voller Betrag' : 'anderer Betrag') : '', t.treatment === 'business' ? 'geschaeftlich' : t.treatment === 'personal' ? 'privat' : t.treatment === 'internal' ? 'intern' : 'OFFEN']
    }))

  const salesCsv = csv(['Datum', 'Bestellung', 'Quelle', 'Kunde', 'Artikel', 'Gesamt EGP', 'Anzahlung EGP', 'Anzahlung Status', 'Bankeingang Datum', 'Bankeingang EGP', 'Status', 'Geliefert am'],
    sales.sort((a, b) => a.date.localeCompare(b.date)).map((x) => [x.date, x.code, x.source === 'website' ? 'Webshop' : 'manuell', x.customer, x.items, de(x.totalEgp), de(x.depositEgp), x.depositStatus, x.bankDate ?? '', de(x.bankAmount), x.status, x.deliveredAt ?? '']))

  const statementsCsv = csv(['Bank', 'Konto (letzte 4)', 'Waehrung', 'Von', 'Bis', 'Anfangssaldo', 'Endsaldo', 'Soll Anzahl (Bank)', 'Soll Summe (Bank)', 'Soll Anzahl (gelesen)', 'Soll Summe (gelesen)', 'Haben Anzahl (Bank)', 'Haben Summe (Bank)', 'Haben Anzahl (gelesen)', 'Haben Summe (gelesen)', 'Vollstaendig nachgewiesen', 'Hinweis'],
    i.statements.map((x) => [x.bank.toUpperCase(), x.account.slice(-4), x.currency, x.from, x.to, de(x.opening), de(x.closing), x.bankDebit[0] ?? '', de(x.bankDebit[1]), x.readDebit[0], de(x.readDebit[1]), x.bankCredit[0] ?? '', de(x.bankCredit[1]), x.readCredit[0], de(x.readCredit[1]), x.verified ? 'ja' : 'NEIN', x.note]))

  const open: unknown[][] = []
  for (const t of unreviewed) open.push(['Buchung nicht zugeordnet', t.date, t.description, de(t.amount), t.currency])
  for (const t of noReceipt) open.push(['Beleg fehlt', t.date, t.description, de(t.amount), t.currency])
  for (const m of suggested) { const e = byId.get(m.egpTxId); open.push([m.kind === 'exchange' ? 'Umtausch-Zuordnung unbestaetigt' : 'Kundenzahlung-Zuordnung unbestaetigt', e?.date ?? '', e?.description ?? '', de(e?.amount), e?.currency ?? '']) }
  for (const x of unproven) open.push(['Kontoauszug nicht nachgewiesen', x.to ?? '', `${x.bank.toUpperCase()} ${x.account.slice(-4)}: ${x.note}`, '', x.currency])
  const openCsv = csv(['Art', 'Datum', 'Beschreibung', 'Betrag', 'Waehrung'], open)

  const egpCsv = csv(['Datum', 'Bank', 'Betrag EGP', 'Beschreibung', 'Referenz', 'Gegenpartei', 'Telefon', 'Behandlung'],
    i.txs.filter((t) => t.currency === 'EGP' && yr(t)).sort((a, b) => a.date.localeCompare(b.date)).map((t) => [t.date, (t.bank ?? '').toUpperCase(), de(t.amount), t.description, t.reference ?? '', t.counterpartyName ?? '', t.counterpartyPhone ?? '', t.treatment]))

  return [
    { name: '00-README.txt', data: readme },
    { name: '01-zusammenfassung.txt', data: summary },
    { name: '02-einnahmen-ausgaben.csv', data: steuerberaterCsv(i.txs, i.year) },
    { name: '03-waehrungsumtausch.csv', data: exchangeCsv },
    { name: '04-kundenzahlungen-egp.csv', data: customerCsv },
    { name: '05-verkaeufe.csv', data: salesCsv },
    { name: '06-kontoauszuege-pruefung.csv', data: statementsCsv },
    { name: '07-offene-punkte.csv', data: openCsv },
    { name: '08-bankumsaetze-egp.csv', data: egpCsv },
  ]
}
