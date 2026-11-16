import { create } from 'zustand';
import type { UserProfile } from '../../../shared/src/types';

export interface MatchHistoryItem {
  id: string;
  opponentName: string;
  mode: string;
  outcome: 'WIN' | 'LOSS';
  coinsDelta: number;
  tokensCaptured: number;
  date: string;
}

interface AuthState {
  token: string | null;
  profile: UserProfile | null;
  matchHistory: MatchHistoryItem[];
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAsGuest: (preferredName?: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  recordMatchResult: (item: Omit<MatchHistoryItem, 'id' | 'date'>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: 'mock_jwt_token_royal_ludo',
  matchHistory: [
    {
      id: 'm_1',
      opponentName: 'Sophia · Queen',
      mode: 'Classic Table',
      outcome: 'WIN',
      coinsDelta: 2000,
      tokensCaptured: 4,
      date: 'Today, 11:42 AM',
    },
    {
      id: 'm_2',
      opponentName: 'Alex The Great',
      mode: 'Quick Mode',
      outcome: 'WIN',
      coinsDelta: 1000,
      tokensCaptured: 2,
      date: 'Yesterday, 8:15 PM',
    },
    {
      id: 'm_3',
      opponentName: 'Marcus Emperor',
      mode: 'Team Up 2v2',
      outcome: 'LOSS',
      coinsDelta: -1000,
      tokensCaptured: 1,
      date: 'Nov 14, 4:20 PM',
    },
    {
      id: 'm_4',
      opponentName: 'Maya · Nova',
      mode: 'Master Table',
      outcome: 'WIN',
      coinsDelta: 4000,
      tokensCaptured: 5,
      date: 'Nov 13, 9:05 PM',
    },
  ],
  profile: {
    id: 'usr_player_1',
    userId: 'usr_player_1',
    username: 'RoyalChampion',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/png?seed=RoyalChampion',
    avatarFrame: 'frame_royal_gold',
    level: 7,
    xp: 2450,
    xpForNextLevel: 3000,
    stats: {
      matchesPlayed: 32,
      matchesWon: 21,
      winStreak: 4,
      highestWinStreak: 6,
      tokensCaptured: 84,
      tokensFinished: 76,
      winPercentage: 65.6,
    },
    equipped: {
      diceSkin: 'dice_classic_gold',
      boardSkin: 'board_royal_navy',
      tokenSkin: 'token_crystal',
      victoryEffect: 'effect_gold_confetti',
    },
    leagueTier: 'Gold',
    leaguePoints: 3450,
    clubName: 'Imperial Knights',
    createdAt: new Date().toISOString(),
  },
  isAuthenticated: true,
  isLoading: false,

  loginAsGuest: (preferredName = 'RoyalPlayer') => {
    const id = `guest_${Date.now()}`;
    const newProfile: UserProfile = {
      id,
      userId: id,
      username: preferredName,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/png?seed=${preferredName}`,
      avatarFrame: 'frame_royal_gold',
      level: 1,
      xp: 0,
      xpForNextLevel: 1000,
      stats: {
        matchesPlayed: 0,
        matchesWon: 0,
        winStreak: 0,
        highestWinStreak: 0,
        tokensCaptured: 0,
        tokensFinished: 0,
        winPercentage: 0,
      },
      equipped: {
        diceSkin: 'dice_classic_gold',
        boardSkin: 'board_royal_navy',
        tokenSkin: 'token_crystal',
        victoryEffect: 'effect_gold_confetti',
      },
      leagueTier: 'Bronze',
      leaguePoints: 0,
      createdAt: new Date().toISOString(),
    };

    set({
      token: `token_${Date.now()}`,
      profile: newProfile,
      isAuthenticated: true,
    });
  },

  updateProfile: (updates) => {
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    }));
  },

  recordMatchResult: (item) => {
    const newRecord: MatchHistoryItem = {
      ...item,
      id: `match_${Date.now()}`,
      date: 'Just now',
    };

    set((state) => {
      const currentStats = state.profile?.stats || {
        matchesPlayed: 0,
        matchesWon: 0,
        winStreak: 0,
        highestWinStreak: 0,
        tokensCaptured: 0,
        tokensFinished: 0,
        winPercentage: 0,
      };

      const matchesPlayed = currentStats.matchesPlayed + 1;
      const matchesWon = currentStats.matchesWon + (item.outcome === 'WIN' ? 1 : 0);
      const winStreak = item.outcome === 'WIN' ? currentStats.winStreak + 1 : 0;
      const highestWinStreak = Math.max(currentStats.highestWinStreak, winStreak);
      const tokensCaptured = currentStats.tokensCaptured + item.tokensCaptured;
      const winPercentage = parseFloat(((matchesWon / matchesPlayed) * 100).toFixed(1));

      return {
        matchHistory: [newRecord, ...state.matchHistory].slice(0, 20),
        profile: state.profile
          ? {
              ...state.profile,
              stats: {
                ...currentStats,
                matchesPlayed,
                matchesWon,
                winStreak,
                highestWinStreak,
                tokensCaptured,
                winPercentage,
              },
            }
          : null,
      };
    });
  },

  logout: () => {
    set({
      token: null,
      profile: null,
      isAuthenticated: false,
    });
  },
}));
