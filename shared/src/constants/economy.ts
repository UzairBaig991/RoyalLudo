import type { DailyReward, ShopItem } from '../types/economy';

export const INITIAL_WALLET = {
  gold: 5000,
  gems: 50,
};

export const DICE_CATALOG: ShopItem[] = [
  {
    id: 'dice_classic_gold',
    name: 'Royal Sovereign',
    description: 'The golden die of kings, cast in pure brass with onyx pips.',
    type: 'dice',
    rarity: 'royal',
    cost: 0,
    currency: 'gold',
    previewAsset: 'dice_sovereign',
    isFeatured: true,
  },
  {
    id: 'dice_ruby_emperor',
    name: 'Ruby Emperor',
    description: 'Crimson gemstone with fiery sparkling rolling effects.',
    type: 'dice',
    rarity: 'legendary',
    cost: 10000,
    currency: 'gold',
    previewAsset: 'dice_ruby',
    isFeatured: true,
  },
  {
    id: 'dice_sapphire_frost',
    name: 'Sapphire Frost',
    description: 'Glacial blue crystalline dice leaving icy frost trails.',
    type: 'dice',
    rarity: 'epic',
    cost: 5000,
    currency: 'gold',
    previewAsset: 'dice_sapphire',
  },
  {
    id: 'dice_emerald_viper',
    name: 'Emerald Viper',
    description: 'Deep green jade with glowing golden serpent symbols.',
    type: 'dice',
    rarity: 'epic',
    cost: 5000,
    currency: 'gold',
    previewAsset: 'dice_emerald',
  },
  {
    id: 'dice_obsidian_shadow',
    name: 'Obsidian Shadow',
    description: 'Dark matter with electric purple particle emissions.',
    type: 'dice',
    rarity: 'legendary',
    cost: 200,
    currency: 'gems',
    previewAsset: 'dice_obsidian',
  },
  {
    id: 'dice_cyber_neon',
    name: 'Cyber Core',
    description: 'Futuristic holographic die with rotating gyro ring.',
    type: 'dice',
    rarity: 'rare',
    cost: 2500,
    currency: 'gold',
    previewAsset: 'dice_cyber',
  },
];

export const BOARD_SKINS: ShopItem[] = [
  {
    id: 'board_royal_navy',
    name: 'Royal Midnight',
    description: 'Deep midnight navy fabric with gold filigree and plush corners.',
    type: 'board',
    rarity: 'royal',
    cost: 0,
    currency: 'gold',
    previewAsset: 'board_midnight',
    isFeatured: true,
  },
  {
    id: 'board_marble_palace',
    name: 'Marble Palace',
    description: 'Italian polished white marble with inlaid gold borders.',
    type: 'board',
    rarity: 'epic',
    cost: 15000,
    currency: 'gold',
    previewAsset: 'board_marble',
  },
  {
    id: 'board_cyber_grid',
    name: 'Cyberpunk Arena',
    description: 'High-tech dark carbon weave with glowing circuit lines.',
    type: 'board',
    rarity: 'legendary',
    cost: 300,
    currency: 'gems',
    previewAsset: 'board_cyber',
  },
];

export const DAILY_REWARD_CALENDAR: DailyReward[] = [
  { day: 1, gold: 500, gems: 0 },
  { day: 2, gold: 1000, gems: 5 },
  { day: 3, gold: 1500, gems: 10 },
  { day: 4, gold: 2000, gems: 15 },
  { day: 5, gold: 3000, gems: 25 },
  { day: 6, gold: 5000, gems: 40 },
  { day: 7, gold: 10000, gems: 100, itemRewardId: 'dice_sapphire_frost' },
];

export const LEAGUE_TIERS = [
  { name: 'Bronze', minPoints: 0, maxPoints: 999, promotionReward: 1000, badge: 'league_bronze' },
  { name: 'Silver', minPoints: 1000, maxPoints: 2499, promotionReward: 2500, badge: 'league_silver' },
  { name: 'Gold', minPoints: 2500, maxPoints: 4999, promotionReward: 5000, badge: 'league_gold' },
  { name: 'Platinum', minPoints: 5000, maxPoints: 9999, promotionReward: 10000, badge: 'league_platinum' },
  { name: 'Diamond', minPoints: 10000, maxPoints: 19999, promotionReward: 25000, badge: 'league_diamond' },
  { name: 'Royal', minPoints: 20000, maxPoints: Infinity, promotionReward: 50000, badge: 'league_royal' },
] as const;
