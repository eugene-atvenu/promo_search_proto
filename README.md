# promo_search_proto

Prototype for promo search and evaluation logic.

## Structure

- `src/types.ts` — shared types and constants (`Promo`, `Trigger`, `Reward`, etc.)
- `src/indexer.ts` — builds a lookup index from a list of promos
- `src/search.ts` — evaluates promos against a cart (`searchPromos`, `evaluatePromo`)
- `src/helper.ts` — `buildSearch(promos)` convenience wrapper; builds the index once and returns a reusable search function
- `src/sorter.ts` — `createPromoSorter` curried function for ordering search results
- `src/sorting/` — individual sort algorithm implementations
- `src/index.ts` — re-exports everything

## Scripts

```
npm run build   # compile to dist/
npm test        # run tests with coverage
```

## Usage

See [`examples/usage.ts`](examples/usage.ts) for a full working example, or run it with:

```
npm run example
```

For the `buildSearch` helper pattern (build index once, call repeatedly):

```
npm run example:helper
```

See [`examples/usage_helper.ts`](examples/usage_helper.ts).

### PromoResult fields

| Field | Type | Description |
|---|---|---|
| `promo` | `Promo` | The matched promo |
| `status` | `"reached" \| "nudge" \| "silent"` | Whether the promo is active, close, or too far away |
| `progress` | `number` | 0–1 fraction of the trigger threshold met |
| `gap` | `number` | Remaining spend in cents to reach the threshold |

### Sorting

`createPromoSorter` is a curried function — configure the algorithm first, then apply it to results:

```ts
import { createPromoSorter } from "promo_search_proto"

// simple (no cartItems needed for weighted/random)
const sorted = createPromoSorter("weighted")(results)

// pre-configure a sorter and reuse it
const byMinGap = createPromoSorter("min_gap", cartItems)
const sorted = byMinGap(results)
```

| Algorithm | Description |
|---|---|
| `"min_gap"` | Smallest dollar gap first — promos closest to being triggered |
| `"max_gap"` | Largest dollar gap first — promos furthest from being triggered |
| `"random"` | Fisher-Yates shuffle |
| `"weighted"` | Descending by `promo.weight`; promos without a weight are treated as `0` |

`cartItems` is required for `min_gap` and `max_gap` when any promo uses a `quantity` threshold. In that case the raw unit gap is converted to cents using the weighted-average price of the matching SKUs in the cart before comparing.

### Reward targets

| Target | Description |
|---|---|
| `"cart"` | Discount applied to the order total |
| `"shipping"` | Discount applied to shipping cost |
| `"cheapest"` | Discount applied to the cheapest qualifying item |
| `"most_expensive"` | Discount applied to the most expensive qualifying item |
| `string` (SKU) | Discount applied to a specific item |
