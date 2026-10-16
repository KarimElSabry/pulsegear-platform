// src/lib/finance/sale.ts
// Per-order financials. This is the ONLY place revenue, COGS, refunds and order costs are combined for one order.
// Everything the dashboard and exports show is a sum of these results, so figures always tie out.

import { allocate, round2 } from './money'
import type { CostCategory, OrderCost, Refund, Sale } from './types'
import { COST_CATEGORIES } from './types'

export interface ItemLine {
  saleId: string
  itemId: string
  productKey: string
  productName: string
  quantity: number
  gross: number
  discount: number
  refund: number
  net: number
  cogs: number
  grossProfit: number
  /** Share of the order's order-level costs, by item gross. */
  orderCosts: number
  /** grossProfit + share of shipping revenue - orderCosts */
  contribution: number
}

export interface SaleResult {
  sale: Sale
  recognized: boolean
  /** Why the order is not recognised as revenue (null when it is). */
  notRecognizedReason: string | null
  gross: number
  discount: number
  refunds: number
  /** Refund amount above what the order could have refunded (data error). */
  refundExcess: number
  /** Refunds recorded against an order that is not recognised. */
  refundsOnUnrecognized: number
  netRevenue: number
  cogs: number
  grossProfit: number
  shippingRevenue: number
  costsByCategory: Record<CostCategory, number>
  orderCostsTotal: number
  contributionBeforeAds: number
  cashCollected: number
  cashAssumed: boolean
  cashRefunded: number
  outstanding: number
  missingCostItems: number
  unassignedReturns: number
  lines: ItemLine[]
}

/**
 * Revenue recognition:
 *  - status must be 'completed';
 *  - a failed delivery is never revenue;
 *  - cash-on-delivery is revenue only once it is marked delivered (collected cash is tracked separately).
 */
export function recognitionOf(sale: Sale): { recognized: boolean; reason: string | null } {
  if (sale.status !== 'completed') return { recognized: false, reason: `status is ${sale.status}` }
  if (sale.deliveryStatus === 'failed') return { recognized: false, reason: 'delivery failed' }
  if (sale.paymentMethod === 'cod' && sale.deliveryStatus !== 'delivered') {
    return { recognized: false, reason: 'cash on delivery not yet delivered' }
  }
  return { recognized: true, reason: null }
}

function emptyCosts(): Record<CostCategory, number> {
  return Object.fromEntries(COST_CATEGORIES.map((c) => [c, 0])) as Record<CostCategory, number>
}

