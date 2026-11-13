# Royal Ludo - Complete Testing Strategy & Verification Plan

## 1. Engine & Rules Unit Tests (Target: 100% Rules Coverage)
- **Path Calculation**:
  - Test clockwise perimeter progression (0 -> 51 -> 0).
  - Test exact entry into player home stretches (Red at 50, Green at 11, Yellow at 24, Blue at 37).
  - Test exact finishing requirement (token at position 5 needing 1 to finish; roll of 2 is invalid).
- **Safe Cells & Captures**:
  - Landing on opponent on regular cells -> opponent knocked out, returned to base, capture bonus extra turn awarded.
  - Landing on opponent on safe cells (star cells) -> co-existence without capture.
- **Entry Rules**:
  - Rolling 6 brings token from base to start cell.
  - Non-6 rolls when all tokens in base -> turn immediately passed.
- **Three-6 Rule**:
  - 1st roll 6 -> extra turn.
  - 2nd roll 6 -> extra turn.
  - 3rd roll 6 -> roll voided, turn passes without movement.
- **Win Conditions & Rankings**:
  - First player to bring 4 tokens home -> 1st place.
  - Game continues until all places resolved (in 4-player match).

## 2. Autonomous Bot AI Verification
- Test Easy bot (random valid moves).
- Test Medium bot (prioritizes captures and safe cells).
- Test Hard bot (calculates heuristic threat matrix and distance reduction).
- Run automated 100-match headless bot simulation to verify zero deadlocks.

## 3. Real-Time Multiplayer Integration Tests
- Socket connection, room creation, joining via 6-digit code.
- Turn synchronization, timer expiration handling (auto-pass or bot takeover).
- Reconnection verification: player disconnects and reconnects within 30s to resume identical board state.

## 4. UI & Performance Benchmarks
- 60 FPS SVG board rendering on lower-tier Android profiles.
- Zero memory leaks during multiple successive match lifecycles.
