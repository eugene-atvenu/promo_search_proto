import type { PromoResult } from "../types.js"

export const sortWeighted = (results: PromoResult[]): PromoResult[] =>
  [...results].sort((a, b) => (b.promo.weight ?? 0) - (a.promo.weight ?? 0))
