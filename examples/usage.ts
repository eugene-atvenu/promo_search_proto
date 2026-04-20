import type { CartItem, Promo } from "../src/index.js"
import {
  buildIndex,
  REWARD_AMOUNT_OFF,
  REWARD_PERCENT_OFF,
  searchPromos,
  TARGET_CART,
  TARGET_CHEAPEST,
  TARGET_SHIPPING,
  THRESHOLD_AMOUNT,
  THRESHOLD_QUANTITY,
  TRIGGER_CART_SPEND,
  TRIGGER_ITEM_SPEND
} from "../src/index.js"

const promos: Promo[] = [
  {
    id: "promo-summer-cart",
    label: "Spend $75 or more and get 15% off your order",
    trigger: { type: TRIGGER_CART_SPEND, threshold: { type: THRESHOLD_AMOUNT, value: 7500 } },
    reward: { type: REWARD_PERCENT_OFF, value: 15, target: TARGET_CART },
  },
  {
    id: "promo-free-shipping",
    label: "Free shipping on orders over $50",
    nudge: 70,
    trigger: { type: TRIGGER_CART_SPEND, threshold: { type: THRESHOLD_AMOUNT, value: 5000 } },
    reward: { type: REWARD_AMOUNT_OFF, value: 999, target: TARGET_SHIPPING },
  },
  {
    id: "promo-merch-bundle",
    label: "Buy $30 in merch and get 10% off the cheapest item",
    trigger: { type: TRIGGER_ITEM_SPEND, skus: ["tee-sm", "tee-md", "hat-one"], threshold: { type: THRESHOLD_AMOUNT, value: 3000 } },
    reward: { type: REWARD_PERCENT_OFF, value: 10, target: TARGET_CHEAPEST },
  },
  {
    id: "buy-2-get-1-free-hats",
    label: "Buy 2 hats and get the 3rd free",
    trigger: { type: TRIGGER_ITEM_SPEND, skus: ["hat-one"], threshold: { type: THRESHOLD_QUANTITY, value: 2 } },
    reward: { type: REWARD_PERCENT_OFF, value: 100, target: "hat-one" },
  },
  {
    id: "buy-3-get-1-free-posters",
    label: "Buy 3 posters and get the 4th free",
    nudge: 60,
    trigger: { type: TRIGGER_ITEM_SPEND, skus: ["poster-one"], threshold: { type: THRESHOLD_QUANTITY, value: 3 } },
    reward: { type: REWARD_PERCENT_OFF, value: 100, target: "poster-one" },
  },
]

// Build the index once — reuse across requests without re-indexing
const index = buildIndex(promos)

const cart: CartItem[] = [
  { sku: "tee-md", price: 2500, qty: 1 },
  { sku: "hat-one", price: 1800, qty: 1 },
  { sku: "poster-one", price: 1200, qty: 2 },
]

const results = searchPromos(cart, index)

for (const { promo, status, progress, gap } of results) {
  const gapLabel = promo.trigger.threshold.type === THRESHOLD_QUANTITY
    ? `${gap} item${gap === 1 ? "" : "s"} to go`
    : `$${(gap / 100).toFixed(2)} to go`
  console.log(`[${status}] ${promo.label} — ${Math.round(progress * 100)}% there, ${gapLabel}`)
}