export function computeSale(sale: Sale, allRefunds: Refund[], allCosts: OrderCost[]): SaleResult {
  const { recognized, reason } = recognitionOf(sale)
  const refunds = allRefunds.filter((r) => r.saleId === sale.id)
  const costs = allCosts.filter((c) => c.saleId === sale.id)

  // ----- per-item gross and discount allocation (discount is an order-level figure) -----
  const itemGross = sale.items.map((i) => round2(i.unitPrice * i.quantity))
  const rawGross = round2(itemGross.reduce((a, b) => a + b, 0))
  const discount = round2(Math.min(Math.max(sale.discount, 0), rawGross))
  const itemDiscount = allocate(discount, itemGross)
  const itemNetBefore = itemGross.map((g, i) => round2(g - itemDiscount[i]))

  // ----- refunds (only against recognised orders) -----
  const itemRefund = sale.items.map(() => 0)
  const returnedQty = sale.items.map(() => 0)
  const restoredCogs = sale.items.map(() => 0)
  let refundTotalRecorded = 0
  let unassignedReturns = 0

  if (recognized) {
    const generic: Refund[] = []
    for (const r of refunds) {
      refundTotalRecorded = round2(refundTotalRecorded + r.amount)
      const idx = r.saleItemId ? sale.items.findIndex((i) => i.id === r.saleItemId) : -1
      if (idx >= 0) {
        itemRefund[idx] = round2(Math.min(itemNetBefore[idx], itemRefund[idx] + r.amount))
      } else {
        generic.push(r)
      }
      // returned goods go back to stock: restore their cost once
      if (r.restocked && r.returnedQuantity > 0) {
        const target = idx >= 0 ? idx : sale.items.length === 1 ? 0 : -1
        if (target < 0) {
          unassignedReturns += 1
        } else {
          const room = sale.items[target].quantity - returnedQty[target]
          const qty = Math.max(0, Math.min(r.returnedQuantity, room))
          returnedQty[target] += qty
          restoredCogs[target] = round2(restoredCogs[target] + qty * (sale.items[target].unitCostSnapshot ?? 0))
        }
      }
    }
    // refunds not tied to an item are spread over what is still refundable
    const genericTotal = round2(generic.reduce((a, r) => a + r.amount, 0))
    if (genericTotal > 0) {
      const room = itemNetBefore.map((n, i) => round2(n - itemRefund[i]))
      const spread = allocate(Math.min(genericTotal, round2(room.reduce((a, b) => a + b, 0))), room)
      spread.forEach((amt, i) => { itemRefund[i] = round2(itemRefund[i] + amt) })
    }
  }

  const refundApplied = round2(itemRefund.reduce((a, b) => a + b, 0))
  const refundExcess = recognized ? round2(Math.max(0, refundTotalRecorded - refundApplied)) : 0
  const refundsOnUnrecognized = recognized ? 0 : round2(refunds.reduce((a, r) => a + r.amount, 0))

  // ----- COGS from frozen snapshots -----
  let missingCostItems = 0
  const itemCogs = sale.items.map((item, i) => {
    if (item.unitCostSnapshot === null) {
      if (recognized) missingCostItems += 1
      return 0
    }
    return recognized ? round2(Math.max(0, item.unitCostSnapshot * item.quantity - restoredCogs[i])) : 0
  })

  // ----- order costs: every status counts (failed deliveries still cost money) -----
  const costsByCategory = emptyCosts()
  for (const c of costs) costsByCategory[c.category] = round2(costsByCategory[c.category] + c.amount)
  const orderCostsTotal = round2(Object.values(costsByCategory).reduce((a, b) => a + b, 0))

  const shippingRevenue = recognized ? round2(sale.shippingRevenue) : 0
  const costShare = allocate(orderCostsTotal, itemGross)
  const shippingShare = allocate(shippingRevenue, itemGross)

  const lines: ItemLine[] = sale.items.map((item, i) => {
    const gross = recognized ? itemGross[i] : 0
    const disc = recognized ? itemDiscount[i] : 0
    const net = recognized ? round2(itemNetBefore[i] - itemRefund[i]) : 0
    const grossProfit = round2(net - itemCogs[i])
    return {
      saleId: sale.id,
      itemId: item.id,
      productKey: item.productId !== null ? `id:${item.productId}` : `name:${item.productName.trim().toLowerCase()}`,
      productName: item.productName,
      quantity: item.quantity,
      gross,
      discount: disc,
      refund: recognized ? itemRefund[i] : 0,
      net,
      cogs: itemCogs[i],
      grossProfit,
      orderCosts: costShare[i],
      contribution: round2(grossProfit + shippingShare[i] - costShare[i]),
    }
  })

  const gross = recognized ? rawGross : 0
  const netRevenue = recognized ? round2(gross - discount - refundApplied) : 0
  const cogs = round2(itemCogs.reduce((a, b) => a + b, 0))
  const grossProfit = round2(netRevenue - cogs)

  // ----- collected cash is separate from revenue -----
  let cashCollected = 0
  let cashAssumed = false
  if (sale.cashCollected !== null) {
    cashCollected = round2(sale.cashCollected)
  } else if (sale.legacy && recognized) {
    cashCollected = round2(rawGross - discount + sale.shippingRevenue)
    cashAssumed = true
  }
  const cashRefunded = recognized ? refundTotalRecorded : 0
  const outstanding = recognized ? round2(Math.max(0, rawGross - discount + sale.shippingRevenue - cashCollected)) : 0

  return {
    sale,
    recognized,
    notRecognizedReason: reason,
    gross,
    discount: recognized ? discount : 0,
    refunds: refundApplied,
    refundExcess,
    refundsOnUnrecognized,
    netRevenue,
    cogs,
    grossProfit,
    shippingRevenue,
    costsByCategory,
    orderCostsTotal,
    contributionBeforeAds: round2(grossProfit + shippingRevenue - orderCostsTotal),
    cashCollected,
    cashAssumed,
    cashRefunded,
    outstanding,
    missingCostItems,
    unassignedReturns,
    lines,
  }
}
