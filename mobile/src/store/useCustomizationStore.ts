import { create } from 'zustand';
import type { NovaDieTheme } from '../components/nova/NovaDie';

export interface DiceSkin {
  id: string;
  name: string;
  description?: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  priceGems?: number;
  priceCoins?: number;
  unlocked: boolean;
  equipped: boolean;
  previewTheme: NovaDieTheme;
}

export interface BoardSkin {
  id: string;
  name: string;
  description?: string;
  priceGems?: number;
  priceCoins?: number;
  unlocked: boolean;
  equipped: boolean;
  boardBg?: string;
  cellBg?: string;
  borderColor?: string;
}

interface CustomizationState {
  dice: DiceSkin[];
  boards: BoardSkin[];
  equipDie: (id: string) => void;
  equipBoard: (id: string) => void;
  unlockDie: (id: string) => boolean;
  unlockBoard: (id: string) => boolean;
  getEquippedDie: () => DiceSkin;
  getEquippedBoard: () => BoardSkin;
}

export const useCustomizationStore = create<CustomizationState>((set, get) => ({
  dice: [
    {
      id: 'd_nova',
      name: 'Midnight Nova',
      description: 'Cosmic purple casing with glowing starlight pips.',
      rarity: 'Epic',
      unlocked: true,
      equipped: true,
      previewTheme: 'nova',
    },
    {
      id: 'd_classic',
      name: 'Classic White',
      description: 'Traditional ivory bone die with crimson ace pip.',
      rarity: 'Common',
      unlocked: true,
      equipped: false,
      previewTheme: 'white',
    },
    {
      id: 'd_coral',
      name: 'Coral Glow',
      description: 'Warm sunset coral finish with pearl pips.',
      rarity: 'Rare',
      unlocked: true,
      equipped: false,
      previewTheme: 'coral',
    },
    {
      id: 'd_mint',
      name: 'Mint Breeze',
      description: 'Cool refreshing mint finish with obsidian pips.',
      rarity: 'Rare',
      unlocked: true,
      equipped: false,
      previewTheme: 'mint',
    },
    {
      id: 'd_gold',
      name: 'Golden Radiance',
      description: '24K solid royal gold with ruby center ace.',
      rarity: 'Legendary',
      priceGems: 25,
      priceCoins: 2500,
      unlocked: true,
      equipped: false,
      previewTheme: 'gold',
    },
    {
      id: 'd_blue',
      name: 'Sapphire Frost',
      description: 'Deep glacial sapphire crystal with icy cyan pips.',
      rarity: 'Epic',
      priceGems: 20,
      priceCoins: 2000,
      unlocked: true,
      equipped: false,
      previewTheme: 'sapphire',
    },
    {
      id: 'd_ruby',
      name: 'Ruby Emperor',
      description: 'Imperial crimson gemstone with golden crown pips.',
      rarity: 'Legendary',
      priceGems: 35,
      priceCoins: 3500,
      unlocked: false,
      equipped: false,
      previewTheme: 'ruby',
    },
    {
      id: 'd_emerald',
      name: 'Emerald Viper',
      description: 'Polished royal jade blessed with golden pips.',
      rarity: 'Epic',
      priceGems: 30,
      priceCoins: 3000,
      unlocked: false,
      equipped: false,
      previewTheme: 'emerald',
    },
    {
      id: 'd_cyber',
      name: 'Cyber Neon',
      description: 'Futuristic carbon grid with high-voltage neon pips.',
      rarity: 'Epic',
      priceGems: 40,
      priceCoins: 4000,
      unlocked: false,
      equipped: false,
      previewTheme: 'cyber',
    },
    {
      id: 'd_obsidian',
      name: 'Obsidian Shadow',
      description: 'Dark volcanic glass with electric violet energy.',
      rarity: 'Legendary',
      priceGems: 50,
      priceCoins: 5000,
      unlocked: false,
      equipped: false,
      previewTheme: 'obsidian',
    },
    {
      id: 'd_dragon',
      name: 'Dragon Flame',
      description: 'Molten volcanic drake scales roaring with fire.',
      rarity: 'Legendary',
      priceGems: 60,
      priceCoins: 6000,
      unlocked: false,
      equipped: false,
      previewTheme: 'dragon',
    },
    {
      id: 'd_galaxy',
      name: 'Galaxy Void',
      description: 'Swirling deep-space nebula with astral pips.',
      rarity: 'Legendary',
      priceGems: 75,
      priceCoins: 7500,
      unlocked: false,
      equipped: false,
      previewTheme: 'galaxy',
    },
  ],
  boards: [
    {
      id: 'b_classic',
      name: 'Nova classic',
      description: 'Deep midnight navy with royal gold filigree.',
      unlocked: true,
      equipped: true,
      boardBg: '#101827',
      cellBg: '#1E293B',
      borderColor: '#D6AE62',
    },
    {
      id: 'b_afterhours',
      name: 'After hours',
      description: 'Velvet amethyst lounge with neon purple trim.',
      priceGems: 30,
      priceCoins: 3000,
      unlocked: true,
      equipped: false,
      boardBg: '#1a0b2e',
      cellBg: '#2d144d',
      borderColor: '#b9a2ff',
    },
    {
      id: 'b_candyclub',
      name: 'Candy club',
      description: 'Playful cyber-mint & coral arcade arena.',
      priceGems: 40,
      priceCoins: 4000,
      unlocked: true,
      equipped: false,
      boardBg: '#071e22',
      cellBg: '#113a40',
      borderColor: '#83e6c0',
    },
    {
      id: 'b_emerald',
      name: 'Royal Jade Palace',
      description: 'Imperial emerald felt table with 24K gold borders.',
      priceGems: 50,
      priceCoins: 5000,
      unlocked: false,
      equipped: false,
      boardBg: '#062817',
      cellBg: '#0f3822',
      borderColor: '#ffd37b',
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
  unlockBoard: (id: string) => {
    set((state) => ({
      boards: state.boards.map((b) => (b.id === id ? { ...b, unlocked: true } : b)),
    }));
    return true;
  },
  getEquippedDie: () => {
    const state = get();
    return state.dice.find((d) => d.equipped) || state.dice[0];
  },
  getEquippedBoard: () => {
    const state = get();
    return state.boards.find((b) => b.equipped) || state.boards[0];
  },
}));
