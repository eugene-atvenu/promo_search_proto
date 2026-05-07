import { evaluatePromo } from "../src/search.js"
import { buildPromoSorter } from "../src/builders.js"
import { buildCartStats } from "../src/search.helpers.js"
import { THRESHOLD_QUANTITY, SORT_MAX_GAP, SORT_MIN_GAP, SORT_RANDOM, SORT_WEIGHTED } from "../src/types.js"
import { cartItem, cartPromo, itemPromo } from "./stubs.js"

const cart = [cartItem("hat", 1000, 1)] // 1 hat @ $10 = $10 total
const cartStats = buildCartStats(cart)

// p1: needs $50 cart spend → gap = $20
// p2: needs $40 cart spend → gap = $10
const p1 = cartPromo("p1", 5000)
const p2 = cartPromo("p2", 4000)
const results = [evaluatePromo(p1, cart), evaluatePromo(p2, cart)]

describe("buildPromoSorter", () => {
  it("is curried — returns a function when given an algorithm", () => {
    expect(typeof buildPromoSorter(SORT_WEIGHTED)).toBe("function")
  })

  describe(SORT_MIN_GAP, () => {
    it("puts smallest dollar gap first", () => {
      const sorted = buildPromoSorter(SORT_MIN_GAP)(results)
      expect(sorted[0]!.promo.id).toBe("p2") // $10 gap
      expect(sorted[1]!.promo.id).toBe("p1") // $20 gap
    })

    it("converts quantity gap to dollars before comparing", () => {
      // qty promo: need 3 hats, have 1 → gap = 2 units * $10 = $20
      const qtyResult = evaluatePromo(itemPromo("qty", ["hat"], 3, THRESHOLD_QUANTITY), cart)
      // amount promo: need $15, have $10 → gap = 500 cents = $5
      const amtResult = evaluatePromo(cartPromo("amt", 1500), cart)

      const sorted = buildPromoSorter(SORT_MIN_GAP, cartStats)([qtyResult, amtResult])
      expect(sorted[0]!.promo.id).toBe("amt") // $5 gap
      expect(sorted[1]!.promo.id).toBe("qty") // $20 gap
    })

    it("passes gap through unchanged for item_spend with amount threshold", () => {
      // item_spend + amount threshold → gap is already in cents, no conversion
      // gap = 2000 - 1000 = 1000 cents ($10)
      const itemAmtResult = evaluatePromo(itemPromo("item-amt", ["hat"], 2000), cart)
      // cart promo gap = 500 cents ($5)
      const cartAmtResult = evaluatePromo(cartPromo("cart-amt", 1500), cart)

      const sorted = buildPromoSorter(SORT_MIN_GAP, cartStats)([itemAmtResult, cartAmtResult])
      expect(sorted[0]!.promo.id).toBe("cart-amt") // $5 gap
      expect(sorted[1]!.promo.id).toBe("item-amt") // $10 gap
    })

    it("returns raw unit gap when no matching SKUs are in the cart", () => {
      // qty promo targets "shoe" but cart only has "hat" → totalQty = 0 → gap = 3 (raw units)
      const qtyResult = evaluatePromo(itemPromo("no-match", ["shoe"], 3, THRESHOLD_QUANTITY), cart)
      // cart promo gap = 200 cents — larger than raw gap of 3
      const cartAmtResult = evaluatePromo(cartPromo("cart-amt", 1200), cart)

      const sorted = buildPromoSorter(SORT_MIN_GAP, cartStats)([cartAmtResult, qtyResult])
      expect(sorted[0]!.promo.id).toBe("no-match") // gap = 3 (raw, no conversion)
      expect(sorted[1]!.promo.id).toBe("cart-amt") // gap = 200
    })

    it("does not mutate the input array", () => {
      const copy = [...results]
      buildPromoSorter(SORT_MIN_GAP)(results)
      expect(results).toEqual(copy)
    })
  })

  describe(SORT_MAX_GAP, () => {
    it("puts largest dollar gap first", () => {
      const sorted = buildPromoSorter(SORT_MAX_GAP)(results)
      expect(sorted[0]!.promo.id).toBe("p1") // $20 gap
      expect(sorted[1]!.promo.id).toBe("p2") // $10 gap
    })

    it("converts quantity gap to dollars before comparing", () => {
      const qtyResult = evaluatePromo(itemPromo("qty", ["hat"], 3, THRESHOLD_QUANTITY), cart)
      const amtResult = evaluatePromo(cartPromo("amt", 1500), cart)

      const sorted = buildPromoSorter(SORT_MAX_GAP, cartStats)([qtyResult, amtResult])
      expect(sorted[0]!.promo.id).toBe("qty") // $20 gap
      expect(sorted[1]!.promo.id).toBe("amt") // $5 gap
    })
  })

  describe(SORT_RANDOM, () => {
    it("returns all results unchanged in count", () => {
      const sorted = buildPromoSorter(SORT_RANDOM)(results)
      expect(sorted).toHaveLength(results.length)
    })

    it("contains the same elements as the input", () => {
      const sorted = buildPromoSorter(SORT_RANDOM)(results)
      expect(sorted.map((r) => r.promo.id).sort()).toEqual(
        results.map((r) => r.promo.id).sort(),
      )
    })

    it("does not mutate the input array", () => {
      const copy = [...results]
      buildPromoSorter(SORT_RANDOM)(results)
      expect(results).toEqual(copy)
    })
  })

  describe(SORT_WEIGHTED, () => {
    const w1 = { ...cartPromo("w1"), weight: 5 }
    const w2 = { ...cartPromo("w2"), weight: 10 }
    const w3 = cartPromo("w3") // no weight field
    const bigCart = [cartItem("a", 6000)]
    const weightedResults = [
      evaluatePromo(w1, bigCart),
      evaluatePromo(w2, bigCart),
      evaluatePromo(w3, bigCart),
    ]

    it("sorts by weight descending", () => {
      const sorted = buildPromoSorter(SORT_WEIGHTED)(weightedResults)
      expect(sorted[0]!.promo.id).toBe("w2") // weight 10
      expect(sorted[1]!.promo.id).toBe("w1") // weight 5
    })

    it("treats missing weight as 0", () => {
      const sorted = buildPromoSorter(SORT_WEIGHTED)(weightedResults)
      expect(sorted[2]!.promo.id).toBe("w3") // no weight → 0
    })

    it("handles two promos both missing weight", () => {
      const r = [evaluatePromo(cartPromo("x"), bigCart), evaluatePromo(cartPromo("y"), bigCart)]
      const sorted = buildPromoSorter(SORT_WEIGHTED)(r)
      expect(sorted).toHaveLength(2)
    })

    it("does not mutate the input array", () => {
      const copy = [...weightedResults]
      buildPromoSorter(SORT_WEIGHTED)(weightedResults)
      expect(weightedResults).toEqual(copy)
    })
  })
})
