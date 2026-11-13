import { create } from 'zustand';
import type { UserProfile } from '../../../shared/src/types';

interface AuthState {
  token: string | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAsGuest: (preferredName?: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: 'mock_jwt_token_royal_ludo',
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

  logout: () => {
    set({
      token: null,
      profile: null,
      isAuthenticated: false,
    });
  },
}));
