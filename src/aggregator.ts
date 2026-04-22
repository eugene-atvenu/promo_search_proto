import { STATUS_REACHED, STATUS_NUDGE } from "./types.js"
import type { PromoResult, PromoGroups } from "./types.js"

export const groupPromos = (results: PromoResult[]): PromoGroups => {
  const reached: PromoResult[] = []
  const nudge: PromoResult[] = []
  for (const result of results) {
    if (result.status === STATUS_REACHED) reached.push(result)
    else if (result.status === STATUS_NUDGE) nudge.push(result)
  }
  return { reached, nudge }
}
