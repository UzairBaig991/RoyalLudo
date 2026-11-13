export interface UserProfile {
  id: string;
  userId: string;
  username: string;
  email?: string;
  avatarUrl: string;
  avatarFrame: string;
  level: number;
  xp: number;
  xpForNextLevel: number;
  stats: {
    matchesPlayed: number;
    matchesWon: number;
    winStreak: number;
    highestWinStreak: number;
    tokensCaptured: number;
    tokensFinished: number;
    winPercentage: number;
  };
  equipped: {
    diceSkin: string;
    boardSkin: string;
    tokenSkin: string;
    victoryEffect: string;
  };
  leagueTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Royal';
  leaguePoints: number;
  clubId?: string;
  clubName?: string;
  clubRole?: 'owner' | 'admin' | 'member';
  createdAt: string;
}

export interface AuthSession {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email?: string;
    provider: 'email' | 'google' | 'guest';
  };
  profile: UserProfile;
}
