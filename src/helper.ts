import { buildIndex } from "./indexer.js";
import { searchPromos, type CartItem, type PromoResult } from "./search.js";
import type { Promo } from "./types.js";

export const buildSearch = (promos: Promo[]) => {
  const index = buildIndex(promos);
  return (cartItems: CartItem[]): PromoResult[] =>
    searchPromos(cartItems, index);
};
