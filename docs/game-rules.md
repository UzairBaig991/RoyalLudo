# Royal Ludo - Complete Game Rules Specification

## 1. Board Layout & Coordinate System
- Standard 15x15 logical matrix with four player bases:
  - **Red**: Bottom-Left (Starting cell: index 0 / position 1 on perimeter)
  - **Green**: Top-Left (Starting cell: index 13 / position 14 on perimeter)
  - **Yellow**: Top-Right (Starting cell: index 26 / position 27 on perimeter)
  - **Blue**: Bottom-Right (Starting cell: index 39 / position 40 on perimeter)
- **52 Perimeter Common Cells** (indexed 0 to 51 clockwise).
- **8 Designated Safe Cells**:
  - Cell 0 (Red Start, Safe)
  - Cell 8 (Red Star Safe)
  - Cell 13 (Green Start, Safe)
  - Cell 21 (Green Star Safe)
  - Cell 26 (Yellow Start, Safe)
  - Cell 34 (Yellow Star Safe)
  - Cell 39 (Blue Start, Safe)
  - Cell 47 (Blue Star Safe)
- **Home Stretch Paths**:
  - Each color has a 5-step private path leading to the center Finish triangle (step 6).
  - Red entrance: after Cell 50 -> enters Red Home Column 0-5.
  - Green entrance: after Cell 11 -> enters Green Home Column 0-5.
  - Yellow entrance: after Cell 24 -> enters Yellow Home Column 0-5.
  - Blue entrance: after Cell 37 -> enters Blue Home Column 0-5.

## 2. Core Mechanics
1. **Token Entry**:
   - Rolling a **6** is required to bring a token out of the yard onto the starting cell.
   - If starting cell has an opponent token, it is captured unless rules prohibit it.
2. **Movement & Exact Finish**:
   - A token advances clockwise along the perimeter path by the exact dice value.
   - To enter the finish triangle, an exact dice roll matching the remaining distance is required. If roll > distance, the move is invalid (no overshooting).
3. **Capture**:
   - Landing on a non-safe cell occupied by an opponent's token sends that token back to its yard.
   - Safe cells (stars and colored starts) prevent capture; multiple tokens of different colors can safely co-exist.
4. **Extra Turn Rewards**:
   - Rolling a **6**.
   - Capturing an opponent token.
   - Landing a token into the finish triangle.
5. **Three Consecutive 6s Penalty**:
   - If a player rolls 6 three times in a row, the third roll is voided, and the turn automatically passes to the next player.

## 3. Game Variations
- **Classic**: Traditional 4-token race with standard safe cells and exact finish.
- **Master**:
  - **Token Stacking**: Two tokens of the same color on the same cell create a blockade that opponents cannot leap over.
  - **Magic 1/6 Entry**: Allows opening on 1 or 6 if configured.
- **Quick**:
  - Only **2 tokens** need to reach home for victory.
  - Fast-forward starting positions (1 token already in play).
- **Arrow**:
  - Special shortcut arrows on specific intersections allowing tokens to skip quadrants if landed on exactly.
- **Team Up (2v2)**:
  - Red + Yellow vs Green + Blue.
  - Teammates cannot capture each other. If all 4 of a player's tokens finish, they assist their partner by rolling dice for their partner's tokens!
