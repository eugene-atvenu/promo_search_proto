import { getOrCreate } from "../src/indexer.helpers.js"

describe("getOrCreate", () => {
  it("creates a new Set when key is absent", () => {
    const map = new Map<string, Set<string>>()
    const set = getOrCreate(map, "k")
    expect(set).toBeInstanceOf(Set)
    expect(map.get("k")).toBe(set)
  })

  it("returns the existing Set when key is present", () => {
    const map = new Map<string, Set<string>>()
    const existing = new Set(["x"])
    map.set("k", existing)
    expect(getOrCreate(map, "k")).toBe(existing)
  })

  it("mutations on the returned Set are reflected in the map", () => {
    const map = new Map<string, Set<string>>()
    getOrCreate(map, "k").add("v")
    expect(map.get("k")?.has("v")).toBe(true)
  })
})
