import { ROYAL_COLORS, COLOR_MAP } from '../src/theme/colors';
import { useAuthStore } from '../src/store/useAuthStore';
import { useEconomyStore } from '../src/store/useEconomyStore';
import { useGameStore } from '../src/store/useGameStore';
import { LudoBoard } from '../../shared/src/engine/LudoBoard';

let passed = 0;
let failed = 0;

function assert(cond: boolean, msg: string) {
  if (cond) {
    passed++;
    console.log(`  ✓ PASS: ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${msg}`);
  }
}

function runMobileTests() {
  console.log('====================================================');
  console.log('ROYAL LUDO – MOBILE CLIENT LOGIC & STORE TEST SUITE');
  console.log('====================================================\n');

  // TEST 1: Theme Consistency
  console.log('Test Suite 1: Theme & Palette Integrity');
  assert(ROYAL_COLORS.primaryBg === '#101827', 'Primary background matches #101827');
  assert(ROYAL_COLORS.gold === '#D6AE62', 'Royal Gold matches #D6AE62');
  assert(COLOR_MAP.RED.primary === '#E74C4C', 'Traditional Red matches #E74C4C');
  assert(COLOR_MAP.GREEN.primary === '#27AE70', 'Traditional Green matches #27AE70');
  assert(COLOR_MAP.YELLOW.primary === '#F2C94C', 'Traditional Yellow matches #F2C94C');
  assert(COLOR_MAP.BLUE.primary === '#3986D9', 'Traditional Blue matches #3986D9');

  // TEST 2: Auth Store
  console.log('\nTest Suite 2: Client Auth Store');
  const auth = useAuthStore.getState();
  assert(auth.profile !== null, 'Initial profile exists');
  assert(auth.isAuthenticated === true, 'Authenticated by default');

  auth.loginAsGuest('SirArthur');
  assert(useAuthStore.getState().profile?.username === 'SirArthur', 'Guest login sets username');

  auth.updateProfile({ username: 'KingArthur' });
  assert(useAuthStore.getState().profile?.username === 'KingArthur', 'Profile update reflects in store');

  // TEST 3: Economy Store
  console.log('\nTest Suite 3: Client Economy Store');
  const econ = useEconomyStore.getState();
  const initialGold = econ.gold;
  econ.addGold(1000);
  assert(useEconomyStore.getState().gold === initialGold + 1000, 'Adding gold updates balance');

  const canSpend = econ.spendGold(500);
  assert(canSpend === true, 'Spending within balance succeeds');

  const overspend = econ.spendGold(9999999);
  assert(overspend === false, 'Overspending safely prevented');

  // TEST 4: Game Store Lifecycle
  console.log('\nTest Suite 4: Client Game Store Lifecycle');
  const gameStore = useGameStore.getState();
  gameStore.startNewGame({
    mode: 'classic',
    playerCount: 4,
    players: [
      { id: 'p1', username: 'Player 1', isBot: false },
      { id: 'b1', username: 'Bot 1', isBot: true },
      { id: 'b2', username: 'Bot 2', isBot: true },
      { id: 'b3', username: 'Bot 3', isBot: true },
    ],
  });

  const state = useGameStore.getState().gameState;
  assert(state !== null, 'Game initialized in store');
  assert(state?.players.length === 4, '4 players registered');
  assert(state?.currentTurnSeat === 0, 'First turn is Seat 0');

  // Test board coordinate resolution
  const redStart = LudoBoard.resolveGridCoordinate('RED', 0, 0);
  assert(redStart.row === 13 && redStart.col === 6, 'Red start tile is grid (13, 6)');

  console.log('\n====================================================');
  console.log(`MOBILE TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runMobileTests();
