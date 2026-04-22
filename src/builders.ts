import { buildIndex } from "./indexer.js"
import { searchPromos } from "./search.js"
import { groupPromos } from "./aggregator.js"
import { sortMaxGap } from "./sorting/max_gap.js"
import { sortMinGap } from "./sorting/min_gap.js"
import { sortRandom } from "./sorting/random.js"
import { sortWeighted } from "./sorting/weighted.js"
import { SORT_MAX_GAP, SORT_MIN_GAP, SORT_RANDOM, SORT_WEIGHTED } from "./types.js"
import type { Promo, CartItem, PromoResult, PromoGroups, SortAlgorithm } from "./types.js"

export const buildPromoSorter =
  (algorithm: SortAlgorithm, cartItems: CartItem[] = []) =>
  (results: PromoResult[]): PromoResult[] => {
    switch (algorithm) {
      case SORT_MAX_GAP: return sortMaxGap(results, cartItems)
      case SORT_MIN_GAP: return sortMinGap(results, cartItems)
      case SORT_RANDOM: return sortRandom(results)
      case SORT_WEIGHTED: return sortWeighted(results)
    }
  }

export const buildPromoSearch = (promos: Promo[], algorithm: SortAlgorithm = SORT_MIN_GAP) => {
  const index = buildIndex(promos)
  return (cartItems: CartItem[]): PromoGroups => {
    const results = searchPromos(cartItems, index)
    const sorted = buildPromoSorter(algorithm, cartItems)(results)
    return groupPromos(sorted)
  }
}
