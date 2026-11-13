import { DEFAULT_RULES } from '../constants/rules';
import type { GameRules } from '../types/game';

export class ArrowRules {
  public static create(playerCount: 2 | 4 = 4): GameRules {
    return {
      ...DEFAULT_RULES.arrow,
      playerCount,
      allowShortcuts: true,
    };
  }
}
