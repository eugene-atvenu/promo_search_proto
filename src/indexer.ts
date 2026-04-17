import { TRIGGER_ITEM_SPEND } from "./types.js"
import type { Promo } from "./types.js"

export type PromoIndex = {
  promoMap: Map<string, Promo>
  itemIndex: Map<string, Set<string>>  // sku -> promo IDs
  cartSpend: Set<string>               // promo IDs triggered by cart spend
}

export const buildIndex = (promos: Promo[]): PromoIndex => {
  const promoMap = new Map<string, Promo>()
  const itemIndex = new Map<string, Set<string>>()
  const cartSpend = new Set<string>()

  for (const promo of promos) {
    promoMap.set(promo.id, promo)

    if (promo.trigger.type === TRIGGER_ITEM_SPEND) {
      for (const sku of promo.trigger.skus) {
        getOrCreate(itemIndex, sku).add(promo.id)
      }
    } else {
      cartSpend.add(promo.id)
    }
  }

  return { promoMap, itemIndex, cartSpend }
}

export const getOrCreate = (map: Map<string, Set<string>>, key: string): Set<string> => {
  let set = map.get(key)
  if (!set) {
    set = new Set()
    map.set(key, set)
  }
  return set
}
