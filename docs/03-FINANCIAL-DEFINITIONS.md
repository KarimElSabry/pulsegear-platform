# Financial definitions (implemented in `src/lib/finance/sale.ts` and `engine.ts`)

All amounts EGP, rounded to 2 decimals per order, and every total is the sum of those per-order values, so reports tie out exactly.

## Recognition rule
An order counts as revenue only if `status = completed`, delivery is not `failed`, and (payment is not cash-on-delivery **or** delivery is `delivered`). Everything else (pending, cancelled, failed delivery, undelivered COD) has zero revenue and zero COGS, but its recorded costs still count.

## Metrics
| Metric | Definition |
|---|---|
| Gross Product Sales | Sum of unit price x quantity of recognised items |
| Discounts | Order discount (capped at gross), split across items by value |
| Refunds | Sum of refunds on recognised orders, capped at what the order could refund; refunds above that are ignored and raised as an error alert |
| **Net Sales Revenue** | Gross - Discounts - Refunds |
| COGS | Frozen cost snapshot x quantity per item. A refund marked "back in stock" with units returned restores that cost once |
| **Gross Profit** / **Gross Margin** | Net revenue - COGS; margin = gross profit / net revenue |
| Shipping Revenue | Delivery fees charged on recognised orders |
| Order costs | Sum of `order_costs` rows plus legacy commission, for every order status |
| Shipping and Fulfillment Costs | Outbound + return shipping + packaging + failed delivery |
| **Contribution Before Ads** | Gross Profit + Shipping Revenue - Order costs |
| Advertising Spend | `marketing_spend.amount_egp` by `spend_date` |
| **Contribution After Ads** | Contribution Before Ads - Ad Spend |
| Operating Expenses | `operating_expenses` excluding tax and interest, by `expense_date` |
| **Operating Profit** | Contribution After Ads - Operating Expenses |
| **Net Profit** | Operating Profit - tax and interest. **Shown only when** the period has operating expenses and no completed item lacks a cost; otherwise blank with the reason |
| AOV | Net revenue / completed orders |
| Cost per Completed Order | Ad spend / completed orders |
| ROAS | Attributed revenue / ad spend. A revenue ratio, never profit. 0 when money was spent and nothing attributed, blank when nothing was spent |
| Refund Rate | Refunds / gross product sales |
| Failed Delivery Rate | Failed deliveries / (completed + failed) |
| Attribution Coverage | Completed orders with status `attributed` / completed orders |
| Missing Cost Records | Completed items with no cost snapshot |
| Collected Cash | `cash_collected_egp` (separate from revenue); legacy rows assumed collected and flagged |
| Outstanding | Billed on recognised orders minus cash collected, never below zero |

## Period rules
Orders are placed in the period of their `sale_date`; their refunds and costs follow the order (cohort basis), so a refund issued next month reduces the month the sale belongs to and the report always explains an order completely. Ad spend and operating expenses use their own dates. When a filter on channel, product, status, delivery, source or campaign is active, operating profit and net profit are hidden because period costs cannot be split that way.

## No double counting
Revenue comes from items only; costs from `order_costs` only; each sale has at most one attribution row; refunds cap at the order; legacy commission is read once from the sale row and cannot be entered again as an order cost; product and channel breakdowns are allocations that add back exactly to the order (checked by reconciliation tests and on every Data Quality report).
