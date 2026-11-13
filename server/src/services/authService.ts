import { CONFIG } from '../config/env';
import { DataStore, type DBUser } from './store';
import type { AuthSession, UserProfile } from '../../../shared/src/types';
import { INITIAL_WALLET } from '../../../shared/src/constants/economy';

export class AuthService {
  public static signToken(userId: string): string {
    const payload = {
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const signature = Buffer.from(`${header}.${encodedPayload}.${CONFIG.jwtSecret}`).toString('base64url');
    return `${header}.${encodedPayload}.${signature}`;
  }

  public static verifyToken(token: string): { userId: string } | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
      const payload = JSON.parse(payloadJson);
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }
      return { userId: payload.userId };
    } catch {
      return null;
    }
  }

  public static guestLogin(preferredUsername?: string): AuthSession {
    const userId = `guest_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const username = preferredUsername?.trim() || `Player_${Math.floor(1000 + Math.random() * 9000)}`;

    const user: DBUser = {
      id: userId,
      provider: 'guest',
      isBanned: false,
      createdAt: new Date().toISOString(),
    };
    DataStore.users.set(userId, user);

    const profile: UserProfile = {
      id: userId,
      userId,
      username,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/png?seed=${username}`,
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
    DataStore.profiles.set(userId, profile);

    DataStore.wallets.set(userId, {
      userId,
      gold: INITIAL_WALLET.gold,
      gems: INITIAL_WALLET.gems,
    });

    DataStore.userInventory.set(userId, new Set(['dice_classic_gold', 'board_royal_navy']));

    const token = this.signToken(userId);
    return {
      token,
      user: { id: userId, provider: 'guest' },
      profile,
    };
  }

  public static register(email: string, passwordHash: string, username: string): AuthSession {
    for (const u of DataStore.users.values()) {
      if (u.email && u.email.toLowerCase() === email.toLowerCase()) {
        throw new Error('An account with this email already exists.');
      }
    }

    const userId = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const user: DBUser = {
      id: userId,
      email: email.toLowerCase(),
      passwordHash,
      provider: 'email',
      isBanned: false,
      createdAt: new Date().toISOString(),
    };
    DataStore.users.set(userId, user);

    const profile: UserProfile = {
      id: userId,
      userId,
      username,
      email: email.toLowerCase(),
      avatarUrl: `https://api.dicebear.com/7.x/bottts/png?seed=${username}`,
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
    DataStore.profiles.set(userId, profile);

    DataStore.wallets.set(userId, {
      userId,
      gold: INITIAL_WALLET.gold,
      gems: INITIAL_WALLET.gems,
    });

    DataStore.userInventory.set(userId, new Set(['dice_classic_gold', 'board_royal_navy']));

    const token = this.signToken(userId);
    return {
      token,
      user: { id: userId, email, provider: 'email' },
      profile,
    };
  }

  public static login(email: string, passwordHash: string): AuthSession {
    let matchedUser: DBUser | null = null;
    for (const u of DataStore.users.values()) {
      if (u.email && u.email.toLowerCase() === email.toLowerCase()) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser || matchedUser.passwordHash !== passwordHash) {
      throw new Error('Invalid email or password.');
    }

    if (matchedUser.isBanned) {
      throw new Error('This account has been suspended for violating terms.');
    }

    const profile = DataStore.profiles.get(matchedUser.id);
    if (!profile) throw new Error('Profile record not found.');

    const token = this.signToken(matchedUser.id);
    return {
      token,
      user: { id: matchedUser.id, email: matchedUser.email, provider: matchedUser.provider },
      profile,
    };
  }
}
