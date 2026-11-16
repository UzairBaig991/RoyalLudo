import { create } from 'zustand';
import { DICE_CATALOG, BOARD_SKINS, INITIAL_WALLET } from '@royal-ludo/shared';
import type { ShopItem } from '@royal-ludo/shared';

interface EconomyState {
  gold: number;
  gems: number;
  ownedItems: string[];
  diceCatalog: ShopItem[];
  boardCatalog: ShopItem[];
  addGold: (amount: number) => void;
  addGems: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  spendGems: (amount: number) => boolean;
  debitGold: (amount: number) => boolean;
  debitGems: (amount: number) => boolean;
  creditGold: (amount: number) => void;
  creditGems: (amount: number) => void;
  purchaseItem: (item: ShopItem) => boolean;
}

export const useEconomyStore = create<EconomyState>((set, get) => ({
  gold: INITIAL_WALLET.gold,
  gems: INITIAL_WALLET.gems,
  ownedItems: ['dice_classic_gold', 'board_royal_navy'],
  diceCatalog: DICE_CATALOG,
  boardCatalog: BOARD_SKINS,

  addGold: (amount) => set((s) => ({ gold: s.gold + amount })),
  addGems: (amount) => set((s) => ({ gems: s.gems + amount })),
  creditGold: (amount) => set((s) => ({ gold: s.gold + amount })),
  creditGems: (amount) => set((s) => ({ gems: s.gems + amount })),

  spendGold: (amount) => {
    if (get().gold < amount) return false;
    set((s) => ({ gold: s.gold - amount }));
    return true;
  },

  spendGems: (amount) => {
    if (get().gems < amount) return false;
    set((s) => ({ gems: s.gems - amount }));
    return true;
  },

  debitGold: (amount) => get().spendGold(amount),
  debitGems: (amount) => get().spendGems(amount),

  purchaseItem: (item) => {
    const { gold, gems, ownedItems } = get();
    if (ownedItems.includes(item.id)) return false;

    if (item.currency === 'gold') {
      if (gold < item.cost) return false;
      set((s) => ({
        gold: s.gold - item.cost,
        ownedItems: [...s.ownedItems, item.id],
      }));
      return true;
    } else {
      if (gems < item.cost) return false;
      set((s) => ({
        gems: s.gems - item.cost,
        ownedItems: [...s.ownedItems, item.id],
      }));
      return true;
    }
  },
}));
