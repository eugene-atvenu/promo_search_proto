import { cartTotal, evaluateThreshold } from "../src/search.helpers.js"
import { THRESHOLD_COST, THRESHOLD_PERCENT, THRESHOLD_QUANTITY } from "../src/types.js"
import { cartItem } from "./stubs.js"

describe("cartTotal", () => {
  it("returns 0 for empty cart", () => {
    expect(cartTotal([])).toBe(0)
  })

  it("multiplies price by qty", () => {
    expect(cartTotal([cartItem("a", 1000, 3)])).toBe(3000)
  })

  it("sums multiple items", () => {
    expect(cartTotal([cartItem("a", 1000), cartItem("b", 500, 2)])).toBe(2000)
  })
})

describe("evaluateThreshold", () => {
  const cart = [cartItem("a", 1000, 2)] // total = 2000

  it("returns threshold value for cost threshold", () => {
    expect(evaluateThreshold({ type: THRESHOLD_COST, value: 5000 }, cart)).toBe(5000)
  })

  it("returns percent of cart total for percent threshold", () => {
    expect(evaluateThreshold({ type: THRESHOLD_PERCENT, value: 50 }, cart)).toBe(1000)
  })

  it("returns threshold value for quantity threshold", () => {
    expect(evaluateThreshold({ type: THRESHOLD_QUANTITY, value: 3 }, cart)).toBe(3)
  })
})
