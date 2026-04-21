import type { PromoResult } from "../types.js"

export const sortRandom = (results: PromoResult[]): PromoResult[] => {
  const arr = [...results]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = arr[i]!
    arr[i] = arr[j]!
    arr[j] = tmp
  }
  return arr
}
