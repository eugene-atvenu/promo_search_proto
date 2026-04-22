import type { PromoResult, PromoGroups } from "./types.js"

export const groupPromos = (results: PromoResult[]): PromoGroups => ({
  reached: results.filter(r => r.status === "reached"),
  nudge: results.filter(r => r.status === "nudge"),
})
