import type { PromoIndex } from "./indexer.js"
import { TRIGGER_CART_SPEND, THRESHOLD_QUANTITY, STATUS_REACHED, STATUS_NUDGE, STATUS_SILENT } from "./types.js"
import type { Promo, CartItem, PromoStatus, PromoResult } from "./types.js"
import {
  buildCartStats,
  qualifyingTotalFromStats,
  qualifyingQtyFromStats,
  evaluateThresholdFromStats,
} from "./search.helpers.js"
import type { CartStats } from "./search.helpers.js"

const NUDGE_MIN_PROGRESS = 0.8

const _evaluatePromoFromStats = (promo: Promo, stats: CartStats): PromoResult => {
  let total: number
  if (promo.trigger.type === TRIGGER_CART_SPEND) {
    total = stats.total
  } else {
    const { skus } = promo.trigger
    total = promo.trigger.threshold.type === THRESHOLD_QUANTITY
      ? qualifyingQtyFromStats(stats, skus)
      : qualifyingTotalFromStats(stats, skus)
  }

  const threshold = evaluateThresholdFromStats(promo.trigger.threshold, stats)
  const progress = Math.min(total / threshold, 1)
  const gap = Math.max(threshold - total, 0)
  const nudgeMin = promo.nudge != null ? promo.nudge / 100 : NUDGE_MIN_PROGRESS

  let status: PromoStatus
  if (progress >= 1) {
    status = STATUS_REACHED
  } else if (progress >= nudgeMin) {
    status = STATUS_NUDGE
  } else {
    status = STATUS_SILENT
  }

  return { promo, status, progress, gap }
}

export const evaluatePromo = (promo: Promo, cartItems: CartItem[]): PromoResult =>
  _evaluatePromoFromStats(promo, buildCartStats(cartItems))

export const searchPromos = (cartItems: CartItem[], index: PromoIndex): PromoResult[] => {
  const stats = buildCartStats(cartItems)

  const matchedItem = new Set<string>()
  for (const sku of stats.bySku.keys()) {
    const ids = index.itemIndex.get(sku)
    if (ids) for (const id of ids) matchedItem.add(id)
  }

  const out: PromoResult[] = []
  const evaluate = (promoId: string) => {
    const result = _evaluatePromoFromStats(index.promoMap.get(promoId)!, stats)
    if (result.status !== STATUS_SILENT) out.push(result)
  }
  for (const promoId of index.cartSpend) evaluate(promoId)
  for (const promoId of matchedItem) evaluate(promoId)
  return out
}
