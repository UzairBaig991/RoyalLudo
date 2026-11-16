import { ROYAL_COLORS, COLOR_MAP, NOVA_COLORS } from '../src/theme/colors';
import { useAuthStore } from '../src/store/useAuthStore';
import { useEconomyStore } from '../src/store/useEconomyStore';
import { useGameStore } from '../src/store/useGameStore';
import { useSocialStore } from '../src/store/useSocialStore';
import { useCustomizationStore } from '../src/store/useCustomizationStore';
import { useMissionsStore } from '../src/store/useMissionsStore';
import { useSettingsStore } from '../src/store/useSettingsStore';
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
  console.log('ROYAL LUDO & NOVA – COMPREHENSIVE CLIENT TEST SUITE');
  console.log('====================================================\n');

  // TEST 1: Theme Consistency
  console.log('Test Suite 1: Theme & Palette Integrity');
  assert(ROYAL_COLORS.primaryBg === '#101827', 'Primary background matches #101827');
  assert(ROYAL_COLORS.gold === '#D6AE62', 'Royal Gold matches #D6AE62');
  assert(COLOR_MAP.RED.primary === '#E74C4C', 'Traditional Red matches #E74C4C');
  assert(COLOR_MAP.GREEN.primary === '#27AE70', 'Traditional Green matches #27AE70');
  assert(COLOR_MAP.YELLOW.primary === '#F2C94C', 'Traditional Yellow matches #F2C94C');
  assert(COLOR_MAP.BLUE.primary === '#3986D9', 'Traditional Blue matches #3986D9');
  assert(NOVA_COLORS.bg === '#0d101e', 'Nova background matches #0d101e');
  assert(NOVA_COLORS.accentPurple === '#b9a2ff', 'Nova accent purple matches #b9a2ff');
  assert(NOVA_COLORS.accentGold === '#ffd37b', 'Nova accent gold matches #ffd37b');
  assert(NOVA_COLORS.accentMint === '#83e6c0', 'Nova accent mint matches #83e6c0');

  // TEST 2: Auth Store
  console.log('\nTest Suite 2: Client Auth Store');
  const auth = useAuthStore.getState();
  assert(auth.profile !== null, 'Initial profile exists');
  assert(auth.isAuthenticated === true, 'Authenticated by default');

  auth.loginAsGuest('Alex Nova');
  assert(useAuthStore.getState().profile?.username === 'Alex Nova', 'Guest login sets username');

  auth.updateProfile({ username: 'Alex Nova Pro' });
  assert(useAuthStore.getState().profile?.username === 'Alex Nova Pro', 'Profile update reflects in store');

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

  // TEST 4: Social & Inbox Store
  console.log('\nTest Suite 4: Social & Inbox Store');
  const social = useSocialStore.getState();
  assert(social.friends.length >= 4, 'Friends list loaded with online contacts');
  const maya = social.friends.find((f) => f.name === 'Maya');
  assert(maya !== undefined && maya.status === 'online', 'Maya is online in friends list');

  const giftCoins = social.claimInboxItem('i1');
  assert(giftCoins === 500, 'Claiming gift item i1 awards 500 coins');
  assert(useSocialStore.getState().inbox.find((i) => i.id === 'i1')?.claimed === true, 'Inbox item marked claimed');

  social.addClubMessage('Let’s play team mode!');
  const lastMsg = useSocialStore.getState().clubMessages.slice(-1)[0];
  assert(lastMsg.message === 'Let’s play team mode!', 'Club message added to stream');

  // TEST 5: Customization & Skins Store
  console.log('\nTest Suite 5: Customization & Skins Store');
  const custom = useCustomizationStore.getState();
  assert(custom.dice.length >= 4, 'Dice catalog loaded');
  custom.equipDie('d_classic');
  assert(useCustomizationStore.getState().dice.find((d) => d.id === 'd_classic')?.equipped === true, 'Classic die equipped');

  custom.equipBoard('b_classic');
  assert(useCustomizationStore.getState().boards.find((b) => b.id === 'b_classic')?.equipped === true, 'Classic board equipped');

  // TEST 6: Missions & Rewards Store
  console.log('\nTest Suite 6: Missions & Rewards Store');
  const missions = useMissionsStore.getState();
  assert(missions.streakDay === 5, 'Daily streak day is 5');
  const streakCoins = missions.claimDailyStreak();
  assert(streakCoins === 500, 'Claiming streak awards 500 coins');
  assert(useMissionsStore.getState().streakClaimedToday === true, 'Streak marked claimed today');

  const rollResult = missions.performLuckyRoll();
  assert(rollResult > 0, `Lucky roll awarded ${rollResult} coins`);
  assert(useMissionsStore.getState().luckyRollAvailable === false, 'Lucky roll marked used for today');

  // TEST 7: Settings Store
  console.log('\nTest Suite 7: Settings Store');
  const settings = useSettingsStore.getState();
  const initSound = settings.soundEffects;
  settings.toggleSetting('soundEffects');
  assert(useSettingsStore.getState().soundEffects === !initSound, 'Sound effects setting toggles cleanly');

  // TEST 8: Game Store Lifecycle
  console.log('\nTest Suite 8: Client Game Store Lifecycle');
  const gameStore = useGameStore.getState();
  gameStore.startNewGame({
    mode: 'classic',
    playerCount: 4,
    players: [
      { id: 'p1', username: 'Alex Nova', isBot: false },
      { id: 'b1', username: 'Maya', isBot: true },
      { id: 'b2', username: 'Zara', isBot: true },
      { id: 'b3', username: 'Sam', isBot: true },
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
