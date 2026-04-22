import { TRIGGER_ITEM_SPEND, THRESHOLD_QUANTITY } from "../types.js"
import type { PromoResult, CartItem } from "../types.js"

// For quantity-based item_spend promos, gap is in units — convert to cost
// using the weighted average price of matching SKUs in the cart.
export const costGap = (result: PromoResult, cartItems: CartItem[]): number => {
  const { promo, gap } = result
  if (promo.trigger.type !== TRIGGER_ITEM_SPEND) return gap
  if (promo.trigger.threshold.type !== THRESHOLD_QUANTITY) return gap

  const { skus } = promo.trigger
  let totalSpend = 0
  let totalQty = 0
  for (const item of cartItems) {
    if (skus.includes(item.sku)) {
      totalSpend += item.price * item.qty
      totalQty += item.qty
    }
  }

  return totalQty > 0 ? gap * (totalSpend / totalQty) : gap
}
