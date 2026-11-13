import { DEFAULT_RULES } from '../constants/rules';
import type { GameRules } from '../types/game';

export class QuickRules {
  public static create(playerCount: 2 | 4 = 4): GameRules {
    return {
      ...DEFAULT_RULES.quick,
      playerCount,
      tokensToWin: 2,
      turnTimerSeconds: 10,
    };
  }
}
