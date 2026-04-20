import type { PromoIndex } from "./indexer.js";
import {
  TRIGGER_CART_SPEND,
  TRIGGER_ITEM_SPEND,
  THRESHOLD_AMOUNT,
  THRESHOLD_QUANTITY,
} from "./types.js";
import type { Promo, Threshold, Trigger } from "./types.js";

export type CartItem = {
  sku: string;
  price: number; // cents
  qty: number;
};

export type PromoStatus = "reached" | "nudge" | "silent";

const NUDGE_MIN_PROGRESS = 0.8;

export type PromoResult = {
  promo: Promo;
  status: PromoStatus;
  progress: number;
  gap: number;
};

export const cartTotal = (cartItems: CartItem[]): number =>
  cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

const qualifyingTotal = (cart: CartItem[], skus: string[]): number =>
  cartTotal(cart.filter((item) => skus.includes(item.sku)));

const qualifyingQty = (cart: CartItem[], skus: string[]): number =>
  cart.filter((item) => skus.includes(item.sku)).reduce((sum, item) => sum + item.qty, 0);

export const evaluateThreshold = (
  trigger: Threshold,
  cartItems: CartItem[],
): number =>
  trigger.type === THRESHOLD_AMOUNT || trigger.type === THRESHOLD_QUANTITY
    ? trigger.value
    : cartTotal(cartItems) * (trigger.value / 100);

export const evaluatePromo = (
  promo: Promo,
  cartItems: CartItem[],
): PromoResult => {
  let total: number;
  if (promo.trigger.type === TRIGGER_CART_SPEND) {
    total = cartTotal(cartItems);
  } else {
    const skus = (promo.trigger as Extract<Trigger, { type: typeof TRIGGER_ITEM_SPEND }>).skus;
    total = promo.trigger.threshold.type === THRESHOLD_QUANTITY
      ? qualifyingQty(cartItems, skus)
      : qualifyingTotal(cartItems, skus);
  }

  const threshold = evaluateThreshold(promo.trigger.threshold, cartItems);
  const progress = Math.min(total / threshold, 1);
  const gap = Math.max(threshold - total, 0);
  const nudgeMin = promo.nudge != null ? promo.nudge / 100 : NUDGE_MIN_PROGRESS;

  let status: PromoStatus;
  if (progress >= 1) {
    status = "reached";
  } else if (progress >= nudgeMin) {
    status = "nudge";
  } else {
    status = "silent";
  }

  return { promo, status, progress, gap };
};

export const searchPromos = (
  cartItems: CartItem[],
  index: PromoIndex,
): PromoResult[] => {
  const fromItems = cartItems.flatMap((item: CartItem) => [
    ...(index.itemIndex.get(item.sku) ?? []),
  ]);
  const matched = new Set([...index.cartSpend, ...fromItems]);

  return [...matched]
    .map((promoId) => evaluatePromo(index.promoMap.get(promoId)!, cartItems))
    .filter((result) => result.status !== "silent")
    .sort((a, b) => b.progress - a.progress);
};
