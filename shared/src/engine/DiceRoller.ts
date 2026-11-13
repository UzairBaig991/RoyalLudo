export class DiceRoller {
  /**
   * Authoritative random dice roll between 1 and 6.
   * Can accept an optional custom RNG function for deterministic testing.
   */
  public static roll(rng: () => number = Math.random): number {
    return Math.floor(rng() * 6) + 1;
  }

  /**
   * Determine if rolling a 6 qualifies for an extra turn or forfeits turn (if 3 consecutive 6s)
   */
  public static evaluateConsecutiveSixes(currentCount: number, diceValue: number, ruleEnabled = true): {
    newCount: number;
    forfeited: boolean;
  } {
    if (diceValue !== 6) {
      return { newCount: 0, forfeited: false };
    }

    const newCount = currentCount + 1;
    if (ruleEnabled && newCount >= 3) {
      return { newCount: 0, forfeited: true };
    }

    return { newCount, forfeited: false };
  }
}
