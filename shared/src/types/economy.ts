export type CurrencyType = 'gold' | 'gems' | 'xp';

export interface WalletBalance {
  gold: number;
  gems: number;
}

export type CosmeticRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'royal';

export type CosmeticType = 'dice' | 'board' | 'token' | 'frame' | 'emoji' | 'gift';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: CosmeticType;
  rarity: CosmeticRarity;
  cost: number;
  currency: 'gold' | 'gems';
  previewAsset: string;
  isFeatured?: boolean;
}

export interface InventoryItem {
  id: string;
  itemId: string;
  type: CosmeticType;
  acquiredAt: string;
}

export interface DailyReward {
  day: number;
  gold: number;
  gems: number;
  itemRewardId?: string;
}

export interface DailyCardOption {
  id: string;
  rewardType: CurrencyType | 'item';
  amount: number;
  itemId?: string;
  rarity: CosmeticRarity;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'season';
  target: number;
  progress: number;
  isClaimed: boolean;
  rewardGold: number;
  rewardGems: number;
  rewardXP: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  tier: number;
  maxTier: number;
  progress: number;
  target: number;
  isUnlocked: boolean;
  rewardGems: number;
}

export interface SeasonPassReward {
  level: number;
  xpRequired: number;
  freeReward: { type: CurrencyType | 'item'; amount: number; itemId?: string };
  royalReward: { type: CurrencyType | 'item'; amount: number; itemId?: string };
}
