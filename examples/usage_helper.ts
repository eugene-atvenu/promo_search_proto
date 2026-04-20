import { buildSearch } from "../src/index.js"
import type { Promo, CartItem } from "../src/index.js"

const promos: Promo[] = [
  {
    id: "promo-summer-cart",
    label: "Spend $75 or more and get 15% off your order",
    trigger: { type: "cart_spend", threshold: { type: "amount", value: 7500 } },
    reward: { type: "percent_off", value: 15, target: "cart" },
  },
  {
    id: "promo-free-shipping",
    label: "Free shipping on orders over $50",
    nudge: 70,
    trigger: { type: "cart_spend", threshold: { type: "amount", value: 5000 } },
    reward: { type: "amount_off", value: 999, target: "shipping" },
  },
  {
    id: "promo-merch-bundle",
    label: "Buy $30 in merch and get 10% off the cheapest item",
    trigger: { type: "item_spend", skus: ["tee-sm", "tee-md", "hat-one"], threshold: { type: "amount", value: 3000 } },
    reward: { type: "percent_off", value: 10, target: "cheapest" },
  },
]

// Build the index once — reuse across requests without re-indexing
const search = buildSearch(promos)

const cart: CartItem[] = [
  { sku: "tee-md", price: 2500, qty: 1 },
  { sku: "hat-one", price: 1800, qty: 1 },
]

const results = search(cart)

for (const { promo, status, progress, gap } of results) {
  console.log(`[${status}] ${promo.label} — ${Math.round(progress * 100)}% there, $${(gap / 100).toFixed(2)} to go`)
}
