import { THRESHOLD_COST, THRESHOLD_QUANTITY } from "./types.js"
import type { CartItem, Threshold } from "./types.js"

export const cartTotal = (cartItems: CartItem[]): number =>
  cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)

export const qualifyingTotal = (cart: CartItem[], skus: string[]): number =>
  cartTotal(cart.filter((item) => skus.includes(item.sku)))

export const qualifyingQty = (cart: CartItem[], skus: string[]): number =>
  cart.filter((item) => skus.includes(item.sku)).reduce((sum, item) => sum + item.qty, 0)

export const evaluateThreshold = (threshold: Threshold, cartItems: CartItem[]): number =>
  threshold.type === THRESHOLD_COST || threshold.type === THRESHOLD_QUANTITY
    ? threshold.value
    : cartTotal(cartItems) * (threshold.value / 100)
