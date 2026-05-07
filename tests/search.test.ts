import { buildIndex } from "../src/indexer.js"
import { evaluatePromo, searchPromos } from "../src/search.js"
import { THRESHOLD_PERCENT, THRESHOLD_QUANTITY, STATUS_REACHED, STATUS_NUDGE, STATUS_SILENT } from "../src/types.js"
import { cartItem, cartPromo, itemPromo } from "./stubs.js"

describe("evaluatePromo", () => {
  it("uses full cart total for cart_spend promo", () => {
    const cart = [cartItem("a", 3000), cartItem("b", 2000)]
    const result = evaluatePromo(cartPromo("p1", 5000), cart)
    expect(result.progress).toBe(1)
    expect(result.gap).toBe(0)
    expect(result.status).toBe(STATUS_REACHED)
  })

  it("uses only qualifying SKUs for item_spend promo", () => {
    const cart = [cartItem("sku-a", 2000), cartItem("sku-b", 5000)]
    const result = evaluatePromo(itemPromo("p1", ["sku-a"], 4000), cart)
    expect(result.progress).toBe(0.5)
    expect(result.gap).toBe(2000)
    expect(result.status).toBe(STATUS_SILENT)
  })

  it("status is nudge when progress is between 0.8 and 1", () => {
    const cart = [cartItem("a", 4000)]
    const result = evaluatePromo(cartPromo("p1", 5000), cart)
    expect(result.status).toBe(STATUS_NUDGE)
  })

  it("status is silent when progress is below 0.8", () => {
    const cart = [cartItem("a", 1000)]
    const result = evaluatePromo(cartPromo("p1", 5000), cart)
    expect(result.status).toBe(STATUS_SILENT)
  })

  it("uses promo nudge threshold when set", () => {
    const promo = { ...cartPromo("p1", 1000), nudge: 70 }
    const cart = [cartItem("a", 750)]
    expect(evaluatePromo(promo, cart).status).toBe(STATUS_NUDGE)
  })

  it("promo nudge threshold overrides default", () => {
    const promo = { ...cartPromo("p1", 1000), nudge: 90 }
    const cart = [cartItem("a", 850)]
    expect(evaluatePromo(promo, cart).status).toBe(STATUS_SILENT)
  })

  it("caps progress at 1 when cart exceeds threshold", () => {
    const cart = [cartItem("a", 9000)]
    const result = evaluatePromo(cartPromo("p1", 5000), cart)
    expect(result.progress).toBe(1)
    expect(result.gap).toBe(0)
  })

  describe("quantity threshold", () => {
    const qtyPromo = (id: string, skus: string[], qty: number) =>
      itemPromo(id, skus, qty, THRESHOLD_QUANTITY)

    it("counts qualifying item qty, not spend", () => {
      const cart = [cartItem("hat", 1800, 1)]
      const result = evaluatePromo(qtyPromo("p1", ["hat"], 2), cart)
      expect(result.progress).toBe(0.5)
      expect(result.gap).toBe(1)
      expect(result.status).toBe(STATUS_SILENT)
    })

    it("status is reached when qty meets threshold", () => {
      const cart = [cartItem("hat", 1800, 2)]
      const result = evaluatePromo(qtyPromo("p1", ["hat"], 2), cart)
      expect(result.progress).toBe(1)
      expect(result.gap).toBe(0)
      expect(result.status).toBe(STATUS_REACHED)
    })

    it("only counts SKUs matching the trigger", () => {
      const cart = [cartItem("hat", 1800, 2), cartItem("tee", 2500, 3)]
      const result = evaluatePromo(qtyPromo("p1", ["hat"], 2), cart)
      expect(result.progress).toBe(1)
    })

    it("sums qty across multiple cart rows for the same SKU", () => {
      const cart = [cartItem("hat", 1800, 1), cartItem("hat", 1800, 1)]
      const result = evaluatePromo(qtyPromo("p1", ["hat"], 2), cart)
      expect(result.progress).toBe(1)
    })

    it("ignores promo SKUs not present in cart", () => {
      const cart = [cartItem("hat", 1800, 2)]
      const result = evaluatePromo(qtyPromo("p1", ["hat", "tee"], 2), cart)
      expect(result.progress).toBe(1)
    })
  })

  it("handles empty cart", () => {
    const result = evaluatePromo(cartPromo("p1", 1000), [])
    expect(result.progress).toBe(0)
    expect(result.gap).toBe(1000)
    expect(result.status).toBe(STATUS_SILENT)
  })

  it("supports percent threshold against full cart total", () => {
    const promo = cartPromo("p1", 50, THRESHOLD_PERCENT)
    const result = evaluatePromo(promo, [cartItem("a", 1000, 2)])
    expect(result.progress).toBe(1)
    expect(result.status).toBe(STATUS_REACHED)
  })
})

describe("searchPromos", () => {
  it("returns reached cart_spend promo", () => {
    const promo = cartPromo("p1", 1000)
    const index = buildIndex([promo])
    const results = searchPromos([cartItem("anything", 1000)], index)
    expect(results).toHaveLength(1)
    expect(results[0]!.promo).toBe(promo)
  })

  it("returns nudge item_spend promo when cart contains a matching SKU", () => {
    const promo = itemPromo("p1", ["sku-a"], 1000)
    const index = buildIndex([promo])
    const results = searchPromos([cartItem("sku-a", 900)], index)
    expect(results).toHaveLength(1)
    expect(results[0]!.promo).toBe(promo)
  })

  it("filters out silent promos", () => {
    const index = buildIndex([cartPromo("p1", 5000)])
    const results = searchPromos([cartItem("anything", 100)], index)
    expect(results).toHaveLength(0)
  })

  it("does not return item_spend promos when no SKU matches", () => {
    const index = buildIndex([itemPromo("p1", ["sku-a"], 1000)])
    const results = searchPromos([cartItem("sku-b", 1000)], index)
    expect(results).toHaveLength(0)
  })

  it("deduplicates when multiple cart items match the same promo", () => {
    const promo = itemPromo("p1", ["sku-a", "sku-b"], 1000)
    const index = buildIndex([promo])
    const results = searchPromos([cartItem("sku-a", 500), cartItem("sku-b", 500)], index)
    expect(results).toHaveLength(1)
  })

  it("returns all non-silent matches in unspecified order", () => {
    const high = cartPromo("high", 1000)
    const low = { ...cartPromo("low", 2000), nudge: 40 }
    const index = buildIndex([low, high])
    const cart = [cartItem("a", 900)]
    const results = searchPromos(cart, index)
    expect(results).toHaveLength(2)
    expect(results.map((r) => r.promo)).toEqual(expect.arrayContaining([high, low]))
  })
})
