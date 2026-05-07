import { TRIGGER_ITEM_SPEND, THRESHOLD_QUANTITY } from "../types.js"
import type { PromoResult } from "../types.js"
import type { CartStats } from "../search.helpers.js"

// For quantity-based item_spend promos, gap is in units — convert to cost
// using the weighted average price of matching SKUs in the cart.
export const costGapFromStats = (result: PromoResult, stats: CartStats): number => {
  const { promo, gap } = result
  if (promo.trigger.type !== TRIGGER_ITEM_SPEND) return gap
  if (promo.trigger.threshold.type !== THRESHOLD_QUANTITY) return gap

  let totalSpend = 0
  let totalQty = 0
  for (const sku of promo.trigger.skus) {
    const entry = stats.bySku.get(sku)
    if (entry) {
      totalSpend += entry.total
      totalQty += entry.qty
    }
  }

  return totalQty > 0 ? gap * (totalSpend / totalQty) : gap
}
