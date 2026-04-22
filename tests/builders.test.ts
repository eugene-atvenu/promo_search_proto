import { buildPromoSearch } from "../src/builders.js"
import { SORT_WEIGHTED, STATUS_REACHED, STATUS_NUDGE } from "../src/types.js"
import { cartItem, cartPromo, itemPromo } from "./stubs.js"

describe("buildPromoSearch", () => {
  it("returns a callable search function", () => {
    expect(typeof buildPromoSearch([])).toBe("function")
  })

  it("returns empty groups when no promos match", () => {
    const search = buildPromoSearch([itemPromo("p1", ["sku-a"], 1000)])
    const { reached, nudge } = search([cartItem("sku-b", 1000)])
    expect(reached).toHaveLength(0)
    expect(nudge).toHaveLength(0)
  })

  it("puts reached promos in the reached group", () => {
    const promo = cartPromo("p1", 1000)
    const search = buildPromoSearch([promo])
    const { reached, nudge } = search([cartItem("a", 1000)])
    expect(reached).toHaveLength(1)
    expect(reached[0]!.promo).toBe(promo)
    expect(nudge).toHaveLength(0)
  })

  it("puts nudge promos in the nudge group", () => {
    const promo = cartPromo("p1", 1000)
    const search = buildPromoSearch([promo])
    const { reached, nudge } = search([cartItem("a", 900)])
    expect(nudge).toHaveLength(1)
    expect(nudge[0]!.promo).toBe(promo)
    expect(reached).toHaveLength(0)
  })

  it("never mixes reached and nudge in the same group", () => {
    const reached = cartPromo("r", 1000)
    const nudge = cartPromo("n", 1200)
    const search = buildPromoSearch([reached, nudge])
    const groups = search([cartItem("a", 1000)])
    expect(groups.reached.every(r => r.status === STATUS_REACHED)).toBe(true)
    expect(groups.nudge.every(r => r.status === STATUS_NUDGE)).toBe(true)
  })

  it("reuses the same index across multiple calls", () => {
    const promo = cartPromo("p1", 1000)
    const search = buildPromoSearch([promo])
    const first = search([cartItem("a", 1000)])
    const second = search([cartItem("a", 1000)])
    expect(first.reached[0]!.promo).toBe(second.reached[0]!.promo)
  })

  it("produces different results for different carts", () => {
    const search = buildPromoSearch([cartPromo("p1", 1000)])
    const full = search([cartItem("a", 1000)])
    const empty = search([cartItem("a", 100)])
    expect(full.reached).toHaveLength(1)
    expect(empty.reached).toHaveLength(0)
    expect(empty.nudge).toHaveLength(0)
  })

  it("accepts an explicit sort algorithm", () => {
    const search = buildPromoSearch([cartPromo("p1", 1000)], SORT_WEIGHTED)
    const { reached } = search([cartItem("a", 1000)])
    expect(reached).toHaveLength(1)
  })
})
