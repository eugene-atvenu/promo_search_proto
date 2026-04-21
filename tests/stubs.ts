import type { CartItem, Promo, Reward } from "../src/index.js"
import {
  REWARD_COST_OFF,
  REWARD_PERCENT_OFF,
  THRESHOLD_COST,
  THRESHOLD_PERCENT,
  THRESHOLD_QUANTITY,
  TRIGGER_CART_SPEND,
  TRIGGER_ITEM_SPEND,
} from "../src/index.js"

type ThresholdType = typeof THRESHOLD_COST | typeof THRESHOLD_PERCENT | typeof THRESHOLD_QUANTITY
type RewardType = typeof REWARD_COST_OFF | typeof REWARD_PERCENT_OFF

const makeReward = (type: RewardType, value: number): Reward =>
  type === REWARD_COST_OFF
    ? { type: REWARD_COST_OFF, value, target: "cart" }
    : { type: REWARD_PERCENT_OFF, value, target: "cart" }

export const cartItem = (sku: string, price: number, qty = 1): CartItem => ({ sku, price, qty })

export const cartPromo = (
  id: string,
  threshold = 5000,
  thresholdType: ThresholdType = THRESHOLD_COST,
  rewardType: RewardType = REWARD_COST_OFF,
): Promo => ({
  id,
  label: id,
  trigger: { type: TRIGGER_CART_SPEND, threshold: { type: thresholdType, value: threshold } },
  reward: makeReward(rewardType, 500),
})

export const itemPromo = (
  id: string,
  skus: string[],
  threshold = 1000,
  thresholdType: ThresholdType = THRESHOLD_COST,
  rewardType: RewardType = REWARD_PERCENT_OFF,
): Promo => ({
  id,
  label: id,
  trigger: { type: TRIGGER_ITEM_SPEND, skus, threshold: { type: thresholdType, value: threshold } },
  reward: makeReward(rewardType, 10),
})
