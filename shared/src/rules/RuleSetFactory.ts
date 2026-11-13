import { DEFAULT_RULES } from '../constants/rules';
import type { GameMode, GameRules } from '../types/game';
import { ArrowRules } from './ArrowRules';
import { ClassicRules } from './ClassicRules';
import { MasterRules } from './MasterRules';
import { QuickRules } from './QuickRules';

export class RuleSetFactory {
  public static getRules(mode: GameMode, playerCount: 2 | 4 = 4, customOverrides?: Partial<GameRules>): GameRules {
    let baseRules: GameRules;
    switch (mode) {
      case 'master':
        baseRules = MasterRules.create(playerCount);
        break;
      case 'quick':
        baseRules = QuickRules.create(playerCount);
        break;
      case 'arrow':
        baseRules = ArrowRules.create(playerCount);
        break;
      case 'custom':
        baseRules = { ...DEFAULT_RULES.custom, playerCount, ...customOverrides };
        break;
      case 'classic':
      default:
        baseRules = ClassicRules.create(playerCount);
        break;
    }

    return {
      ...baseRules,
      ...customOverrides,
    };
  }
}
