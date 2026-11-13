import { DEFAULT_RULES } from '../constants/rules';
import type { GameRules } from '../types/game';

export class MasterRules {
  public static create(playerCount: 2 | 4 = 4): GameRules {
    return {
      ...DEFAULT_RULES.master,
      playerCount,
      allowStacking: true,
      openOnOne: true,
      openOnSix: true,
    };
  }
}
