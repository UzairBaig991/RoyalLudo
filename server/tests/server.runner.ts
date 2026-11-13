import { createServer } from 'node:http';
import { RoyalApp } from '../src/app';
import { AuthService } from '../src/services/authService';
import { EconomyService } from '../src/services/economyService';
import { RoomService } from '../src/services/roomService';
import { MatchmakingService } from '../src/services/matchmakingService';
import { SocialService } from '../src/services/socialService';

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

async function runServerTests() {
  console.log('====================================================');
  console.log('ROYAL LUDO – BACKEND & SERVICES TEST SUITE');
  console.log('====================================================\n');

  // TEST 1: Auth Service (Guest Login & Token Generation)
  console.log('Test Suite 1: Authentication & Session');
  const guest1 = AuthService.guestLogin('EmperorArthur');
  assert(guest1.token.length > 20, 'JWT token generated');
  assert(guest1.profile.username === 'EmperorArthur', 'Guest profile username matches');
  assert(guest1.profile.level === 1, 'Initial level is 1');

  const verified = AuthService.verifyToken(guest1.token);
  assert(verified?.userId === guest1.user.id, 'Token verification matches user id');

  const emailReg = AuthService.register('king@royalludo.com', 'securepass123', 'KingLudo');
  assert(emailReg.profile.email === 'king@royalludo.com', 'Registered email profile created');

  const loginRes = AuthService.login('king@royalludo.com', 'securepass123');
  assert(loginRes.profile.username === 'KingLudo', 'Login with valid credentials succeeded');

  // TEST 2: Economy Service
  console.log('\nTest Suite 2: Economy & Wallet');
  const initialWallet = EconomyService.getWallet(guest1.user.id);
  assert(initialWallet.gold === 5000, 'Initial gold balance is 5000');
  assert(initialWallet.gems === 50, 'Initial gems balance is 50');

  const credited = EconomyService.credit(guest1.user.id, 'gold', 1500, 'quest_bonus');
  assert(credited.gold === 6500, 'Credited 1500 gold -> balance 6500');

  const debited = EconomyService.debit(guest1.user.id, 'gold', 500, 'room_entry');
  assert(debited.gold === 6000, 'Debited 500 gold -> balance 6000');

  const dailyRes = EconomyService.claimDailyReward(guest1.user.id);
  assert(dailyRes.gold > 0, 'Claimed daily reward gold');

  // TEST 3: Room Management
  console.log('\nTest Suite 3: Room Lifecycle & Code Generation');
  const room = RoomService.createRoom(guest1.user.id, 'classic', 4, 1000);
  assert(room.code.startsWith('RL') && room.code.length === 6, `6-digit room code generated: ${room.code}`);
  assert(room.participants.length === 1, 'Host seated in room');
  assert(room.prizePool === 3600, 'Prize pool calculated (4 * 1000 * 0.9 = 3600)');

  const guest2 = AuthService.guestLogin('QueenGuinevere');
  const joinedRoom = RoomService.joinRoom(guest2.user.id, room.code);
  assert(joinedRoom.participants.length === 2, '2nd player joined room');

  const started = RoomService.startGame(room.id);
  assert(started.room.status === 'in_game', 'Room transitioned to in_game');
  assert(started.room.participants.length === 4, 'Remaining 2 vacant seats populated with bots');
  assert(started.game.getState().players.length === 4, 'Authoritative LudoGame created');

  // TEST 4: Matchmaking Service
  console.log('\nTest Suite 4: Real-Time Matchmaking Queue');
  const mmUser1 = AuthService.guestLogin('MatchUser1');
  const mmUser2 = AuthService.guestLogin('MatchUser2');

  MatchmakingService.enqueue({
    userId: mmUser1.user.id,
    socketId: 'sock_1',
    mode: 'quick',
    playerCount: 2,
    entryFee: 500,
    joinedAt: Date.now(),
  });

  const mmResult = MatchmakingService.findMatch({
    userId: mmUser2.user.id,
    socketId: 'sock_2',
    mode: 'quick',
    playerCount: 2,
    entryFee: 500,
    joinedAt: Date.now(),
  });

  assert(mmResult !== null, 'Matchmaking successfully paired 2 players');
  assert(mmResult?.room.mode === 'quick', 'Matched game mode is quick');

  // TEST 5: Social & Friend System
  console.log('\nTest Suite 5: Social Networking & Friends');
  const fReq = SocialService.sendFriendRequest(guest1.user.id, guest2.user.id);
  assert(fReq.status === 'pending', 'Friend request dispatched');

  SocialService.acceptFriendRequest(fReq.id, guest2.user.id);
  const friendsOf1 = SocialService.getFriends(guest1.user.id);
  assert(friendsOf1.some((f) => f.userId === guest2.user.id), 'Friendship confirmed in friend list');

  console.log('\n====================================================');
  console.log(`BACKEND TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runServerTests();
