/// <reference types="node" />
import type { CartItem, Promo, PromoResult } from "../src/index.js"
import {
  buildIndex,
  buildPromoSorter,
  buildCartStats,
  groupPromos,
  SORT_MAX_GAP,
  SORT_MIN_GAP,
  SORT_RANDOM,
  SORT_WEIGHTED,
  REWARD_COST_OFF,
  REWARD_PERCENT_OFF,
  searchPromos,
  TARGET_CART,
  TARGET_SHIPPING,
  THRESHOLD_COST,
  THRESHOLD_QUANTITY,
  TRIGGER_CART_SPEND,
  TRIGGER_ITEM_SPEND,
} from "../src/index.js"

// Generate 50 promos with realistic thresholds for mixed statuses
function generatePromos(count: number): Promo[] {
  const promos: Promo[] = []
  const skus = ["sku-1", "sku-2", "sku-3", "sku-4", "sku-5"]

  for (let i = 0; i < count; i++) {
    const type = i % 3
    const thresholdMultiplier = 0.5 + (i / count) * 1.5 // ranges from 0.5 to 2.0

    const trigger = type === 0
      ? {
        type: TRIGGER_CART_SPEND,
        threshold: { type: THRESHOLD_COST, value: Math.floor(15000 * thresholdMultiplier) } // $150 to $300
      }
      : {
        type: TRIGGER_ITEM_SPEND,
        skus: [skus[Math.floor(Math.random() * skus.length)]],
        threshold: { type: THRESHOLD_QUANTITY, value: Math.floor(3 * thresholdMultiplier) + 1 } // 1-6 items
      }

    const reward = Math.random() > 0.5
      ? { type: REWARD_PERCENT_OFF, value: Math.floor(Math.random() * 30) + 10, target: TARGET_CART }
      : { type: REWARD_COST_OFF, value: Math.floor(Math.random() * 3000) + 500, target: TARGET_SHIPPING }

    promos.push({
      id: `promo-${i}`,
      label: `Promo ${i}: ${Math.random() > 0.5 ? "Get " + (reward as any).value + "% off" : "Free shipping"}`,
      weight: Math.floor(Math.random() * 100),
      nudge: Math.random() > 0.5 ? Math.floor(Math.random() * 100) : undefined,
      trigger,
      reward,
    })
  }

  return promos
}

// Generate 500 cart items
function generateCart(count: number): CartItem[] {
  const skus = ["sku-1", "sku-2", "sku-3", "sku-4", "sku-5"]
  const items: CartItem[] = []

  for (let i = 0; i < count; i++) {
    items.push({
      sku: skus[Math.floor(Math.random() * skus.length)],
      price: Math.floor(Math.random() * 5000) + 500,
      qty: Math.floor(Math.random() * 3) + 1,
    })
  }

  return items
}

function formatTime(ms: number): string {
  return `${ms.toFixed(2)}ms`
}

// Parse CLI arguments
const args = process.argv.slice(2)
if (args.includes("--help") || args.includes("-h")) {
  console.log("Usage: npm run benchmark [promos] [items]")
  console.log("")
  console.log("Arguments:")
  console.log("  promos  Number of promos to benchmark (default: 50)")
  console.log("  items   Comma-separated cart item counts (default: 500)")
  console.log("")
  console.log("Examples:")
  console.log("  npm run benchmark                      # 50 promos, 500 items")
  console.log("  npm run benchmark 100 1000             # 100 promos, 1000 items")
  console.log("  npm run benchmark 200 100,500,1000     # 200 promos, test with 100/500/1000 items")
  process.exit(0)
}

const promoCount = parseInt(args[0] ?? "50", 10) || 50
const itemCounts = (args[1] ?? "500").split(",").map(s => parseInt(s.trim(), 10)).filter(n => n > 0)

console.log("🚀 Promo Search Benchmark")
console.log("========================\n")

// Generate promos
console.log("📊 Generating promos...")
const startGen = performance.now()
const promos = generatePromos(promoCount)
const genTime = performance.now() - startGen
console.log(`  Generated ${promos.length} promos in ${formatTime(genTime)}`)

// Build index once
console.log("\n📑 Building index...")
const startIndex = performance.now()
const index = buildIndex(promos)
const indexTime = performance.now() - startIndex
console.log(`  Index built in ${formatTime(indexTime)}`)

