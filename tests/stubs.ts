import {
  TRIGGER_CART_SPEND,
  TRIGGER_ITEM_SPEND,
  THRESHOLD_AMOUNT,
  THRESHOLD_PERCENT,
  REWARD_AMOUNT_OFF,
  REWARD_PERCENT_OFF,
} from "../src/types.js"
import type { Promo, Reward } from "../src/types.js"
import type { CartItem } from "../src/search.js"

type ThresholdType = typeof THRESHOLD_AMOUNT | typeof THRESHOLD_PERCENT
type RewardType = typeof REWARD_AMOUNT_OFF | typeof REWARD_PERCENT_OFF

const makeReward = (type: RewardType, value: number): Reward =>
  type === REWARD_AMOUNT_OFF
    ? { type: REWARD_AMOUNT_OFF, value, target: "cart" }
    : { type: REWARD_PERCENT_OFF, value, target: "cart" }

export const cartItem = (sku: string, price: number, qty = 1): CartItem => ({ sku, price, qty })

export const cartPromo = (
  id: string,
  threshold = 5000,
  thresholdType: ThresholdType = THRESHOLD_AMOUNT,
  rewardType: RewardType = REWARD_AMOUNT_OFF,
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
  thresholdType: ThresholdType = THRESHOLD_AMOUNT,
  rewardType: RewardType = REWARD_PERCENT_OFF,
): Promo => ({
  id,
  label: id,
  trigger: { type: TRIGGER_ITEM_SPEND, skus, threshold: { type: thresholdType, value: threshold } },
  reward: makeReward(rewardType, 10),
})
