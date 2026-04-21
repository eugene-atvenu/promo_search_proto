import { buildIndex } from "./indexer.js"
import { searchPromos } from "./search.js"
import { sortMaxGap } from "./sorting/max_gap.js"
import { sortMinGap } from "./sorting/min_gap.js"
import { sortRandom } from "./sorting/random.js"
import { sortWeighted } from "./sorting/weighted.js"
import type { Promo, CartItem, PromoResult, SortAlgorithm } from "./types.js"

export const buildSearch = (promos: Promo[]) => {
  const index = buildIndex(promos)
  return (cartItems: CartItem[]): PromoResult[] => searchPromos(cartItems, index)
}

export const buildPromoSorter =
  (algorithm: SortAlgorithm, cartItems: CartItem[] = []) =>
  (results: PromoResult[]): PromoResult[] => {
    switch (algorithm) {
      case "max_gap": return sortMaxGap(results, cartItems)
      case "min_gap": return sortMinGap(results, cartItems)
      case "random": return sortRandom(results)
      case "weighted": return sortWeighted(results)
    }
  }
