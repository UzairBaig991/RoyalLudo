import { DataStore, type DBWallet } from './store';
import { DAILY_REWARD_CALENDAR, DICE_CATALOG, BOARD_SKINS } from '../../../shared/src/constants/economy';
import type { CosmeticType, ShopItem, UserProfile } from '../../../shared/src/types';

export class EconomyService {
  public static getWallet(userId: string): DBWallet {
    let wallet = DataStore.wallets.get(userId);
    if (!wallet) {
      wallet = { userId, gold: 5000, gems: 50 };
      DataStore.wallets.set(userId, wallet);
    }
    return { ...wallet };
  }

  public static credit(userId: string, currency: 'gold' | 'gems', amount: number, reason: string): DBWallet {
    if (amount <= 0) throw new Error('Credit amount must be positive.');
    const wallet = this.getWallet(userId);
    wallet[currency] += amount;
    DataStore.wallets.set(userId, wallet);

    const txList = DataStore.transactions.get(userId) || [];
    txList.push({
      id: `tx_${Date.now()}_${Math.random()}`,
      userId,
      currency,
      amount,
      type: reason,
      balanceAfter: wallet[currency],
      createdAt: new Date().toISOString(),
    });
    DataStore.transactions.set(userId, txList);

    return { ...wallet };
  }

  public static debit(userId: string, currency: 'gold' | 'gems', amount: number, reason: string): DBWallet {
    if (amount <= 0) throw new Error('Debit amount must be positive.');
    const wallet = this.getWallet(userId);
    if (wallet[currency] < amount) {
      throw new Error(`Insufficient ${currency}. Required: ${amount}, Available: ${wallet[currency]}`);
    }
    wallet[currency] -= amount;
    DataStore.wallets.set(userId, wallet);

    const txList = DataStore.transactions.get(userId) || [];
    txList.push({
      id: `tx_${Date.now()}_${Math.random()}`,
      userId,
      currency,
      amount: -amount,
      type: reason,
      balanceAfter: wallet[currency],
      createdAt: new Date().toISOString(),
    });
    DataStore.transactions.set(userId, txList);

    return { ...wallet };
  }

  public static purchaseItem(userId: string, itemId: string): { success: boolean; item: ShopItem; wallet: DBWallet } {
    const catalog = [...DICE_CATALOG, ...BOARD_SKINS];
    const item = catalog.find((i) => i.id === itemId);
    if (!item) throw new Error(`Shop item '${itemId}' does not exist.`);

    const inventory = DataStore.userInventory.get(userId) || new Set();
    if (inventory.has(itemId)) {
      throw new Error('You already own this item.');
    }

    const updatedWallet = this.debit(userId, item.currency, item.cost, `purchase_${item.id}`);
    inventory.add(itemId);
    DataStore.userInventory.set(userId, inventory);

    return { success: true, item, wallet: updatedWallet };
  }

  public static equipItem(userId: string, type: CosmeticType, itemId: string): UserProfile {
    const inventory = DataStore.userInventory.get(userId) || new Set();
    if (!inventory.has(itemId) && itemId !== 'dice_classic_gold' && itemId !== 'board_royal_navy') {
      throw new Error('You do not own this item.');
    }

    const profile = DataStore.profiles.get(userId);
    if (!profile) throw new Error('Profile not found.');

    if (type === 'dice') profile.equipped.diceSkin = itemId;
    if (type === 'board') profile.equipped.boardSkin = itemId;
    if (type === 'token') profile.equipped.tokenSkin = itemId;
    if (type === 'frame') profile.avatarFrame = itemId;

    DataStore.profiles.set(userId, profile);
    return { ...profile };
  }

  public static claimDailyReward(userId: string): { day: number; gold: number; gems: number; wallet: DBWallet } {
    const now = Date.now();
    const lastClaim = DataStore.claimedDailyRewards.get(userId) || 0;
    const cooldownMs = 24 * 60 * 60 * 1000;

    const claimDay = 1 + ((Math.floor((now - lastClaim) / cooldownMs)) % 7);
    const rewardConfig = DAILY_REWARD_CALENDAR[claimDay - 1] || DAILY_REWARD_CALENDAR[0];

    DataStore.claimedDailyRewards.set(userId, now);
    let wallet = this.credit(userId, 'gold', rewardConfig.gold, 'daily_reward_gold');
    if (rewardConfig.gems > 0) {
      wallet = this.credit(userId, 'gems', rewardConfig.gems, 'daily_reward_gems');
    }

    return {
      day: claimDay,
      gold: rewardConfig.gold,
      gems: rewardConfig.gems,
      wallet,
    };
  }
}
