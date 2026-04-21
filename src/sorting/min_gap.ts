import type { PromoResult, CartItem } from "../types.js"
import { costGap } from "./gap.js"

export const sortMinGap = (results: PromoResult[], cartItems: CartItem[]): PromoResult[] =>
  [...results].sort((a, b) => costGap(a, cartItems) - costGap(b, cartItems))
