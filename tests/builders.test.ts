import { buildSearch } from "../src/builders.js"
import { cartItem, cartPromo, itemPromo } from "./stubs.js"

describe("buildSearch", () => {
  it("returns a callable search function", () => {
    const search = buildSearch([])
    expect(typeof search).toBe("function")
  })

  it("returns empty array when no promos match", () => {
    const search = buildSearch([itemPromo("p1", ["sku-a"], 1000)])
    expect(search([cartItem("sku-b", 1000)])).toHaveLength(0)
  })

  it("finds matching promos for a given cart", () => {
    const promo = cartPromo("p1", 1000)
    const search = buildSearch([promo])
    const results = search([cartItem("a", 1000)])
    expect(results).toHaveLength(1)
    expect(results[0]!.promo).toBe(promo)
  })

  it("reuses the same index across multiple calls", () => {
    const promo = cartPromo("p1", 1000)
    const search = buildSearch([promo])
    const first = search([cartItem("a", 1000)])
    const second = search([cartItem("a", 1000)])
    expect(first[0]!.promo).toBe(second[0]!.promo)
  })

  it("produces different results for different carts", () => {
    const search = buildSearch([cartPromo("p1", 1000)])
    expect(search([cartItem("a", 1000)])).toHaveLength(1)
    expect(search([cartItem("a", 100)])).toHaveLength(0)
  })
})
