# promo_search_proto

Prototype for promo search and evaluation logic.

## Structure

- `src/types.ts` — shared types and constants (`Promo`, `Trigger`, `Reward`, etc.)
- `src/indexer.ts` — builds a lookup index from a list of promos
- `src/search.ts` — evaluates promos against a cart (`searchPromos`, `evaluatePromo`)
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

### PromoResult fields

| Field | Type | Description |
|---|---|---|
| `promo` | `Promo` | The matched promo |
| `status` | `"reached" \| "nudge" \| "silent"` | Whether the promo is active, close, or too far away |
| `progress` | `number` | 0–1 fraction of the trigger threshold met |
| `gap` | `number` | Remaining spend in cents to reach the threshold |

### Reward targets

| Target | Description |
|---|---|
| `"cart"` | Discount applied to the order total |
| `"shipping"` | Discount applied to shipping cost |
| `"cheapest"` | Discount applied to the cheapest qualifying item |
| `"most_expensive"` | Discount applied to the most expensive qualifying item |
| `string` (SKU) | Discount applied to a specific item |
