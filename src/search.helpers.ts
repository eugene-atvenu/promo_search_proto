import { THRESHOLD_COST, THRESHOLD_QUANTITY } from "./types.js"
import type { CartItem, Threshold } from "./types.js"

export type CartStats = {
  total: number
  bySku: Map<string, { total: number; qty: number }>
}

export const buildCartStats = (cartItems: CartItem[]): CartStats => {
  let total = 0
  const bySku = new Map<string, { total: number; qty: number }>()
  for (const item of cartItems) {
    const lineTotal = item.price * item.qty
    total += lineTotal
    const existing = bySku.get(item.sku)
    if (existing) {
      existing.total += lineTotal
      existing.qty += item.qty
    } else {
      bySku.set(item.sku, { total: lineTotal, qty: item.qty })
    }
  }
  return { total, bySku }
}

export const cartTotal = (cartItems: CartItem[]): number =>
  cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)

export const qualifyingTotalFromStats = (stats: CartStats, skus: string[]): number => {
  let total = 0
  for (const sku of skus) {
    const entry = stats.bySku.get(sku)
    if (entry) total += entry.total
  }
  return total
}

export const qualifyingQtyFromStats = (stats: CartStats, skus: string[]): number => {
  let qty = 0
  for (const sku of skus) {
    const entry = stats.bySku.get(sku)
    if (entry) qty += entry.qty
  }
  return qty
}

export const evaluateThreshold = (threshold: Threshold, cartItems: CartItem[]): number =>
  threshold.type === THRESHOLD_COST || threshold.type === THRESHOLD_QUANTITY
    ? threshold.value
    : cartTotal(cartItems) * (threshold.value / 100)

export const evaluateThresholdFromStats = (threshold: Threshold, stats: CartStats): number =>
  threshold.type === THRESHOLD_COST || threshold.type === THRESHOLD_QUANTITY
    ? threshold.value
    : stats.total * (threshold.value / 100)
