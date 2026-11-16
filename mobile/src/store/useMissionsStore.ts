import { create } from 'zustand';

export interface MissionItem {
  id: string;
  title: string;
  progress: number;
  total: number;
  rewardType: 'coins' | 'xp';
  rewardAmount: number;
  claimed: boolean;
}

interface MissionsState {
  streakDay: number;
  streakClaimedToday: boolean;
  luckyRollAvailable: boolean;
  missions: MissionItem[];
  seasonPassTier: number;
  seasonPassXp: number;
  claimDailyStreak: () => number;
  claimMission: (id: string) => { type: 'coins' | 'xp'; amount: number };
  performLuckyRoll: () => number;
}

export const useMissionsStore = create<MissionsState>((set, get) => ({
  streakDay: 5,
  streakClaimedToday: false,
  luckyRollAvailable: true,
  seasonPassTier: 7,
  seasonPassXp: 350,
  missions: [
    {
      id: 'm1',
      title: 'Play 2 classic games',
      progress: 2,
      total: 2,
      rewardType: 'xp',
      rewardAmount: 100,
      claimed: false,
    },
    {
      id: 'm2',
      title: 'Send a friend a gift',
      progress: 1,
      total: 1,
      rewardType: 'coins',
      rewardAmount: 50,
      claimed: false,
    },
    {
      id: 'm3',
      title: 'Win a team game',
      progress: 0,
      total: 1,
      rewardType: 'xp',
      rewardAmount: 150,
      claimed: false,
    },
    {
      id: 'm4',
      title: 'Bring 8 tokens home',
      progress: 5,
      total: 8,
      rewardType: 'coins',
      rewardAmount: 200,
      claimed: false,
    },
  ],
  claimDailyStreak: () => {
    if (get().streakClaimedToday) return 0;
    const coins = 500;
    set({ streakClaimedToday: true });
    return coins;
  },
  claimMission: (id: string) => {
    let result = { type: 'coins' as 'coins' | 'xp', amount: 0 };
    set((state) => ({
      missions: state.missions.map((m) => {
        if (m.id === id && !m.claimed && m.progress >= m.total) {
          result = { type: m.rewardType, amount: m.rewardAmount };
          return { ...m, claimed: true };
        }
        return m;
      }),
    }));
    return result;
  },
  performLuckyRoll: () => {
    const rewards = [100, 25, 500, 10, 200, 50];
    const won = rewards[Math.floor(Math.random() * rewards.length)];
    set({ luckyRollAvailable: false });
    return won;
  },
}));
