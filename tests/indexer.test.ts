import { buildIndex } from "../src/indexer.js"
import { cartPromo, itemPromo } from "./stubs.js"

describe("buildIndex", () => {
  it("returns empty index for empty input", () => {
    const index = buildIndex([])
    expect(index.promoMap.size).toBe(0)
    expect(index.itemIndex.size).toBe(0)
    expect(index.cartSpend.size).toBe(0)
  })

  it("adds all promos to promoMap", () => {
    const promos = [itemPromo("p1", ["sku-a"]), cartPromo("p2")]
    const { promoMap } = buildIndex(promos)
    expect(promoMap.get("p1")).toBe(promos[0])
    expect(promoMap.get("p2")).toBe(promos[1])
  })

  it("indexes item_spend promos by SKU", () => {
    const { itemIndex } = buildIndex([itemPromo("p1", ["sku-a", "sku-b"])])
    expect(itemIndex.get("sku-a")).toContain("p1")
    expect(itemIndex.get("sku-b")).toContain("p1")
  })

  it("adds cart_spend promos to cartSpend set", () => {
    const { cartSpend } = buildIndex([cartPromo("p1")])
    expect(cartSpend.has("p1")).toBe(true)
  })

  it("multiple promos sharing a SKU both appear in itemIndex", () => {
    const promos = [itemPromo("p1", ["sku-a"]), itemPromo("p2", ["sku-a"])]
    const { itemIndex } = buildIndex(promos)
    const ids = itemIndex.get("sku-a")
    expect(ids).toContain("p1")
    expect(ids).toContain("p2")
  })

  it("does not add item_spend promos to cartSpend", () => {
    const { cartSpend } = buildIndex([itemPromo("p1", ["sku-a"])])
    expect(cartSpend.has("p1")).toBe(false)
  })

  it("does not add cart_spend promos to itemIndex", () => {
    const { itemIndex } = buildIndex([cartPromo("p1")])
    expect(itemIndex.size).toBe(0)
  })
})
