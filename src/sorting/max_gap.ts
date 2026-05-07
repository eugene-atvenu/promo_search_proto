import type { PromoResult } from "../types.js"
import type { CartStats } from "../search.helpers.js"
import { costGapFromStats } from "./gap.js"

export const sortMaxGap = (results: PromoResult[], stats: CartStats): PromoResult[] =>
  results
    .map((r) => ({ r, g: costGapFromStats(r, stats) }))
    .sort((a, b) => b.g - a.g)
    .map((x) => x.r)
