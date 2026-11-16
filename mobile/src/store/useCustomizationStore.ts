import { create } from 'zustand';

export interface DiceSkin {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  priceGems?: number;
  unlocked: boolean;
  equipped: boolean;
  previewTheme: 'nova' | 'white' | 'gold';
}

export interface BoardSkin {
  id: string;
  name: string;
  priceGems?: number;
  unlocked: boolean;
  equipped: boolean;
}

interface CustomizationState {
  dice: DiceSkin[];
  boards: BoardSkin[];
  equipDie: (id: string) => void;
  equipBoard: (id: string) => void;
  unlockDie: (id: string) => boolean;
}

export const useCustomizationStore = create<CustomizationState>((set, get) => ({
  dice: [
    {
      id: 'd_nova',
      name: 'Midnight Nova',
      rarity: 'Epic',
      unlocked: true,
      equipped: true,
      previewTheme: 'nova',
    },
    {
      id: 'd_classic',
      name: 'Classic White',
      rarity: 'Common',
      unlocked: true,
      equipped: false,
      previewTheme: 'white',
    },
    {
      id: 'd_coral',
      name: 'Coral Glow',
      rarity: 'Rare',
      unlocked: true,
      equipped: false,
      previewTheme: 'nova',
    },
    {
      id: 'd_mint',
      name: 'Mint Breeze',
      rarity: 'Rare',
      unlocked: true,
      equipped: false,
      previewTheme: 'nova',
    },
    {
      id: 'd_gold',
      name: 'Golden Radiance',
      rarity: 'Legendary',
      priceGems: 250,
      unlocked: false,
      equipped: false,
      previewTheme: 'gold',
    },
    {
      id: 'd_blue',
      name: 'Blue Hour',
      rarity: 'Epic',
      unlocked: false,
      equipped: false,
      previewTheme: 'nova',
    },
  ],
  boards: [
    {
      id: 'b_classic',
      name: 'Nova classic',
      unlocked: true,
      equipped: true,
    },
    {
      id: 'b_afterhours',
      name: 'After hours',
      priceGems: 500,
      unlocked: false,
      equipped: false,
    },
    {
      id: 'b_candyclub',
      name: 'Candy club',
      unlocked: false,
      equipped: false,
    },
  ],
  equipDie: (id: string) => {
    set((state) => ({
      dice: state.dice.map((d) => ({
        ...d,
        equipped: d.id === id,
      })),
    }));
  },
  equipBoard: (id: string) => {
    set((state) => ({
      boards: state.boards.map((b) => ({
        ...b,
        equipped: b.id === id,
      })),
    }));
  },
  unlockDie: (id: string) => {
    set((state) => ({
      dice: state.dice.map((d) => (d.id === id ? { ...d, unlocked: true } : d)),
    }));
    return true;
  },
}));
