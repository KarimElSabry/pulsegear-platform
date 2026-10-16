// src/app/admin/analytics/finance/FinanceForms.tsx

'use client'

import { useState } from 'react'
import ActionForm, { Field, inputClass } from '../ActionForm'
import {
  addOperatingExpense, addOrderCost, addRefund, addSaleItem, saveAttribution, saveSaleDetails, setProductCost,
} from '../finance-actions'

export interface SaleOption {
  id: string
  label: string
  status: string
  deliveryStatus: string
  paymentMethod: string
  orderRef: string
  discount: number
  shippingRevenue: number
  cashCollected: number | null
  items: { id: string; name: string }[]
}
export interface ProductOption { id: number; title: string; cost: number | null }

const today = () => new Date().toISOString().slice(0, 10)

function SalePicker({ sales, value, onChange }: { sales: SaleOption[]; value: string; onChange: (id: string) => void }) {
  return (
    <Field label="Sale">
      <select name="sale_id" required value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        <option value="">Select a sale…</option>
        {sales.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>
    </Field>
  )
}

export default function FinanceForms({ sales, products }: { sales: SaleOption[]; products: ProductOption[] }) {
  const [saleId, setSaleId] = useState('')
  const sale = sales.find((s) => s.id === saleId)

  return (
    <div className="space-y-6">
      <ActionForm
        action={saveSaleDetails}
        title="1. Order status, payment and delivery"
        description="Cash-on-delivery orders only count as revenue once delivery is 'delivered'. Collected cash is tracked separately from revenue."
      >
        <SalePicker sales={sales} value={saleId} onChange={setSaleId} />
        <div key={saleId} className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Field label="Order status">
            <select name="status" defaultValue={sale?.status ?? 'completed'} className={inputClass}>
              <option value="pending">pending</option><option value="completed">completed</option>
              <option value="cancelled">cancelled</option><option value="failed_delivery">failed_delivery</option>
            </select>
          </Field>
          <Field label="Delivery status">
            <select name="delivery_status" defaultValue={sale?.deliveryStatus ?? ''} className={inputClass}>
              <option value="">(not set)</option><option value="pending">pending</option><option value="shipped">shipped</option>
              <option value="delivered">delivered</option><option value="failed">failed</option><option value="returned">returned</option>
            </select>
          </Field>
          <Field label="Payment method">
            <select name="payment_method" defaultValue={sale?.paymentMethod ?? ''} className={inputClass}>
              <option value="">(not set)</option><option value="cod">cash on delivery</option><option value="prepaid">prepaid</option>
              <option value="deposit">deposit</option><option value="other">other</option>
            </select>
          </Field>
          <Field label="Order reference" hint="Optional. Duplicates are flagged."><input name="order_ref" defaultValue={sale?.orderRef ?? ''} className={inputClass} /></Field>
          <Field label="Discount (EGP)" hint="Total discount on the order"><input name="discount_egp" type="number" step="0.01" min="0" defaultValue={sale?.discount ?? 0} className={inputClass} /></Field>
          <Field label="Shipping charged to customer (EGP)"><input name="shipping_revenue_egp" type="number" step="0.01" min="0" defaultValue={sale?.shippingRevenue ?? 0} className={inputClass} /></Field>
          <Field label="Cash collected so far (EGP)" hint="Leave empty if unknown"><input name="cash_collected_egp" type="number" step="0.01" min="0" defaultValue={sale?.cashCollected ?? ''} className={inputClass} /></Field>
        </div>
      </ActionForm>

      <ActionForm
        action={addSaleItem}
        title="2. Add a product line to an order"
        description="For orders with several products. The cost is frozen now (from the product's cost unless you type one). The order's price and cost are recalculated from its lines."
        submitLabel="Add item"
      >
        <SalePicker sales={sales} value={saleId} onChange={setSaleId} />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Field label="Product">
            <select name="product_id" className={inputClass} defaultValue="">
              <option value="">(none, type a name)</option>
              {products.map((p) => <option key={p.id} value={p.id}>#{p.id} {p.title.slice(0, 40)}</option>)}
            </select>
          </Field>
          <Field label="Name (if no product)"><input name="product_name" className={inputClass} /></Field>
          <Field label="Quantity"><input name="quantity" type="number" min="1" step="1" defaultValue={1} required className={inputClass} /></Field>
          <Field label="Unit price (EGP)"><input name="unit_price_egp" type="number" min="0" step="0.01" required className={inputClass} /></Field>
          <Field label="Unit cost (EGP)" hint="Empty = product cost"><input name="unit_cost_egp" type="number" min="0" step="0.01" className={inputClass} /></Field>
        </div>
      </ActionForm>

      <ActionForm action={addOrderCost} title="3. Add an order cost" description="Shipping, packaging, payment fees, failed delivery… Each entry is one cost of one order." submitLabel="Add cost">
        <SalePicker sales={sales} value={saleId} onChange={setSaleId} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Field label="Category">
            <select name="category" className={inputClass}>
              <option value="outbound_shipping">Outbound shipping</option><option value="return_shipping">Return shipping</option>
              <option value="packaging">Packaging</option><option value="payment_fee">Payment processing fee</option>
              <option value="failed_delivery">Failed delivery</option><option value="other_variable">Other variable</option>
            </select>
          </Field>
          <Field label="Amount (EGP)"><input name="amount_egp" type="number" min="0" step="0.01" required className={inputClass} /></Field>
          <Field label="Date"><input name="incurred_at" type="date" defaultValue={today()} className={inputClass} /></Field>
          <Field label="Note"><input name="note" className={inputClass} /></Field>
        </div>
      </ActionForm>

      <ActionForm action={addRefund} title="4. Record a refund or return" description="Partial refunds are fine. Tick 'back in stock' if the returned goods can be resold: their cost then returns to inventory." submitLabel="Record refund">
        <SalePicker sales={sales} value={saleId} onChange={setSaleId} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Field label="Refund amount (EGP)"><input name="amount_egp" type="number" min="0.01" step="0.01" required className={inputClass} /></Field>
          <Field label="Which product line">
            <select name="sale_item_id" className={inputClass} defaultValue="">
              <option value="">Whole order</option>
              {(sale?.items ?? []).map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </Field>
          <Field label="Units returned"><input name="returned_quantity" type="number" min="0" step="1" defaultValue={0} className={inputClass} /></Field>
          <Field label="Date"><input name="refunded_at" type="date" defaultValue={today()} className={inputClass} /></Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" name="restocked" /> Returned goods are back in stock</label>
        <Field label="Reason"><input name="reason" className={inputClass} /></Field>
      </ActionForm>

      <ActionForm action={saveAttribution} title="5. Where did this sale come from?" description="Only attribute a sale when you have evidence. Anything else stays 'unknown' and is never given to a campaign." submitLabel="Save attribution">
        <SalePicker sales={sales} value={saleId} onChange={setSaleId} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Field label="Status">
            <select name="status" defaultValue="attributed" className={inputClass}><option value="attributed">attributed (I have evidence)</option><option value="unknown">unknown</option></select>
          </Field>
          <Field label="Source (utm_source)"><input name="utm_source" placeholder="instagram" className={inputClass} /></Field>
          <Field label="Medium"><input name="utm_medium" placeholder="paid" className={inputClass} /></Field>
          <Field label="Campaign"><input name="utm_campaign" placeholder="Fenix Launch" className={inputClass} /></Field>
          <Field label="Content / ad"><input name="utm_content" className={inputClass} /></Field>
          <Field label="Closing channel" hint="Where the sale closed"><input name="closing_channel" placeholder="whatsapp" className={inputClass} /></Field>
          <Field label="Or use the tracked source of a…" hint="Reservation or request number">
            <div className="flex gap-2">
              <select name="ref_type" defaultValue="" className={inputClass}><option value="">(none)</option><option value="reservation">reservation</option><option value="product_request">request</option></select>
              <input name="ref_id" placeholder="#" className={inputClass} />
            </div>
          </Field>
        </div>
        <Field label="Evidence (required to attribute)"><input name="evidence" placeholder='e.g. "Customer said they saw the Fenix Reel" / "WhatsApp message from the ad link"' className={inputClass} /></Field>
      </ActionForm>

      <ActionForm action={addOperatingExpense} title="6. Operating expense (period cost)" description="Rent, salaries, software, tax… not tied to one order. Tax and interest sit below operating profit." submitLabel="Add expense">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Field label="Category">
            <select name="category" className={inputClass}>
              {['rent', 'salaries', 'software', 'tools', 'accounting', 'transport', 'other', 'tax', 'interest'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Amount (EGP)"><input name="amount_egp" type="number" min="0" step="0.01" required className={inputClass} /></Field>
          <Field label="Date"><input name="expense_date" type="date" defaultValue={today()} className={inputClass} /></Field>
          <Field label="Note"><input name="note" className={inputClass} /></Field>
        </div>
      </ActionForm>

      <ActionForm action={setProductCost} title="7. Default product cost" description="Used as the cost snapshot for future sales of this product. Past sales are never changed." submitLabel="Save cost">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Product">
            <select name="product_id" required className={inputClass} defaultValue="">
              <option value="">Select…</option>
              {products.map((p) => <option key={p.id} value={p.id}>#{p.id} {p.title.slice(0, 50)}{p.cost !== null ? ` (cost ${p.cost})` : ''}</option>)}
            </select>
          </Field>
          <Field label="Cost (EGP)"><input name="cost_egp" type="number" min="0" step="0.01" required className={inputClass} /></Field>
        </div>
      </ActionForm>
    </div>
  )
}
