import type { Attribution, Dataset, OrderCost, Refund, Sale, SaleItem, SpendRecord, Touchpoint } from '../types'

let n = 0
const id = (p: string) => `${p}-${++n}`

export function item(over: Partial<SaleItem> = {}): SaleItem {
  return { id: id('item'), productId: 1, productName: 'Garmin Fenix 7', quantity: 1, unitPrice: 1000, unitCostSnapshot: 600, ...over }
}

export function sale(over: Partial<Sale> = {}): Sale {
  const items = over.items ?? [item()]
  const gross = items.reduce((a, i) => a + i.unitPrice * i.quantity, 0)
  const discount = over.discount ?? 0
  return {
    id: id('sale'), orderRef: null, date: '2026-10-05', status: 'completed', deliveryStatus: 'delivered',
    paymentMethod: 'prepaid', channel: 'whatsapp', items, discount, shippingRevenue: 0, cashCollected: null,
    recordedNet: gross - discount, discountCode: null, legacy: false, ...over,
  }
}

export function refund(saleId: string, over: Partial<Refund> = {}): Refund {
  return { id: id('ref'), saleId, saleItemId: null, amount: 100, returnedQuantity: 0, restocked: false, date: '2026-10-08', reason: null, ...over }
}

export function cost(saleId: string, over: Partial<OrderCost> = {}): OrderCost {
  return { id: id('cost'), saleId, category: 'outbound_shipping', amount: 50, date: '2026-10-05', note: null, source: 'order_costs', ...over }
}

export function spend(over: Partial<SpendRecord> = {}): SpendRecord {
  return { id: id('spend'), platform: 'instagram', campaign: 'Fenix Launch', date: '2026-10-04', amountEgp: 300, ...over }
}

export function attribution(saleId: string, over: Partial<Attribution> = {}): Attribution {
  return {
    saleId, firstTouchSource: 'instagram', lastNonDirectSource: 'instagram', closingChannel: 'whatsapp', utmSource: 'instagram',
    utmMedium: 'paid', utmCampaign: 'Fenix Launch', utmContent: null, model: 'manual', status: 'attributed', ...over,
  }
}

export function touch(over: Partial<Touchpoint> = {}): Touchpoint {
  return { id: id('tp'), event: 'page_view', visitorId: 'v1', date: '2026-10-04', utmSource: 'instagram', utmMedium: 'paid', utmCampaign: 'Fenix Launch', ...over }
}

export function dataset(over: Partial<Dataset> = {}): Dataset {
  return { sales: [], refunds: [], orderCosts: [], expenses: [], spend: [], attributions: [], touchpoints: [], missingTables: [], ...over }
}

export const RANGE = { from: '2026-10-01', to: '2026-10-31' }
