import { buildIndex } from "./indexer.js"
import { searchPromos } from "./search.js"
import { buildCartStats } from "./search.helpers.js"
import { groupPromos } from "./aggregator.js"
import { sortMaxGap } from "./sorting/max_gap.js"
import { sortMinGap } from "./sorting/min_gap.js"
import { sortRandom } from "./sorting/random.js"
import { sortWeighted } from "./sorting/weighted.js"
import { SORT_MAX_GAP, SORT_MIN_GAP, SORT_RANDOM, SORT_WEIGHTED } from "./types.js"
import type { Promo, CartItem, PromoResult, PromoGroups, SortAlgorithm } from "./types.js"
import type { CartStats } from "./search.helpers.js"

export const buildPromoSorter =
  (algorithm: SortAlgorithm, stats: CartStats = { total: 0, bySku: new Map() }) =>
  (results: PromoResult[]): PromoResult[] => {
    switch (algorithm) {
      case SORT_MAX_GAP: return sortMaxGap(results, stats)
      case SORT_MIN_GAP: return sortMinGap(results, stats)
      case SORT_RANDOM: return sortRandom(results)
      case SORT_WEIGHTED: return sortWeighted(results)
    }
  }

export const buildPromoSearch = (promos: Promo[], algorithm: SortAlgorithm = SORT_MIN_GAP) => {
  const index = buildIndex(promos)
  return (cartItems: CartItem[]): PromoGroups => {
    const stats = buildCartStats(cartItems)
    const results = searchPromos(cartItems, index)
    const sorted = buildPromoSorter(algorithm, stats)(results)
    return groupPromos(sorted)
  }
}
