import type { PromoIndex } from "./indexer.js"
import { TRIGGER_CART_SPEND, TRIGGER_ITEM_SPEND, THRESHOLD_QUANTITY } from "./types.js"
import type { Promo, Trigger, CartItem, PromoStatus, PromoResult } from "./types.js"
import { cartTotal, qualifyingTotal, qualifyingQty, evaluateThreshold } from "./search.helpers.js"

export { cartTotal, evaluateThreshold }

const NUDGE_MIN_PROGRESS = 0.8

export const evaluatePromo = (promo: Promo, cartItems: CartItem[]): PromoResult => {
  let total: number
  if (promo.trigger.type === TRIGGER_CART_SPEND) {
    total = cartTotal(cartItems)
  } else {
    const skus = (promo.trigger as Extract<Trigger, { type: typeof TRIGGER_ITEM_SPEND }>).skus
    total = promo.trigger.threshold.type === THRESHOLD_QUANTITY
      ? qualifyingQty(cartItems, skus)
      : qualifyingTotal(cartItems, skus)
  }

  const threshold = evaluateThreshold(promo.trigger.threshold, cartItems)
  const progress = Math.min(total / threshold, 1)
  const gap = Math.max(threshold - total, 0)
  const nudgeMin = promo.nudge != null ? promo.nudge / 100 : NUDGE_MIN_PROGRESS

  let status: PromoStatus
  if (progress >= 1) {
    status = "reached"
  } else if (progress >= nudgeMin) {
    status = "nudge"
  } else {
    status = "silent"
  }

  return { promo, status, progress, gap }
}

export const searchPromos = (cartItems: CartItem[], index: PromoIndex): PromoResult[] => {
  const fromItems = cartItems.flatMap((item: CartItem) => [
    ...(index.itemIndex.get(item.sku) ?? []),
  ])
  const matched = new Set([...index.cartSpend, ...fromItems])

  return [...matched]
    .map((promoId) => evaluatePromo(index.promoMap.get(promoId)!, cartItems))
    .filter((result) => result.status !== "silent")
    .sort((a, b) => b.progress - a.progress)
}
