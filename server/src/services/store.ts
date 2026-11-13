import type { GameRules, RoomDetails, UserProfile } from '../../../shared/src/types';
import { INITIAL_WALLET } from '../../../shared/src/constants/economy';

export interface DBUser {
  id: string;
  email?: string;
  passwordHash?: string;
  provider: 'email' | 'google' | 'guest';
  isBanned: boolean;
  createdAt: string;
}

export interface DBWallet {
  userId: string;
  gold: number;
  gems: number;
}

export interface DBTransaction {
  id: string;
  userId: string;
  currency: 'gold' | 'gems';
  amount: number;
  type: string;
  balanceAfter: number;
  createdAt: string;
}

export interface DBFriendRecord {
  id: string;
  userId: string;
  friendId: string;
  createdAt: string;
}

export interface DBFriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

/**
 * Enterprise In-Memory & Database Data Repository
 */
export class DataStore {
  public static users = new Map<string, DBUser>();
  public static profiles = new Map<string, UserProfile>();
  public static wallets = new Map<string, DBWallet>();
  public static transactions = new Map<string, DBTransaction[]>();
  public static userInventory = new Map<string, Set<string>>();
  public static rooms = new Map<string, RoomDetails>();
  public static roomCodes = new Map<string, string>(); // code -> roomId
  public static friends = new Map<string, Set<string>>(); // userId -> Set of friendUserIds
  public static friendRequests = new Map<string, DBFriendRequest>();
  public static onlineSockets = new Map<string, string>(); // userId -> socketId
  public static socketToUser = new Map<string, string>(); // socketId -> userId
  public static claimedDailyRewards = new Map<string, number>(); // userId -> lastClaimTimestamp

  public static initializeSeed(): void {
    if (this.users.size > 0) return;

    // Seed royal sample bots/players
    const seedProfiles: Partial<UserProfile>[] = [
      { id: 'usr_royal_alex', username: 'AlexTheKing', level: 12, xp: 4800 },
      { id: 'usr_royal_sophia', username: 'QueenSophia', level: 18, xp: 8200 },
      { id: 'usr_royal_marcus', username: 'MarcusEmperor', level: 9, xp: 2300 },
      { id: 'usr_royal_elena', username: 'PrincessElena', level: 15, xp: 6400 },
    ];

    for (const p of seedProfiles) {
      const id = p.id!;
      this.users.set(id, {
        id,
        provider: 'guest',
        isBanned: false,
        createdAt: new Date().toISOString(),
      });

      this.profiles.set(id, {
        id,
        userId: id,
        username: p.username!,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/png?seed=${p.username}`,
        avatarFrame: 'frame_royal_gold',
        level: p.level || 1,
        xp: p.xp || 100,
        xpForNextLevel: (p.level || 1) * 1000,
        stats: {
          matchesPlayed: 45,
          matchesWon: 28,
          winStreak: 3,
          highestWinStreak: 7,
          tokensCaptured: 112,
          tokensFinished: 98,
          winPercentage: 62.2,
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
      });

      this.wallets.set(id, {
        userId: id,
        gold: 25000,
        gems: 150,
      });

      this.userInventory.set(id, new Set(['dice_classic_gold', 'board_royal_navy']));
    }
  }
}

DataStore.initializeSeed();
