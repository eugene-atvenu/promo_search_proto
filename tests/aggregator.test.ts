import { groupPromos } from "../src/aggregator.js"
import { STATUS_REACHED, STATUS_NUDGE, STATUS_SILENT } from "../src/types.js"
import type { PromoResult } from "../src/types.js"
import { cartPromo } from "./stubs.js"

const makeResult = (status: PromoResult["status"]): PromoResult => ({
  promo: cartPromo("p"),
  status,
  progress: 0.5,
  gap: 500,
})

describe("groupPromos", () => {
  it("returns empty groups for empty input", () => {
    const { reached, nudge } = groupPromos([])
    expect(reached).toHaveLength(0)
    expect(nudge).toHaveLength(0)
  })

  it("places reached results in reached", () => {
    const result = makeResult(STATUS_REACHED)
    const { reached, nudge } = groupPromos([result])
    expect(reached).toEqual([result])
    expect(nudge).toHaveLength(0)
  })

  it("places nudge results in nudge", () => {
    const result = makeResult(STATUS_NUDGE)
    const { reached, nudge } = groupPromos([result])
    expect(nudge).toEqual([result])
    expect(reached).toHaveLength(0)
  })

  it("silently drops silent results", () => {
    const result = makeResult(STATUS_SILENT)
    const { reached, nudge } = groupPromos([result])
    expect(reached).toHaveLength(0)
    expect(nudge).toHaveLength(0)
  })

  it("correctly separates mixed results", () => {
    const r = makeResult(STATUS_REACHED)
    const n = makeResult(STATUS_NUDGE)
    const s = makeResult(STATUS_SILENT)
    const { reached, nudge } = groupPromos([r, n, s])
    expect(reached).toEqual([r])
    expect(nudge).toEqual([n])
  })
})