// Run benchmark for each item count
const allResults: { itemCount: number; results: PromoResult[]; searchTime: number; timings: { name: string; ms: number }[]; groupTime: number }[] = []

for (const itemCount of itemCounts) {
  console.log(`\n${"=".repeat(50)}`)
  console.log(`📊 Benchmarking with ${itemCount} cart items`)
  console.log(`${"=".repeat(50)}`)

  // Generate cart
  const cart = generateCart(itemCount)
  const stats = buildCartStats(cart)
  const cartTotalValue = cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
  const cartItemTotal = cart.reduce((sum, item) => sum + item.qty, 0)
  console.log(`  Cart: ${cart.length} line items (${cartItemTotal} units, $${(cartTotalValue / 100).toFixed(2)} total)`)

  // Search promos
  console.log(`🔍 Searching promos...`)
  const startSearch = performance.now()
  const results = searchPromos(cart, index)
  const searchTime = performance.now() - startSearch
  console.log(`  Found ${results.length} applicable promos in ${formatTime(searchTime)}`)

  // Sort algorithms
  console.log(`⚡ Sorting:`)

  const algorithms = [
    { name: "min gap", sorter: buildPromoSorter(SORT_MIN_GAP, stats) },
    { name: "max gap", sorter: buildPromoSorter(SORT_MAX_GAP, stats) },
    { name: "weighted", sorter: buildPromoSorter(SORT_WEIGHTED) },
    { name: "random", sorter: buildPromoSorter(SORT_RANDOM) },
  ]

  const timings: { name: string; ms: number }[] = []

  for (const { name, sorter } of algorithms) {
    const start = performance.now()
    sorter(results)
    const time = performance.now() - start

    timings.push({ name, ms: time })
    console.log(`  ${name.padEnd(12)} — ${formatTime(time)}`)
  }

  // Grouping performance
  console.log(`📦 Grouping:`)
  const startGroup = performance.now()
  const minGapSorter = buildPromoSorter(SORT_MIN_GAP, stats)
  groupPromos(minGapSorter(results))
  const groupTime = performance.now() - startGroup
  console.log(`  Grouped ${results.length} promos in ${formatTime(groupTime)}`)

  allResults.push({ itemCount, results, searchTime, timings, groupTime })
}

// Summary table across all item counts
console.log(`\n${"=".repeat(50)}`)
console.log(`📊 Performance Comparison Table`)
console.log(`${"=".repeat(50)}\n`)

const nameColWidth = 14
const totalColWidth = 10
const breakdownColWidth = 56
const algorithmNames = allResults[0].timings.map(t => t.name)
const headerParts = ["Algorithm".padEnd(nameColWidth)]
for (const { itemCount: count } of allResults) {
  const label = `${count} items (index + search + sort + group)`
  headerParts.push(label.padEnd(totalColWidth + breakdownColWidth + 1))
}
const header = headerParts.join(" │ ")
console.log(header)
console.log("─".repeat(header.length))

for (const algoName of algorithmNames) {
  const rowParts = [algoName.padEnd(nameColWidth)]
  for (const { searchTime, timings, groupTime } of allResults) {
    const sortTime = timings.find(t => t.name === algoName)?.ms ?? 0
    const total = indexTime + searchTime + sortTime + groupTime
    const breakdown = `(${formatTime(indexTime)} + ${formatTime(searchTime)} + ${formatTime(sortTime)} + ${formatTime(groupTime)})`
    rowParts.push(formatTime(total).padEnd(totalColWidth) + " " + breakdown.padEnd(breakdownColWidth))
  }
  console.log(rowParts.join(" │ "))
}

// Sample output
if (allResults.length > 0) {
  const { results } = allResults[0]
  console.log("\n📋 Sample results (first 5):")
  results.slice(0, 5).forEach(({ promo, status, progress, gap }: PromoResult) => {
    const gapLabel = promo.trigger.threshold.type === THRESHOLD_QUANTITY
      ? `${gap} item${gap === 1 ? "" : "s"}`
      : `$${(gap / 100).toFixed(2)}`
    console.log(`  [${status}] ${promo.label} (${Math.round(progress * 100)}% progress, ${gapLabel} to trigger)`)
  })
}
