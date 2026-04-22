export const TRIGGER_CART_SPEND = "cart_spend" as const
export const TRIGGER_ITEM_SPEND = "item_spend" as const
export const THRESHOLD_COST = "cost" as const
export const THRESHOLD_PERCENT = "percent" as const
export const THRESHOLD_QUANTITY = "quantity" as const
export const REWARD_COST_OFF = "cost_off" as const
export const REWARD_PERCENT_OFF = "percent_off" as const
export const TARGET_CART = "cart" as const
export const TARGET_SHIPPING = "shipping" as const
export const TARGET_CHEAPEST = "cheapest" as const
export const TARGET_MOST_EXPENSIVE = "most_expensive" as const
export const STATUS_REACHED = "reached" as const
export const STATUS_NUDGE = "nudge" as const
export const STATUS_SILENT = "silent" as const
export const SORT_MAX_GAP = "max_gap" as const
export const SORT_MIN_GAP = "min_gap" as const
export const SORT_RANDOM = "random" as const
export const SORT_WEIGHTED = "weighted" as const

export type Threshold =
  | { type: typeof THRESHOLD_COST; value: number }
  | { type: typeof THRESHOLD_PERCENT; value: number }
  | { type: typeof THRESHOLD_QUANTITY; value: number };

export type Trigger =
  | { type: typeof TRIGGER_CART_SPEND; threshold: Threshold }
  | { type: typeof TRIGGER_ITEM_SPEND; skus: string[]; threshold: Threshold };

export type RewardTarget = typeof TARGET_CART | typeof TARGET_SHIPPING | typeof TARGET_CHEAPEST | typeof TARGET_MOST_EXPENSIVE | string; // string = specific sku

export type Reward =
  | { type: typeof REWARD_COST_OFF; value: number; target: typeof TARGET_CART | typeof TARGET_SHIPPING }
  | { type: typeof REWARD_PERCENT_OFF; value: number; target: RewardTarget }; // value: 100 = free

export type Promo = {
  id: string;
  label: string;
  trigger: Trigger;
  reward: Reward;
  nudge?: number;
  weight?: number;
};

export type CartItem = {
  sku: string;
  price: number; // cents
  qty: number;
};

export type PromoStatus = typeof STATUS_REACHED | typeof STATUS_NUDGE | typeof STATUS_SILENT;

export type PromoResult = {
  promo: Promo;
  status: PromoStatus;
  progress: number;
  gap: number;
};

export type SortAlgorithm = typeof SORT_MAX_GAP | typeof SORT_MIN_GAP | typeof SORT_RANDOM | typeof SORT_WEIGHTED;

export type PromoGroups = {
  reached: PromoResult[];
  nudge: PromoResult[];
};
