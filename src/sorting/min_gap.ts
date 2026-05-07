import type { PromoResult } from "../types.js"
import type { CartStats } from "../search.helpers.js"
import { costGapFromStats } from "./gap.js"

export const sortMinGap = (results: PromoResult[], stats: CartStats): PromoResult[] =>
  results
    .map((r) => ({ r, g: costGapFromStats(r, stats) }))
    .sort((a, b) => a.g - b.g)
    .map((x) => x.r)
