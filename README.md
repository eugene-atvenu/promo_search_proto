# promo_search_proto

Prototype for promo search and evaluation logic.

## Structure

- `src/types.ts` — all constants and types (`Promo`, `Trigger`, `Reward`, `CartItem`, `PromoResult`, `SortAlgorithm`, etc.)
- `src/indexer.ts` — `buildIndex`: builds a lookup index from a list of promos
- `src/indexer.helpers.ts` — internal Map utility (`getOrCreate`); not part of the public API
- `src/search.helpers.ts` — `cartTotal`, `evaluateThreshold` and internal cart helpers
- `src/search.ts` — `evaluatePromo`, `searchPromos`
- `src/aggregator.ts` — `groupPromos`: splits results into `reached` and `nudge` groups
- `src/builders.ts` — `buildPromoSorter`, `buildPromoSearch`: high-level factory functions
- `src/sorting/` — individual sort algorithm implementations (`gap.ts`, `max_gap.ts`, `min_gap.ts`, `random.ts`, `weighted.ts`)
- `src/index.ts` — re-exports everything public

## Scripts

```
npm run build      # compile to dist/
npm test           # run tests with coverage
npm run example    # run examples/usage.ts
npm run example:helper  # run examples/usage_helper.ts
```

## Usage

### All-in-one: `buildPromoSearch`

The simplest path — builds the index once, sorts and groups results on every call:

```ts
import { buildPromoSearch, SORT_MIN_GAP } from "promo_search_proto"

const search = buildPromoSearch(promos, SORT_MIN_GAP)
const { reached, nudge } = search(cartItems)
```

`reached` contains triggered promos; `nudge` contains promos the customer is close to triggering. Both arrays are sorted by the chosen algorithm. The algorithm defaults to `SORT_MIN_GAP` if omitted.

See [`examples/usage_helper.ts`](examples/usage_helper.ts) for a full example.

### Manual compose

For more control, use the lower-level functions individually:

```ts
import { buildIndex, searchPromos, buildPromoSorter, groupPromos, SORT_WEIGHTED } from "promo_search_proto"

const index = buildIndex(promos)
const results = searchPromos(cartItems, index)

const sort = buildPromoSorter(SORT_WEIGHTED)
const { reached, nudge } = groupPromos(sort(results))
```

See [`examples/usage.ts`](examples/usage.ts) for a full example showing all sort algorithms.

### Sorting algorithms

| Constant | Description |
|---|---|
| `SORT_MIN_GAP` | Smallest cost gap first — promos closest to being triggered |
| `SORT_MAX_GAP` | Largest cost gap first — promos furthest from being triggered |
| `SORT_WEIGHTED` | Descending by `promo.weight`; promos without a weight are treated as `0` |
| `SORT_RANDOM` | Fisher-Yates shuffle |

`cartItems` is required when using `SORT_MIN_GAP` or `SORT_MAX_GAP` with any promo that has a `quantity` threshold. In that case the raw unit gap is converted to a cost value using the weighted-average price of the matching SKUs in the cart before comparing.

### PromoResult fields

| Field | Type | Description |
|---|---|---|
| `promo` | `Promo` | The matched promo |
| `status` | `"reached" \| "nudge" \| "silent"` | Whether the promo is triggered, close, or too far away |
| `progress` | `number` | 0–1 fraction of the trigger threshold met |
| `gap` | `number` | Remaining quantity or cost to reach the threshold |

### Reward targets

| Target | Description |
|---|---|
| `TARGET_CART` | Discount applied to the order total |
| `TARGET_SHIPPING` | Discount applied to shipping cost |
| `TARGET_CHEAPEST` | Discount applied to the cheapest qualifying item |
| `TARGET_MOST_EXPENSIVE` | Discount applied to the most expensive qualifying item |
| `string` (SKU) | Discount applied to a specific item |
