import { TRIGGER_ITEM_SPEND, THRESHOLD_QUANTITY } from "../types.js"
import type { PromoResult, CartItem } from "../types.js"

// For quantity-based item_spend promos, gap is in units — convert to cost
// using the weighted average price of matching SKUs in the cart.
export const costGap = (result: PromoResult, cartItems: CartItem[]): number => {
  const { promo, gap } = result
  if (promo.trigger.type !== TRIGGER_ITEM_SPEND) return gap
  if (promo.trigger.threshold.type !== THRESHOLD_QUANTITY) return gap

  const { skus } = promo.trigger
  const matching = cartItems.filter((item) => skus.includes(item.sku))
  const totalSpend = matching.reduce((s, i) => s + i.price * i.qty, 0)
  const totalQty = matching.reduce((s, i) => s + i.qty, 0)

  return totalQty > 0 ? gap * (totalSpend / totalQty) : gap
}
