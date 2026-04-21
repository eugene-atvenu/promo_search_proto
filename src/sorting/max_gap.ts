import type { PromoResult, CartItem } from "../types.js"
import { costGap } from "./gap.js"

export const sortMaxGap = (results: PromoResult[], cartItems: CartItem[]): PromoResult[] =>
  [...results].sort((a, b) => costGap(b, cartItems) - costGap(a, cartItems))
