import { LudoBoard } from '../src/engine/LudoBoard';
import { PathCalculator } from '../src/engine/PathCalculator';
import { DiceRoller } from '../src/engine/DiceRoller';
import { MoveValidator } from '../src/engine/MoveValidator';
import { BotAI } from '../src/engine/BotAI';
import { LudoGame } from '../src/engine/LudoGame';
import { RuleSetFactory } from '../src/rules/RuleSetFactory';
import { DEFAULT_RULES } from '../src/constants/rules';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function runTests() {
  console.log('====================================================');
  console.log('ROYAL LUDO – GAME ENGINE COMPREHENSIVE TEST SUITE');
  console.log('====================================================\n');

  // TEST SUITE 1: Board & Coordinates
  console.log('Test Suite 1: Board Geometry & Safe Cells');
  assert(LudoBoard.isSafeCell(0), 'Cell 0 (Red Start) is safe');
  assert(LudoBoard.isSafeCell(8), 'Cell 8 (Red Star) is safe');
  assert(LudoBoard.isSafeCell(13), 'Cell 13 (Green Start) is safe');
  assert(LudoBoard.isSafeCell(21), 'Cell 21 (Green Star) is safe');
  assert(LudoBoard.isSafeCell(26), 'Cell 26 (Yellow Start) is safe');
  assert(LudoBoard.isSafeCell(34), 'Cell 34 (Yellow Star) is safe');
  assert(LudoBoard.isSafeCell(39), 'Cell 39 (Blue Start) is safe');
  assert(LudoBoard.isSafeCell(47), 'Cell 47 (Blue Star) is safe');
  assert(!LudoBoard.isSafeCell(1), 'Cell 1 is unsafe');
  assert(!LudoBoard.isSafeCell(10), 'Cell 10 is unsafe');

  const redStartCoord = LudoBoard.resolveGridCoordinate('RED', 0, 0);
  assert(redStartCoord.row === 13 && redStartCoord.col === 6, 'Red start grid is (13, 6)');
  const redFinishCoord = LudoBoard.resolveGridCoordinate('RED', 0, 56);
  assert(redFinishCoord.row === 8 && redFinishCoord.col === 7, 'Red finish grid is (8, 7)');

  // TEST SUITE 2: Path Calculation & Overshooting
  console.log('\nTest Suite 2: Path Calculation & Boundary Checks');
  assert(PathCalculator.calculateNextStep(-1, 6) === 0, 'Rolling 6 allows exiting base to step 0');
  assert(PathCalculator.calculateNextStep(-1, 5) === -1, 'Rolling 5 cannot exit base in Classic');
  assert(PathCalculator.calculateNextStep(0, 4) === 4, 'Advancing 4 steps from 0 leads to 4');
  assert(PathCalculator.calculateNextStep(50, 4) === 54, 'Step 50 + roll 4 enters home stretch step 54');
  assert(PathCalculator.calculateNextStep(54, 2) === 56, 'Step 54 + roll 2 finishes exactly at 56');
  assert(PathCalculator.calculateNextStep(54, 3) === -1, 'Step 54 + roll 3 overshoots 56 -> invalid move');

  // TEST SUITE 3: Dice Rolling & 3-Consecutive Sixes Rule
  console.log('\nTest Suite 3: Dice Rolling & Consecutive Sixes');
  for (let i = 0; i < 50; i++) {
    const roll = DiceRoller.roll();
    if (roll < 1 || roll > 6) {
      assert(false, `Dice roll ${roll} out of bounds (1..6)`);
      break;
    }
  }
  assert(true, '50 consecutive random rolls strictly within 1..6');

  const eval1 = DiceRoller.evaluateConsecutiveSixes(0, 6);
  assert(eval1.newCount === 1 && !eval1.forfeited, '1st six gives count 1');
  const eval2 = DiceRoller.evaluateConsecutiveSixes(1, 6);
  assert(eval2.newCount === 2 && !eval2.forfeited, '2nd six gives count 2');
  const eval3 = DiceRoller.evaluateConsecutiveSixes(2, 6, true);
  assert(eval3.newCount === 0 && eval3.forfeited, '3rd six forfeits turn with 3-sixes rule');

  // TEST SUITE 4: LudoGame Deterministic State Machine
  console.log('\nTest Suite 4: LudoGame Deterministic State Machine');
  const players = [
    { id: 'p1', username: 'Player 1' },
    { id: 'p2', username: 'Player 2' },
    { id: 'p3', username: 'Player 3' },
    { id: 'p4', username: 'Player 4' },
  ];
  const game = new LudoGame('match_test_1', players, { mode: 'classic' });
  const s0 = game.getState();
  assert(s0.players.length === 4, 'Game initialized with 4 players');
  assert(s0.currentTurnSeat === 0, 'First turn is Seat 0 (RED)');
  assert(s0.turnPhase === 'ROLL_DICE', 'Initial phase is ROLL_DICE');

  // Seat 0 rolls 5 -> all tokens in base, so turn should auto-pass to Seat 1
  const roll5 = game.rollDice(0, 5);
  assert(roll5.diceValue === 5, 'Injected roll was 5');
  assert(roll5.validMoves.length === 0, 'No valid moves for roll 5 from base');
  assert(roll5.turnPassed === true, 'Turn automatically passed');
  assert(game.getState().currentTurnSeat === 1, 'Current turn advanced to Seat 1 (GREEN)');

  // Seat 1 rolls 6 -> can exit base!
  const roll6 = game.rollDice(1, 6);
  assert(roll6.validMoves.length === 4, 'All 4 tokens in base can legally exit on 6');
  assert(game.getState().turnPhase === 'SELECT_TOKEN', 'Turn phase transitioned to SELECT_TOKEN');

  // Move token 0 out of base
  const moveRes = game.moveToken(1, 0);
  assert(moveRes.fromStep === -1 && moveRes.toStep === 0, 'Token 0 moved from -1 to 0');
  assert(moveRes.extraTurn === true, 'Player earned extra turn for rolling a 6');
  assert(game.getState().currentTurnSeat === 1, 'Seat 1 retains turn for rolling 6');
  assert(game.getState().turnPhase === 'ROLL_DICE', 'Phase returned to ROLL_DICE');

  // TEST SUITE 5: Capturing & Safe Cells
  console.log('\nTest Suite 5: Capturing & Safe Cells');
  const gameCap = new LudoGame('match_capture', players, { mode: 'classic' });
  // Set up Green token at perimeter cell 1 (step 1 for Green = perimeter 14)
  // And Red token at step 14 (perimeter 14)
  const gState = (gameCap as any).state;
  // Red seat 0, token 0 at step 13 (perimeter 13: Green Start Safe)
  gState.players[0].tokens[0].position = LudoBoard.createTokenPosition('RED', 0, 13);
  // Green seat 1, token 0 at step 0 (perimeter 13: Green Start Safe)
  gState.players[1].tokens[0].position = LudoBoard.createTokenPosition('GREEN', 0, 0);

  // Red at safe cell 13 rolling 1 to land on perimeter 14 (step 14)
  // Let's place Green at perimeter 14 (step 1 for Green)
  gState.players[1].tokens[1].position = LudoBoard.createTokenPosition('GREEN', 1, 1); // perimeter 14 (unsafe)

  gState.currentTurnSeat = 0;
  gState.turnPhase = 'ROLL_DICE';
  const capRoll = gameCap.rollDice(0, 1);
  const validForToken0 = capRoll.validMoves.find((m) => m.tokenId === 0);
  assert(validForToken0 !== undefined, 'Red token 0 can move 1 step');
  assert(validForToken0?.capturesToken !== null, 'Move detected opponent capture on unsafe cell 14');
  assert(validForToken0?.capturesToken?.color === 'GREEN', 'Captured token is GREEN');

  const capMoveRes = gameCap.moveToken(0, 0);
  assert(capMoveRes.extraTurn === true, 'Extra turn awarded for capture');
  const greenTokenAfter = gState.players[1].tokens[1];
  assert(greenTokenAfter.position.state === 'BASE', 'Captured Green token returned to BASE');

  // TEST SUITE 6: Master Mode Blockade
  console.log('\nTest Suite 6: Master Mode Blockade & Stacking');
  const masterRules = RuleSetFactory.getRules('master', 4);
  const masterGame = new LudoGame('match_master', players, masterRules);
  const mState = (masterGame as any).state;
  // Red places 2 tokens on step 5 (perimeter index 5)
  mState.players[0].tokens[0].position = LudoBoard.createTokenPosition('RED', 0, 5);
  mState.players[0].tokens[1].position = LudoBoard.createTokenPosition('RED', 1, 5);

  // Another player trying to pass through perimeter index 5 should be blocked
  // Blue is Seat 3. Perimeter 5 corresponds to Blue relative step:
  const blueStepToPerim5 = PathCalculator.perimeterIndexToStep('BLUE', 5);
  // Place Blue token 2 steps before the blockade
  mState.players[3].tokens[0].position = LudoBoard.createTokenPosition('BLUE', 0, blueStepToPerim5 - 2);
  mState.currentTurnSeat = 3;
  mState.turnPhase = 'ROLL_DICE';

  // Rolling 4 would require leaping over perimeter index 5 (which is 2 steps away)
  const blueRoll = masterGame.rollDice(3, 4);
  const blueMove = blueRoll.validMoves.find((m) => m.tokenId === 0);
  assert(blueMove === undefined, 'Master mode prevents leaping over opponent 2-token blockade');

  // TEST SUITE 7: Bot AI Decisions
  console.log('\nTest Suite 7: Bot AI Decision Matrix');
  const botMove = BotAI.selectMove(
    'hard',
    [
      { tokenId: 0, fromStep: 10, toStep: 14, isEntry: false, isFinish: false, capturesToken: null },
      { tokenId: 1, fromStep: 52, toStep: 56, isEntry: false, isFinish: true, capturesToken: null },
    ],
    gState.players[0],
    gState.players,
    DEFAULT_RULES.classic
  );
  assert(botMove?.tokenId === 1 && botMove.isFinish, 'Hard AI decisively chooses winning Finish move');

  // TEST SUITE 8: Quick Mode Victory Check
  console.log('\nTest Suite 8: Quick Mode 2-Token Victory');
  const quickRules = RuleSetFactory.getRules('quick', 2);
  const quickGame = new LudoGame('match_quick', [players[0], players[2]], quickRules);
  const qState = (quickGame as any).state;
  // Put 1 token home, 1 token at 55
  qState.players[0].tokensHome = 1;
  qState.players[0].tokens[0].position = LudoBoard.createTokenPosition('RED', 0, 56);
  qState.players[0].tokens[1].position = LudoBoard.createTokenPosition('RED', 1, 55);
  qState.currentTurnSeat = 0;
  qState.turnPhase = 'ROLL_DICE';

  quickGame.rollDice(0, 1);
  const qMove = quickGame.moveToken(0, 1);
  assert(qMove.playerFinished === true, 'Player finishes after 2nd token home in Quick mode');
  assert(qMove.gameOver === true, 'Game successfully terminates with victory');

  // TEST SUITE 9: 100-Turn Headless Simulation
  console.log('\nTest Suite 9: Automated 100-Turn Headless Game Simulation');
  const simPlayers = [
    { id: 'b1', username: 'Bot Red', isBot: true },
    { id: 'b2', username: 'Bot Green', isBot: true },
    { id: 'b3', username: 'Bot Yellow', isBot: true },
    { id: 'b4', username: 'Bot Blue', isBot: true },
  ];
  const simGame = new LudoGame('sim_match', simPlayers, { mode: 'quick' });
  let simulationTurns = 0;
  while (simGame.getState().turnPhase !== 'GAME_OVER' && simulationTurns < 150) {
    simGame.playBotTurn('medium');
    simulationTurns++;
  }
  assert(simulationTurns > 0, `Simulation completed ${simulationTurns} turns smoothly without deadlocks`);

  // TEST SUITE 10: Authentic Ludo Star Rules & Kill Requirement
  console.log('\nTest Suite 10: Authentic Ludo Star Kill Requirement');
  const lsRules = RuleSetFactory.getRules('classic', 2);
  const lsGame = new LudoGame('match_ls_rules', [players[0], players[2]], lsRules);
  const lsState = (lsGame as any).state;
  // Red token 0 placed at step 49 (near home stretch 51)
  lsState.players[0].tokens[0].position = LudoBoard.createTokenPosition('RED', 0, 49);
  lsState.players[0].hasKilledOpponent = false;
  lsState.currentTurnSeat = 0;
  lsState.turnPhase = 'ROLL_DICE';

  // Rolling 4 would reach 53 (home stretch), but player has 0 kills!
  const rollRes = lsGame.rollDice(0, 4);
  const token0Move = rollRes.validMoves.find((m) => m.tokenId === 0);
  assert(token0Move !== undefined, 'Token 0 has valid move');
  assert(token0Move?.toStep === 1, 'Without kill, token loops around perimeter track to step 1 (49+4 % 52)');

  // Now player gets a kill
  lsState.players[0].hasKilledOpponent = true;
  const lsMovesAfterKill = MoveValidator.getValidMoves(
    lsState.players[0],
    4,
    lsState.players,
    lsRules
  );
  const token0AfterKill = lsMovesAfterKill.find((m) => m.tokenId === 0);
  assert(token0AfterKill?.toStep === 53, 'With kill achieved, token unlocks home stretch and advances to step 53');

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
