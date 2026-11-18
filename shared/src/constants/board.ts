import type { GridCoord, PlayerColor } from '../types/game';

/**
 * 52 Perimeter coordinates on the 15x15 Ludo board (index 0 to 51).
 * Clockwise order starting from RED starting cell at index 0.
 */
export const PERIMETER_COORDINATES: GridCoord[] = [
  // 0..4 (5 cells): Bottom arm left col going UP
  { row: 13, col: 6 }, // 0: RED START (Safe)
  { row: 12, col: 6 }, // 1
  { row: 11, col: 6 }, // 2
  { row: 10, col: 6 }, // 3
  { row: 9, col: 6 },  // 4
  // 5..10 (6 cells): Left arm bottom row going LEFT
  { row: 8, col: 5 },  // 5
  { row: 8, col: 4 },  // 6
  { row: 8, col: 3 },  // 7
  { row: 8, col: 2 },  // 8: RED STAR (Safe)
  { row: 8, col: 1 },  // 9
  { row: 8, col: 0 },  // 10
  // 11 (1 cell): Left arm tip
  { row: 7, col: 0 },  // 11: GREEN ENTRANCE TO HOME STRETCH
  // 12..17 (6 cells): Left arm top row going RIGHT
  { row: 6, col: 0 },  // 12
  { row: 6, col: 1 },  // 13: GREEN START (Safe)
  { row: 6, col: 2 },  // 14
  { row: 6, col: 3 },  // 15
  { row: 6, col: 4 },  // 16
  { row: 6, col: 5 },  // 17
  // 18..23 (6 cells): Top arm left col going UP
  { row: 5, col: 6 },  // 18
  { row: 4, col: 6 },  // 19
  { row: 3, col: 6 },  // 20
  { row: 2, col: 6 },  // 21: GREEN STAR (Safe)
  { row: 1, col: 6 },  // 22
  { row: 0, col: 6 },  // 23
  // 24 (1 cell): Top arm tip
  { row: 0, col: 7 },  // 24: YELLOW ENTRANCE TO HOME STRETCH
  // 25..30 (6 cells): Top arm right col going DOWN
  { row: 0, col: 8 },  // 25
  { row: 1, col: 8 },  // 26: YELLOW START (Safe)
  { row: 2, col: 8 },  // 27
  { row: 3, col: 8 },  // 28
  { row: 4, col: 8 },  // 29
  { row: 5, col: 8 },  // 30
  // 31..36 (6 cells): Right arm top row going RIGHT
  { row: 6, col: 9 },  // 31
  { row: 6, col: 10 }, // 32
  { row: 6, col: 11 }, // 33
  { row: 6, col: 12 }, // 34: YELLOW STAR (Safe)
  { row: 6, col: 13 }, // 35
  { row: 6, col: 14 }, // 36
  // 37 (1 cell): Right arm tip
  { row: 7, col: 14 }, // 37: BLUE ENTRANCE TO HOME STRETCH
  // 38..43 (6 cells): Right arm bottom row going LEFT
  { row: 8, col: 14 }, // 38
  { row: 8, col: 13 }, // 39: BLUE START (Safe)
  { row: 8, col: 12 }, // 40
  { row: 8, col: 11 }, // 41
  { row: 8, col: 10 }, // 42
  { row: 8, col: 9 },  // 43
  // 44..49 (6 cells): Bottom arm right col going DOWN
  { row: 9, col: 8 },  // 44
  { row: 10, col: 8 }, // 45
  { row: 11, col: 8 }, // 46
  { row: 12, col: 8 }, // 47: BLUE STAR (Safe)
  { row: 13, col: 8 }, // 48
  { row: 14, col: 8 }, // 49
  // 50 (1 cell): Bottom arm tip
  { row: 14, col: 7 }, // 50: RED ENTRANCE TO HOME STRETCH
  // 51 (1 cell): Bottom arm left col base
  { row: 14, col: 6 }, // 51
];

/**
 * 8 Traditional Safe Cells (4 Starts + 4 Stars)
 */
export const SAFE_PERIMETER_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

/**
 * 4 Arrow Shortcut Cells on the perimeter track & boost distance
 */
export const ARROW_SHORTCUT_INDICES = [4, 17, 30, 43];
export const ARROW_BOOST_STEPS = 7;

/**
 * Starting perimeter index for each color
 */
export const COLOR_START_INDEX: Record<PlayerColor, number> = {
  RED: 0,
  GREEN: 13,
  YELLOW: 26,
  BLUE: 39,
};

/**
 * The perimeter index right before entering the home stretch
 */
export const COLOR_HOME_ENTRY_INDEX: Record<PlayerColor, number> = {
  RED: 50,
  GREEN: 11,
  YELLOW: 24,
  BLUE: 37,
};

/**
 * 5 Home stretch cells for each color leading to the center
 */
export const COLOR_HOME_STRETCH_COORDINATES: Record<PlayerColor, GridCoord[]> = {
  RED: [
    { row: 13, col: 7 },
    { row: 12, col: 7 },
    { row: 11, col: 7 },
    { row: 10, col: 7 },
    { row: 9, col: 7 },
  ],
  GREEN: [
    { row: 7, col: 1 },
    { row: 7, col: 2 },
    { row: 7, col: 3 },
    { row: 7, col: 4 },
    { row: 7, col: 5 },
  ],
  YELLOW: [
    { row: 1, col: 7 },
    { row: 2, col: 7 },
    { row: 3, col: 7 },
    { row: 4, col: 7 },
    { row: 5, col: 7 },
  ],
  BLUE: [
    { row: 7, col: 13 },
    { row: 7, col: 12 },
    { row: 7, col: 11 },
    { row: 7, col: 10 },
    { row: 7, col: 9 },
  ],
};

/**
 * Center finish coordinate for each color (step 56)
 */
export const COLOR_FINISH_COORDINATES: Record<PlayerColor, GridCoord> = {
  RED: { row: 8, col: 7 },
  GREEN: { row: 7, col: 6 },
  YELLOW: { row: 6, col: 7 },
  BLUE: { row: 7, col: 8 },
};

/**
 * Base yard token slots (4 tokens per color)
 */
export const COLOR_BASE_SLOTS: Record<PlayerColor, GridCoord[]> = {
  RED: [
    { row: 10, col: 1 },
    { row: 10, col: 4 },
    { row: 13, col: 1 },
    { row: 13, col: 4 },
  ],
  GREEN: [
    { row: 1, col: 1 },
    { row: 1, col: 4 },
    { row: 4, col: 1 },
    { row: 4, col: 4 },
  ],
  YELLOW: [
    { row: 1, col: 10 },
    { row: 1, col: 13 },
    { row: 4, col: 10 },
    { row: 4, col: 13 },
  ],
  BLUE: [
    { row: 10, col: 10 },
    { row: 10, col: 13 },
    { row: 13, col: 10 },
    { row: 13, col: 13 },
  ],
};

/**
 * Color order in clockwise play
 */
export const COLOR_SEAT_ORDER: PlayerColor[] = ['RED', 'GREEN', 'YELLOW', 'BLUE'];
