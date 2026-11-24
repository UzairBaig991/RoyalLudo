import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface MatchHistoryRecord {
  id: string;
  mode: string;
  playerCount: number;
  result: 'WIN' | 'LOSS';
  coinsDelta: number;
  captures: number;
  playedAt: string;
}

export interface PersistedPlayerRecord {
  playerId: string;
  name: string;
  avatar: string;
  flag: string;
  gold: number;
  gems: number;
  xp: number;
  level: number;
  wins: number;
  losses: number;
  matchesPlayed: number;
  captures: number;
  streak: number;
  equippedDice: string;
  unlockedDice: string[];
  equippedPawn: string;
  unlockedPawns: string[];
  matchHistory: MatchHistoryRecord[];
  updatedAt: string;
}

interface DatabaseSchema {
  players: Record<string, PersistedPlayerRecord>;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_FILE_PATH = join(__dirname, '..', '..', 'data', 'royal-ludo-db.json');

export class DatabaseService {
  private static cache: DatabaseSchema | null = null;

  private static loadDb(): DatabaseSchema {
    if (this.cache) return this.cache;
    try {
      if (existsSync(DB_FILE_PATH)) {
        const raw = readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.players) {
          this.cache = parsed as DatabaseSchema;
          return this.cache;
        }
      }
    } catch (err) {
      console.warn('[DatabaseService] Failed reading DB file, initializing fresh DB:', err);
    }
    this.cache = { players: {} };
    this.saveDb();
    return this.cache;
  }

  private static saveDb(): void {
    try {
      const dir = dirname(DB_FILE_PATH);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(DB_FILE_PATH, JSON.stringify(this.cache || { players: {} }, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[DatabaseService] Unable to persist DB file:', err);
    }
  }

  public static createFreshPlayer(playerId: string, name = 'Player'): PersistedPlayerRecord {
    return {
      playerId,
      name,
      avatar: '😎',
      flag: '🇵🇰',
      gold: 0,
      gems: 0,
      xp: 0,
      level: 1,
      wins: 0,
      losses: 0,
      matchesPlayed: 0,
      captures: 0,
      streak: 0,
      equippedDice: 'classic',
      unlockedDice: ['classic'],
      equippedPawn: 'crown',
      unlockedPawns: ['crown'],
      matchHistory: [],
      updatedAt: new Date().toISOString(),
    };
  }

  public static getOrCreatePlayer(playerId: string): PersistedPlayerRecord {
    const db = this.loadDb();
    const safeId = (playerId || 'default_player').trim().slice(0, 64);
    if (!db.players[safeId]) {
      db.players[safeId] = this.createFreshPlayer(safeId);
      this.saveDb();
    }
    return db.players[safeId];
  }

  public static updatePlayer(
    playerId: string,
    patch: Partial<PersistedPlayerRecord>
  ): PersistedPlayerRecord {
    const db = this.loadDb();
    const current = this.getOrCreatePlayer(playerId);
    const updated: PersistedPlayerRecord = {
      ...current,
      name: typeof patch.name === 'string' && patch.name.trim() ? patch.name.trim().slice(0, 24) : current.name,
      avatar: typeof patch.avatar === 'string' ? patch.avatar : current.avatar,
      flag: typeof patch.flag === 'string' ? patch.flag : current.flag,
      gold: typeof patch.gold === 'number' && Number.isFinite(patch.gold) ? Math.max(0, Math.floor(patch.gold)) : current.gold,
      gems: typeof patch.gems === 'number' && Number.isFinite(patch.gems) ? Math.max(0, Math.floor(patch.gems)) : current.gems,
      xp: typeof patch.xp === 'number' && Number.isFinite(patch.xp) ? Math.max(0, Math.floor(patch.xp)) : current.xp,
      level: typeof patch.level === 'number' && Number.isFinite(patch.level) ? Math.max(1, Math.floor(patch.level)) : current.level,
      wins: typeof patch.wins === 'number' && Number.isFinite(patch.wins) ? Math.max(0, Math.floor(patch.wins)) : current.wins,
      losses: typeof patch.losses === 'number' && Number.isFinite(patch.losses) ? Math.max(0, Math.floor(patch.losses)) : current.losses,
      matchesPlayed: typeof patch.matchesPlayed === 'number' && Number.isFinite(patch.matchesPlayed) ? Math.max(0, Math.floor(patch.matchesPlayed)) : current.matchesPlayed,
      captures: typeof patch.captures === 'number' && Number.isFinite(patch.captures) ? Math.max(0, Math.floor(patch.captures)) : current.captures,
      streak: typeof patch.streak === 'number' && Number.isFinite(patch.streak) ? Math.max(0, Math.floor(patch.streak)) : current.streak,
      equippedDice: typeof patch.equippedDice === 'string' ? patch.equippedDice : current.equippedDice,
      unlockedDice: Array.isArray(patch.unlockedDice) ? patch.unlockedDice : current.unlockedDice,
      equippedPawn: typeof patch.equippedPawn === 'string' ? patch.equippedPawn : current.equippedPawn,
      unlockedPawns: Array.isArray(patch.unlockedPawns) ? patch.unlockedPawns : current.unlockedPawns,
      updatedAt: new Date().toISOString(),
    };
    db.players[current.playerId] = updated;
    this.saveDb();
    return updated;
  }

  public static appendMatchHistory(
    playerId: string,
    record: Omit<MatchHistoryRecord, 'id' | 'playedAt'>
  ): PersistedPlayerRecord {
    const db = this.loadDb();
    const player = this.getOrCreatePlayer(playerId);
    const entry: MatchHistoryRecord = {
      id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      mode: record.mode || 'CLASSIC',
      playerCount: record.playerCount || 2,
      result: record.result === 'WIN' ? 'WIN' : 'LOSS',
      coinsDelta: Math.floor(record.coinsDelta || 0),
      captures: Math.max(0, Math.floor(record.captures || 0)),
      playedAt: new Date().toISOString(),
    };

    player.matchHistory = [entry, ...player.matchHistory].slice(0, 50);
    player.matchesPlayed += 1;
    player.captures += entry.captures;
    if (entry.result === 'WIN') {
      player.wins += 1;
      player.streak += 1;
      player.gold = Math.max(0, player.gold + Math.max(0, entry.coinsDelta));
      player.xp += 100;
    } else {
      player.losses += 1;
      player.streak = 0;
      player.xp += 25;
    }
    player.level = Math.max(1, 1 + Math.floor(player.xp / 500));
    player.updatedAt = new Date().toISOString();

    db.players[player.playerId] = player;
    this.saveDb();
    return player;
  }
}
