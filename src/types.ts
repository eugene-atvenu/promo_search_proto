export const TRIGGER_CART_SPEND = "cart_spend" as const
export const TRIGGER_ITEM_SPEND = "item_spend" as const
export const THRESHOLD_AMOUNT = "amount" as const
export const THRESHOLD_PERCENT = "percent" as const
export const REWARD_AMOUNT_OFF = "amount_off" as const
export const REWARD_PERCENT_OFF = "percent_off" as const
export const TARGET_CART = "cart" as const
export const TARGET_SHIPPING = "shipping" as const
export const TARGET_CHEAPEST = "cheapest" as const
export const TARGET_MOST_EXPENSIVE = "most_expensive" as const

export type Threshold =
  | { type: typeof THRESHOLD_AMOUNT; value: number } // cents
  | { type: typeof THRESHOLD_PERCENT; value: number }; // 0-100, percent of cart total

export type Trigger =
  | { type: typeof TRIGGER_CART_SPEND; threshold: Threshold }
  | { type: typeof TRIGGER_ITEM_SPEND; skus: string[]; threshold: Threshold };

export type RewardTarget = typeof TARGET_CART | typeof TARGET_SHIPPING | typeof TARGET_CHEAPEST | typeof TARGET_MOST_EXPENSIVE | string; // string = specific sku

export type Reward =
  | { type: typeof REWARD_AMOUNT_OFF; value: number; target: typeof TARGET_CART | typeof TARGET_SHIPPING }
  | { type: typeof REWARD_PERCENT_OFF; value: number; target: RewardTarget }; // value: 100 = free

export type Promo = {
  id: string;
  label: string;
  trigger: Trigger;
  reward: Reward;
  nudge?: number; // 0-100, percent progress threshold for nudge status; defaults to NUDGE_MIN_PROGRESS
};
