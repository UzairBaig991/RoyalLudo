import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Modal,
  Animated,
  TextInput,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaDie } from '../../src/components/nova/NovaDie';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { LudoBoardSvg } from '../../src/components/board/LudoBoardSvg';
import { soundEffects as sfxEngine } from '../../src/utils/soundEffects';
import { useGameStore } from '../../src/store/useGameStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useEconomyStore } from '../../src/store/useEconomyStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { useCustomizationStore } from '../../src/store/useCustomizationStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// Scaled so the entire screen fits 100% on one page without scrolling
const BOARD_SIZE = Math.min(SCREEN_WIDTH - 24, SCREEN_HEIGHT * 0.44, 342);

export default function LiveGameScreen() {
  const router = useRouter();
  const { matchId, mode: routeMode, prize: routePrize, players: routePlayers } = useLocalSearchParams<{
    matchId: string;
    mode?: string;
    prize?: string;
    players?: string;
  }>();

  const { profile } = useAuthStore();
  const { gold, gems, addGold, spendGems, spendGold } = useEconomyStore();
  const { soundEffects, gameMusic, allowVoiceChat, toggleSetting } = useSettingsStore();
  const { dice, boards, equipDie, unlockDie, equipBoard, unlockBoard } = useCustomizationStore();
  const equippedDie = dice.find((d) => d.equipped) || dice[0];
  const equippedBoard = boards.find((b) => b.equipped) || boards[0];

  const {
    gameState,
    isRolling,
    lastDiceRoll,
    firstTurnAnnouncement,
    gameSpeed,
    boardColorOffset,
    hoppingToken,
    rollDice,
    selectAndMoveToken,
    usePowerUp,
    triggerBotTurn,
    toggleGameSpeed,
    startNewGame,
    resetGame,
  } = useGameStore();

  const rotatedPalette = [
    { hex: NOVA_COLORS.coral, name: 'RED' as const },
    { hex: NOVA_COLORS.mint, name: 'GREEN' as const },
    { hex: NOVA_COLORS.gold, name: 'YELLOW' as const },
    { hex: NOVA_COLORS.blue, name: 'BLUE' as const },
  ];
  const getSeatVisual = (seatIdx: number) =>
    rotatedPalette[(seatIdx + (boardColorOffset || 0)) % 4];

  // Screen 15 (Game Chat) and Screen 16 (Game Menu) modal states
  const [showChatModal, setShowChatModal] = useState<boolean>(false);
  const [showMenuModal, setShowMenuModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showDiceSkinModal, setShowDiceSkinModal] = useState<boolean>(false);
  const [showBoardSkinModal, setShowBoardSkinModal] = useState<boolean>(false);
  const [showGiftModal, setShowGiftModal] = useState<boolean>(false);
  const [voiceOn, setVoiceOn] = useState<boolean>(false);
  const [tacticalHint, setTacticalHint] = useState<string | null>(null);

  // Auto-Roll Toggle & In-game Celebration Banners
  const [autoRollEnabled, setAutoRollEnabled] = useState<boolean>(false);
  const [captureBanner, setCaptureBanner] = useState<string | null>(null);
  const [celebrateSix, setCelebrateSix] = useState<boolean>(false);

  // Floating Animated Reactions & Speech Bubble
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string; anim: Animated.Value }[]>([]);
  const [activeSpeech, setActiveSpeech] = useState<{ sender: string; text: string } | null>(null);

  // In-Game Chat History
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'MAYA', text: 'That was a close one!' },
    { id: '2', sender: 'YOU', text: 'The comeback starts now.' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Turn timer countdown (15s)
  const [turnSecondsLeft, setTurnSecondsLeft] = useState<number>(12);
  const [roundNumber, setRoundNumber] = useState<number>(8);

  // Bouncing Turn Indicator Arrow (Ludo Star Style)
  const arrowBounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowBounceAnim, {
          toValue: 5,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(arrowBounceAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const isTwoPlayerMode =
    routePlayers === '2' ||
    gameState?.rules.playerCount === 2 ||
    gameState?.players.length === 2;

  // Initialize Game if opened directly or refreshed
  useEffect(() => {
    if (!gameState) {
      const isTwo = routePlayers === '2';
      const pCount: 2 | 4 = isTwo ? 2 : 4;
      const myName = profile?.username || 'You';
      const companionName = routeMode === 'bot' ? 'Nova Bot (Yellow)' : 'Companion (Yellow)';
      startNewGame({
        mode: (routeMode as any) || 'classic',
        playerCount: pCount,
        randomizeTurn: true,
        players: isTwo
          ? [
              { id: profile?.id || 'usr_me', username: myName, isBot: false },
              { id: 'usr_companion', username: companionName, isBot: true },
            ]
          : [
              { id: profile?.id || 'usr_me', username: myName, isBot: false },
              { id: 'b1', username: 'Maya', isBot: true },
              { id: 'b2', username: 'Zara', isBot: true },
              { id: 'b3', username: 'Sam', isBot: true },
            ],
      });
    }
  }, [gameState, routePlayers]);

  const currentTurnSeat = gameState?.currentTurnSeat ?? 0;
  const activeSeatPlayer = gameState?.players.find((p) => p.seatIndex === currentTurnSeat);
  const isMyTurn = activeSeatPlayer ? !activeSeatPlayer.isBot : currentTurnSeat === 0;
  const canRollDice = isMyTurn && gameState?.turnPhase === 'ROLL_DICE' && !isRolling;

  // Show Coin Toss / First Turn Announcement on match start
  useEffect(() => {
    if (firstTurnAnnouncement) {
      setTacticalHint(firstTurnAnnouncement);
      const t = setTimeout(() => setTacticalHint(null), 3200);
      return () => clearTimeout(t);
    }
  }, [firstTurnAnnouncement]);

  // Animated Directional Dice Flight & Dock Arrival (Ludo Star Style)
  const diceFlyX = useRef(new Animated.Value(0)).current;
  const diceFlyY = useRef(new Animated.Value(0)).current;
  const diceFlyScale = useRef(new Animated.Value(1)).current;
  const dockPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(dockPulseAnim, {
          toValue: 1.07,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(dockPulseAnim, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, []);

  // Turn Change Sound Cue + Animated Dice Glide Between Player Profiles
  const prevTurnSeatRef = useRef<number>(currentTurnSeat);
  useEffect(() => {
    if (prevTurnSeatRef.current !== currentTurnSeat) {
      const seatCorners: Record<number, { x: number; y: number }> = {
        0: { x: -1, y: 1 },  // Red (Bottom-Left)
        1: { x: -1, y: -1 }, // Green (Top-Left)
        2: { x: 1, y: -1 },  // Yellow (Top-Right)
        3: { x: 1, y: 1 },   // Blue (Bottom-Right)
      };
      const from = seatCorners[prevTurnSeatRef.current] || seatCorners[0];
      const to = seatCorners[currentTurnSeat] || seatCorners[0];

      // Start offset toward the previous player's profile and glide with spring into the new active profile
      diceFlyX.setValue((from.x - to.x) * 76);
      diceFlyY.setValue((from.y - to.y) * 96);
      diceFlyScale.setValue(1.26);

      Animated.parallel([
        Animated.spring(diceFlyX, {
          toValue: 0,
          friction: 7,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.spring(diceFlyY, {
          toValue: 0,
          friction: 7,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.spring(diceFlyScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();

      if (currentTurnSeat === 0) {
        sfxEngine.playRollSix();
      } else {
        sfxEngine.playTokenStep();
      }
      prevTurnSeatRef.current = currentTurnSeat;
    }
  }, [currentTurnSeat]);

  // Exit Prompt Handler
  const handlePromptExit = () => {
    Alert.alert(
      'Exit Game',
      'Are you sure you want to leave the game? Your match will end and you will return to the lobby.',
      [
        { text: 'Resume Play', style: 'cancel' },
        {
          text: 'Leave Game',
          style: 'destructive',
          onPress: () => {
            sfxEngine.playTokenStep();
            resetGame();
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  const handleRestartMatch = () => {
    setShowMenuModal(false);
    sfxEngine.playTokenStep();
    const isTwo = routePlayers === '2';
    const pCount: 2 | 4 = isTwo ? 2 : 4;
    const myName = profile?.username || 'You';
    const companionName = routeMode === 'bot' ? 'Nova Bot (Yellow)' : 'Companion (Yellow)';
    startNewGame({
      mode: (routeMode as any) || 'classic',
      playerCount: pCount,
      randomizeTurn: true,
      players: isTwo
        ? [
            { id: profile?.id || 'usr_me', username: myName, isBot: false },
            { id: 'usr_companion', username: companionName, isBot: true },
          ]
        : [
            { id: profile?.id || 'usr_me', username: myName, isBot: false },
            { id: 'b1', username: 'Maya', isBot: true },
            { id: 'b2', username: 'Zara', isBot: true },
            { id: 'b3', username: 'Sam', isBot: true },
          ],
    });
  };

  const triggerReaction = (emoji: string) => {
    sfxEngine.playEmoji();
    const anim = new Animated.Value(0);
    const id = Date.now().toString() + Math.random();
    setFloatingEmojis((prev) => [...prev, { id, emoji, anim }]);
    Animated.timing(anim, {
      toValue: 1,
      duration: 1700,
      useNativeDriver: true,
    }).start(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    });
  };

  const handleUsePowerUp = (type: 'REROLL' | 'MAGIC_SIX' | 'SHIELD') => {
    if (!isMyTurn) {
      Alert.alert('Turn Required', 'Wait for your turn to activate boosters!');
      return;
    }
    const cost = type === 'MAGIC_SIX' ? 2 : 1;
    if (gems < cost) {
      Alert.alert('Gems Needed', `This booster requires ${cost} gems. Visit the Shop to get gems!`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Go to Shop', onPress: () => router.push('/shop/gems' as any) },
      ]);
      return;
    }

    const spent = spendGems(cost);
    if (!spent) return;

    sfxEngine.playPowerUp();
    const res = usePowerUp(currentTurnSeat, type);
    if (res.success) {
      triggerReaction(type === 'MAGIC_SIX' ? '🎯' : type === 'SHIELD' ? '🛡️' : '⚡');
    } else {
      Alert.alert('Booster', res.message);
    }
  };

  const handleTacticalHint = () => {
    sfxEngine.playTokenStep();
    if (!isMyTurn) {
      setTacticalHint('🧠 AI Advisor: Wait for your turn, then roll or pick the highest-value capture/safe tile!');
      setTimeout(() => setTacticalHint(null), 3200);
      return;
    }
    if (canRollDice) {
      setTacticalHint('🧠 AI Advisor: Roll the dice! Tip: Use "Six 2◇" booster if opponent is vulnerable.');
      setTimeout(() => setTacticalHint(null), 3200);
      return;
    }
    if (gameState?.turnPhase === 'SELECT_TOKEN' && gameState.validMoves.length > 0) {
      const bestMove = [...gameState.validMoves].sort((a, b) => {
        const scoreA =
          (a.isFinish ? 10000 : 0) +
          (a.capturesToken ? 5000 : 0) +
          (a.isEntry ? 2500 : 0) +
          a.toStep * 20;
        const scoreB =
          (b.isFinish ? 10000 : 0) +
          (b.capturesToken ? 5000 : 0) +
          (b.isEntry ? 2500 : 0) +
          b.toStep * 20;
        return scoreB - scoreA;
      })[0];
      const reason = bestMove.isFinish
        ? 'reaches HOME triangle (+Extra Turn)!'
        : bestMove.capturesToken
        ? 'CAPTURES opponent token (+Extra Turn)!'
        : bestMove.isEntry
        ? 'deploys a new token from base!'
        : `advances to step ${bestMove.toStep} safely!`;
      setTacticalHint(`🧠 AI Hint: Move Token #${bestMove.tokenId + 1} — ${reason}`);
      setTimeout(() => setTacticalHint(null), 3800);
    }
  };

  const handleSelectDiceSkinInGame = (skin: typeof dice[0]) => {
    if (skin.unlocked) {
      sfxEngine.playTokenStep();
      equipDie(skin.id);
      triggerReaction('🎲');
      return;
    }
    if (skin.priceGems && gems >= skin.priceGems) {
      spendGems(skin.priceGems);
      unlockDie(skin.id);
      equipDie(skin.id);
      sfxEngine.playPowerUp();
      triggerReaction('✨');
      return;
    }
    if (skin.priceCoins && gold >= skin.priceCoins) {
      spendGold(skin.priceCoins);
      unlockDie(skin.id);
      equipDie(skin.id);
      sfxEngine.playPowerUp();
      triggerReaction('✨');
      return;
    }
    Alert.alert(
      'Unlock Dice Skin 🎲',
      `Need ${skin.priceGems || 30} gems or ${(skin.priceCoins || 3000).toLocaleString()} coins to unlock ${skin.name}.`
    );
  };

  const isAnyModalOpen =
    showChatModal ||
    showMenuModal ||
    showRulesModal ||
    showDiceSkinModal ||
    showBoardSkinModal ||
    showGiftModal;

  // Handle Turn Countdown Timer with low-time warning sounds (paused when any modal is open)
  useEffect(() => {
    setTurnSecondsLeft(15);
  }, [currentTurnSeat, gameState?.turnPhase]);

  useEffect(() => {
    if (isAnyModalOpen || gameState?.turnPhase === 'GAME_OVER') return;
    const interval = setInterval(() => {
      setTurnSecondsLeft((prev) => {
        if ((prev === 3 || prev === 2) && isMyTurn) {
          sfxEngine.playTimerWarning();
        }
        if (prev <= 1) {
          if (isMyTurn) {
            if (canRollDice) {
              handleRoll();
            } else if (gameState?.turnPhase === 'SELECT_TOKEN' && gameState.validMoves.length > 0) {
              handleSelectToken(currentTurnSeat, gameState.validMoves[0].tokenId);
            }
          } else {
            triggerBotTurn();
          }
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTurnSeat, gameState?.turnPhase, isMyTurn, canRollDice, isAnyModalOpen]);

  // Celebrate rolling a 6 with special sound and celebratory banner
  useEffect(() => {
    if (lastDiceRoll === 6 && !isRolling) {
      setCelebrateSix(true);
      if (isMyTurn) {
        sfxEngine.playRollSix();
        triggerReaction('🎲');
      }
      const timer = setTimeout(() => {
        setCelebrateSix(false);
      }, 2600);
      return () => clearTimeout(timer);
    } else {
      setCelebrateSix(false);
    }
  }, [lastDiceRoll, isRolling, isMyTurn]);

  // Auto-roll trigger if user enabled Auto-Roll
  useEffect(() => {
    if (autoRollEnabled && canRollDice && !isRolling) {
      const autoTimer = setTimeout(() => {
        handleRoll();
      }, 350);
      return () => clearTimeout(autoTimer);
    }
  }, [autoRollEnabled, canRollDice, isRolling]);

  // Handle Game Over
  useEffect(() => {
    if (gameState?.turnPhase === 'GAME_OVER') {
      const winner = gameState.rankings[0];
      const isWinner = winner && (winner.username === profile?.username || winner.username === 'You' || winner.seatIndex === 0);
      if (isWinner) {
        sfxEngine.playVictory();
        addGold(2000);
      }
      setTimeout(() => {
        router.replace({
          pathname: '/gameplay/result',
          params: { won: isWinner ? 'true' : 'false', coins: '2000' },
        } as any);
      }, 1400);
    }
  }, [gameState?.turnPhase]);

  const handleRoll = () => {
    if (canRollDice) {
      sfxEngine.playDiceRoll();
      rollDice(currentTurnSeat);
    }
  };

  const handleSelectToken = (seatIndex: number, tokenId: number) => {
    if (seatIndex === currentTurnSeat && gameState?.turnPhase === 'SELECT_TOKEN') {
      const move = gameState.validMoves.find((m) => m.tokenId === tokenId);
      if (move) {
        if (move.capturesToken) {
          sfxEngine.playCapture();
          triggerReaction('💥');
          setCaptureBanner('⚔️ SMASH! Opponent Captured! +1 Free Turn!');
          setTimeout(() => setCaptureBanner(null), 2800);
        } else if (move.isFinish) {
          sfxEngine.playFinish();
          triggerReaction('👑');
        } else {
          sfxEngine.playTokenStep();
        }
      }
      selectAndMoveToken(seatIndex, tokenId);
    }
  };

  const handleSendChat = (message: string) => {
    if (!message.trim()) return;
    sfxEngine.playEmoji();
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: 'YOU', text: message.trim() },
    ]);
    setActiveSpeech({ sender: 'YOU', text: message.trim() });
    setTimeout(() => setActiveSpeech(null), 3200);
    setChatInput('');
  };

  const handleForfeit = () => {
    setShowMenuModal(false);
    resetGame();
    router.replace('/(tabs)');
  };

  const getStatusMessage = () => {
    if (isRolling) return 'Rolling dice…';
    if (lastDiceRoll === 6) return '🎉 A six! Roll again!';
    if (isMyTurn) {
      if (gameState?.turnPhase === 'SELECT_TOKEN') return 'Select your token to move!';
      return 'Your turn! Tap Red dice to roll';
    }
    const currentName = gameState?.players[currentTurnSeat]?.username || 'Opponent';
    return `${currentName}'s turn to roll`;
  };

  const getSubStatus = () => {
    if (isMyTurn) {
      return `Dice at Red card  ·  ${turnSecondsLeft}s left`;
    }
    const currentName = gameState?.players[currentTurnSeat]?.username || 'Opponent';
    return `Dice with ${currentName}  ·  ${turnSecondsLeft}s left`;
  };

  if (!gameState) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Setting up the table…</Text>
      </SafeAreaView>
    );
  }

  const p0 = gameState.players.find((p) => p.seatIndex === 0) || {
    username: profile?.username || 'Alex · You',
    tokensHome: 0,
    seatIndex: 0,
  };
  const p1 = gameState.players.find((p) => p.seatIndex === 1) || {
    username: 'Maya',
    tokensHome: 0,
    seatIndex: 1,
  };
  const p2 = gameState.players.find((p) => p.seatIndex === 2) || {
    username: isTwoPlayerMode ? 'Companion' : 'Zara',
    tokensHome: 0,
    seatIndex: 2,
  };
  const p3 = gameState.players.find((p) => p.seatIndex === 3) || {
    username: 'Sam',
    tokensHome: 0,
    seatIndex: 3,
  };

  // Helper to render each player's corner card with Dynamic Moving Dice & Bouncing Turn Arrow (Ludo Star Style)
  const renderPlayerCard = (
    seatIndex: number,
    player: { username: string; tokensHome: number; seatIndex: number },
    colorHex: string,
    colorName: 'RED' | 'GREEN' | 'YELLOW' | 'BLUE',
    badgeLabel?: string
  ) => {
    const isThisTurn = currentTurnSeat === seatIndex;
    const isMe = seatIndex === 0;
    const fullPlayer = gameState.players.find((p) => p.seatIndex === seatIndex);
    const isHumanSeat = fullPlayer ? !fullPlayer.isBot : isMe;
    const displayName = isMe ? (profile?.username || player.username || 'You') : player.username;

    return (
      <View style={[styles.playerCardContainer, { opacity: isThisTurn ? 1 : 0.42 }]}>
        {/* PLAYER CARD WITH MOVING DICE POD */}
        <View
          style={[
            styles.playerCard,
            isThisTurn && [styles.playerCardActive, { borderColor: colorHex }],
          ]}
        >
          <View style={styles.playerCardLeft}>
            <View style={[styles.playerDot, { backgroundColor: colorHex }]}>
              <Text style={styles.playerDotInitial}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.playerMeta}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.playerName} numberOfLines={1}>
                  {displayName}
                </Text>
                {badgeLabel && (
                  <NovaBadge
                    label={badgeLabel}
                    color={seatIndex === 2 ? 'gold' : 'mint'}
                  />
                )}
              </View>
              <Text style={[styles.playerStatus, isThisTurn && styles.statusActive]}>
                {isThisTurn
                  ? isRolling
                    ? 'Rolling…'
                    : isHumanSeat
                    ? canRollDice
                      ? 'Tap dice'
                      : 'Move token'
                    : 'Thinking…'
                  : `${player.tokensHome} home`}
              </Text>
            </View>
          </View>

          {/* DYNAMIC MOVING DICE POD (Flies & Docks into the active player's profile!) */}
          <View style={styles.playerDicePod}>
            {isThisTurn ? (
              <Animated.View
                style={{
                  transform: [
                    { translateX: diceFlyX },
                    { translateY: diceFlyY },
                    { scale: diceFlyScale },
                  ],
                  zIndex: 40,
                }}
              >
                <TouchableOpacity
                  activeOpacity={isHumanSeat && canRollDice ? 0.75 : 1}
                  disabled={!isHumanSeat || !canRollDice}
                  onPress={isHumanSeat ? handleRoll : undefined}
                  style={[
                    styles.activeDieWrap,
                    {
                      borderWidth: 2,
                      borderColor: colorHex,
                      borderRadius: 14,
                      backgroundColor: 'rgba(13, 18, 36, 0.85)',
                      shadowColor: colorHex,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.75,
                      shadowRadius: 10,
                      elevation: 8,
                    },
                    isHumanSeat && canRollDice && styles.activeDieWrapClickable,
                  ]}
                >
                  {/* AUTHENTIC LUDO STAR BOUNCING ARROW: Directly on Upper Side of Dice, ONLY on Your Roll Turn */}
                  {isHumanSeat && canRollDice && !isRolling && (
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        styles.diceTopArrowWrap,
                        {
                          transform: [{ translateY: arrowBounceAnim }],
                        },
                      ]}
                    >
                      <View style={styles.diceTopArrowCircle}>
                        <Ionicons name="arrow-down" size={16} color="#FFFFFF" />
                      </View>
                    </Animated.View>
                  )}

                  <Animated.View
                    style={
                      isHumanSeat && canRollDice && !isRolling
                        ? { transform: [{ scale: dockPulseAnim }] }
                        : undefined
                    }
                  >
                    <NovaDie
                      value={lastDiceRoll || 6}
                      size={42}
                      rolling={isRolling}
                      disabled={!isHumanSeat || !canRollDice}
                      onPress={isHumanSeat ? handleRoll : undefined}
                      theme={isHumanSeat ? equippedDie.previewTheme : 'nova'}
                    />
                  </Animated.View>
                  {isHumanSeat && canRollDice && !isRolling && (
                    <View style={styles.tapPillOverlay}>
                      <Text style={styles.tapPillText}>TAP TO ROLL 🎲</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <View style={styles.inactiveDiceSlot}>
                <Ionicons name="dice-outline" size={18} color="rgba(255,255,255,0.2)" />
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. TOP HEADER (Screen 14 · Live game + Exit & Rules Options) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setShowMenuModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={20} color={NOVA_COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>
            {isTwoPlayerMode ? '1v1 Diagonal Table' : 'Classic Table'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isTwoPlayerMode ? 'Red vs Yellow · Diagonal' : `Round 0${roundNumber} · 4 Players`}
          </Text>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.rulesBtn}
            onPress={() => setShowRulesModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="help-circle-outline" size={16} color={NOVA_COLORS.gold} />
            <Text style={styles.rulesBtnText}>Rules</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exitBtn}
            onPress={handlePromptExit}
            activeOpacity={0.7}
          >
            <Ionicons name="exit-outline" size={15} color="#FFFFFF" />
            <Text style={styles.exitBtnText}>Exit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. TOP OPPONENTS ROW (Aligned directly over Green Home & Yellow Home) */}
      <View style={styles.playersRow}>
        {/* Top-Left Slot (Seat 1 in 4P mode, Hidden spacer in 2P mode) */}
        {!isTwoPlayerMode ? (
          renderPlayerCard(1, p1, getSeatVisual(1).hex, getSeatVisual(1).name)
        ) : (
          <View style={[styles.playerCardContainer, styles.playerCardSpacer]} />
        )}

        {/* Top-Right Slot (Seat 2 — DIAGONAL) */}
        {renderPlayerCard(
          2,
          p2,
          getSeatVisual(2).hex,
          getSeatVisual(2).name,
          isTwoPlayerMode ? 'DIAGONAL' : undefined
        )}
      </View>

      {/* 3. CENTER LUDO BOARD (With Dynamic Rotated Home Colors & Active Profile Badge) */}
      <View style={styles.boardWrapper}>
        <LudoBoardSvg
          size={BOARD_SIZE}
          gameState={gameState}
          validMoves={gameState.validMoves}
          colorOffset={boardColorOffset}
          hoppingToken={hoppingToken}
          onSelectToken={(seatIndex, tokenId) => {
            handleSelectToken(seatIndex, tokenId);
          }}
        />

        {/* ACTIVE PLAYER PROFILE BADGE ON MATCHING COLOR HOME CORNER (Ludo Star Style) */}
        <View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              width: 30,
              height: 30,
              borderRadius: 15,
              borderWidth: 2,
              borderColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 25,
              elevation: 6,
              backgroundColor: getSeatVisual(currentTurnSeat).hex,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.55,
              shadowRadius: 5,
            },
            currentTurnSeat === 0 && { bottom: 8, left: 8 },
            currentTurnSeat === 1 && { top: 8, left: 8 },
            currentTurnSeat === 2 && { top: 8, right: 8 },
            currentTurnSeat === 3 && { bottom: 8, right: 8 },
          ]}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '900' }}>
            {(activeSeatPlayer?.username || (currentTurnSeat === 0 ? profile?.username || 'Y' : 'P'))
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>

        {/* FLOATING NON-SHIFTING CELEBRATION & HINT BANNERS */}
        {(celebrateSix || captureBanner || tacticalHint || activeSpeech) && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 8,
              left: 10,
              right: 10,
              alignItems: 'center',
              zIndex: 50,
              gap: 4,
            }}
          >
            {celebrateSix && (
              <View style={[styles.celebrationBanner, { backgroundColor: 'rgba(13, 16, 30, 0.92)' }]}>
                <Text style={styles.celebrationBannerText}>🎉 SIX! Roll again! ⚡</Text>
              </View>
            )}
            {captureBanner && (
              <View style={[styles.captureBanner, { backgroundColor: 'rgba(13, 16, 30, 0.92)' }]}>
                <Text style={styles.captureBannerText}>{captureBanner}</Text>
              </View>
            )}
            {tacticalHint && (
              <View style={[styles.celebrationBanner, { backgroundColor: 'rgba(13, 16, 30, 0.92)' }]}>
                <Text style={styles.celebrationBannerText}>{tacticalHint}</Text>
              </View>
            )}
            {activeSpeech && (
              <View style={[styles.speechBubble, { backgroundColor: 'rgba(48, 37, 78, 0.95)' }]}>
                <Text style={styles.speechBubbleText}>💬 {activeSpeech.sender}: {activeSpeech.text}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* 4. BOTTOM OPPONENTS ROW */}
      <View style={styles.playersRow}>
        {/* Bottom-Left Slot (Player 0 / You — Seat 0, dynamically rotated color!) */}
        {renderPlayerCard(
          0,
          p0,
          getSeatVisual(0).hex,
          getSeatVisual(0).name,
          isTwoPlayerMode ? `YOU (${getSeatVisual(0).name})` : undefined
        )}

        {/* Bottom-Right Slot (Player 3 in 4P mode, Hidden spacer in 2P mode) */}
        {!isTwoPlayerMode ? (
          renderPlayerCard(3, p3, getSeatVisual(3).hex, getSeatVisual(3).name)
        ) : (
          <View style={[styles.playerCardContainer, styles.playerCardSpacer]} />
        )}
      </View>

      {/* 4.2. 1-TAP QUICK-MOVE ASSIST BAR (Deduplicated so identical base moves show 1 clean button) */}
      {isMyTurn && gameState.turnPhase === 'SELECT_TOKEN' && gameState.validMoves.length > 0 && (
        <View style={{ marginVertical: 2 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 2 }}>
            {gameState.validMoves
              .filter((m, idx, arr) => arr.findIndex((x) => x.fromStep === m.fromStep && x.toStep === m.toStep) === idx)
              .map((m) => {
                const label = m.isFinish
                  ? `👑 Finish Token #${m.tokenId + 1}`
                  : m.capturesToken
                  ? `⚔️ Capture with #${m.tokenId + 1}`
                  : m.isEntry
                  ? `🚀 Deploy from Base`
                  : `♟️ Move Token #${m.tokenId + 1} (→${m.toStep})`;
                return (
                <TouchableOpacity
                  key={`qm_${m.tokenId}`}
                  onPress={() => handleSelectToken(currentTurnSeat, m.tokenId)}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: m.capturesToken
                      ? 'rgba(255, 71, 87, 0.28)'
                      : m.isFinish
                      ? 'rgba(255, 211, 123, 0.28)'
                      : 'rgba(131, 230, 192, 0.22)',
                    borderWidth: 1.5,
                    borderColor: m.capturesToken
                      ? '#ff4757'
                      : m.isFinish
                      ? NOVA_COLORS.accentGold
                      : NOVA_COLORS.accentMint,
                    borderRadius: 10,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* 4.5. BOOSTERS & QUICK REACTIONS BAR */}
      <View style={styles.boostersAndReactionsRow}>
        <View style={styles.boostersGroup}>
          <TouchableOpacity
            style={[styles.boosterBtn, (!isMyTurn || gems < 1) && styles.boosterBtnDisabled]}
            onPress={() => handleUsePowerUp('REROLL')}
            activeOpacity={0.7}
          >
            <Text style={styles.boosterEmoji}>⚡</Text>
            <Text style={styles.boosterText}>Reroll 1◇</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.boosterBtn, (!isMyTurn || gems < 2) && styles.boosterBtnDisabled]}
            onPress={() => handleUsePowerUp('MAGIC_SIX')}
            activeOpacity={0.7}
          >
            <Text style={styles.boosterEmoji}>🎯</Text>
            <Text style={styles.boosterText}>Six 2◇</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.boosterBtn, (!isMyTurn || gems < 1) && styles.boosterBtnDisabled]}
            onPress={() => handleUsePowerUp('SHIELD')}
            activeOpacity={0.7}
          >
            <Text style={styles.boosterEmoji}>🛡️</Text>
            <Text style={styles.boosterText}>Shield 1◇</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.boosterBtn, { borderColor: NOVA_COLORS.accentGold }]}
            onPress={() => setShowDiceSkinModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.boosterEmoji}>🎲</Text>
            <Text style={[styles.boosterText, { color: NOVA_COLORS.accentGold }]}>Skin</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.boosterBtn, { borderColor: NOVA_COLORS.accentMint }]}
            onPress={handleTacticalHint}
            activeOpacity={0.7}
          >
            <Text style={styles.boosterEmoji}>🧠</Text>
            <Text style={[styles.boosterText, { color: NOVA_COLORS.accentMint }]}>Hint</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.reactionsScroll}
        >
          {['😂', '😡', '🔥', '👑', '🎲', '💎', '👏'].map((em) => (
            <TouchableOpacity
              key={em}
              style={styles.reactionPill}
              onPress={() => triggerReaction(em)}
              activeOpacity={0.6}
            >
              <Text style={styles.reactionEmoji}>{em}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* TURN TIMER PROGRESS BAR */}
      <View style={styles.timerProgressContainer}>
        <View style={styles.timerMetaRow}>
          <View style={styles.timerMetaLeft}>
            <View
              style={[
                styles.timerPulsingDot,
                {
                  backgroundColor:
                    turnSecondsLeft <= 3
                      ? '#ff4757'
                      : turnSecondsLeft <= 6
                      ? '#ffd700'
                      : '#2ed573',
                },
              ]}
            />
            <Text style={styles.timerLabel}>
              {isMyTurn ? 'YOUR TURN' : `${gameState.players[currentTurnSeat]?.username || 'PLAYER'}'S TURN`}
            </Text>
          </View>
          <Text
            style={[
              styles.timerCountdown,
              turnSecondsLeft <= 3 && styles.timerCountdownCritical,
            ]}
          >
            {turnSecondsLeft < 10 ? `0${turnSecondsLeft}s` : `${turnSecondsLeft}s`}
          </Text>
        </View>
        <View style={styles.timerTrack}>
          <View
            style={[
              styles.timerFill,
              {
                width: `${Math.max(0, Math.min(100, (turnSecondsLeft / 15) * 100))}%`,
                backgroundColor:
                  turnSecondsLeft <= 3
                    ? '#ff4757'
                    : turnSecondsLeft <= 6
                    ? '#ffd700'
                    : '#2ed573',
              },
            ]}
          />
        </View>
      </View>

      {/* 5. TURN ACTION CONSOLE (Left side tappable to roll when it's your turn) */}
      <View style={styles.actionConsole}>
        <TouchableOpacity
          style={styles.actionConsoleLeft}
          activeOpacity={canRollDice ? 0.7 : 1}
          onPress={canRollDice ? handleRoll : undefined}
        >
          <View
            style={[
              styles.turnRoleDot,
              {
                backgroundColor:
                  currentTurnSeat === 0
                    ? NOVA_COLORS.coral
                    : currentTurnSeat === 1
                    ? NOVA_COLORS.mint
                    : currentTurnSeat === 2
                    ? NOVA_COLORS.gold
                    : NOVA_COLORS.blue,
              },
            ]}
          />
          <View style={styles.actionTextWrap}>
            <Text style={styles.statusTitle}>{getStatusMessage()}</Text>
            <Text style={styles.statusSubtitle}>{getSubStatus()}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actionRightControls}>
          <TouchableOpacity
            style={[styles.autoRollToggle, gameSpeed === 2 && styles.autoRollToggleActive]}
            onPress={() => {
              sfxEngine.playTokenStep();
              toggleGameSpeed();
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.autoRollText, gameSpeed === 2 && styles.autoRollTextActive]}>
              {gameSpeed === 2 ? '2x 🚀' : '1x'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.autoRollToggle, autoRollEnabled && styles.autoRollToggleActive]}
            onPress={() => {
              sfxEngine.playTokenStep();
              setAutoRollEnabled((prev) => !prev);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={autoRollEnabled ? 'flash' : 'flash-outline'}
              size={12}
              color={autoRollEnabled ? '#0d101e' : NOVA_COLORS.textMuted}
            />
            <Text style={[styles.autoRollText, autoRollEnabled && styles.autoRollTextActive]}>
              {autoRollEnabled ? 'Auto ⚡' : 'Auto'}
            </Text>
          </TouchableOpacity>

          {canRollDice && (
            <TouchableOpacity
              style={styles.bottomRollBtn}
              onPress={handleRoll}
              activeOpacity={0.8}
            >
              <Ionicons name="dice" size={16} color="#0d101e" />
              <Text style={styles.bottomRollBtnText}>Roll</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 6. BOTTOM BAR (Chat, Gifts & Voice) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() => setShowChatModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={20} color={NOVA_COLORS.accentPurple} />
          <Text style={styles.chatBtnText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() => setShowGiftModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="gift-outline" size={20} color={NOVA_COLORS.accentGold} />
          <Text style={[styles.chatBtnText, { color: NOVA_COLORS.accentGold }]}>Throw Gift</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.voiceBtn}
          onPress={() => setVoiceOn(!voiceOn)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={voiceOn ? 'mic' : 'mic-off-outline'}
            size={20}
            color={voiceOn ? NOVA_COLORS.accentMint : NOVA_COLORS.textSecondary}
          />
          <Text
            style={[
              styles.voiceBtnText,
              voiceOn && { color: NOVA_COLORS.accentMint },
            ]}
          >
            {voiceOn ? 'Voice on' : 'Voice off'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ======================================================= */}
      {/* SCREEN 15 · GAME CHAT MODAL                             */}
      {/* ======================================================= */}
      <Modal visible={showChatModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.chatSheet}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Table chat</Text>
                <Text style={styles.sheetSubtitle}>Be kind. Play fair. Have fun.</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowChatModal(false)}
                style={styles.sheetCloseBtn}
              >
                <Ionicons name="close" size={22} color={NOVA_COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Quick chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
              {['Good luck!', 'Nice move!', 'Well played', 'That was a close one!', 'The comeback starts now.'].map(
                (chip, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.chip}
                    onPress={() => handleSendChat(chip)}
                  >
                    <Text style={styles.chipText}>{chip}</Text>
                  </TouchableOpacity>
                )
              )}
            </ScrollView>

            {/* Messages stream */}
            <ScrollView style={styles.messagesList} showsVerticalScrollIndicator={false}>
              {chatMessages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.msgBubble,
                    msg.sender === 'YOU' ? styles.myMsg : styles.theirMsg,
                  ]}
                >
                  <Text style={styles.msgSender}>{msg.sender}</Text>
                  <Text style={styles.msgText}>{msg.text}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Message input */}
            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatTextInput}
                placeholder="Send a friendly message…"
                placeholderTextColor={NOVA_COLORS.textMuted}
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={() => handleSendChat(chatInput)}
              />
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={() => handleSendChat(chatInput)}
              >
                <Ionicons name="send" size={18} color="#0d101e" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================= */}
      {/* SCREEN 16 · GAME MENU MODAL                             */}
      {/* ======================================================= */}
      <Modal visible={showMenuModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.menuCard}>
            <Text style={styles.menuTitle}>⚙️ Match Menu</Text>
            <Text style={styles.menuSubtitle}>
              Match is live · Select an action:
            </Text>

            <NovaButton
              title="▶️ Continue Playing"
              variant="primary"
              onPress={() => setShowMenuModal(false)}
              style={styles.menuBtn}
            />

            <NovaButton
              title="🔄 Restart Match"
              variant="gold"
              onPress={handleRestartMatch}
              style={styles.menuBtn}
            />

            <NovaButton
              title="📜 Game Rules & Star Zones"
              variant="outline"
              onPress={() => {
                setShowMenuModal(false);
                setShowRulesModal(true);
              }}
              style={styles.menuBtn}
            />

            <NovaButton
              title={`🎲 Change Dice Skin (${equippedDie.name})`}
              variant="outline"
              onPress={() => {
                setShowMenuModal(false);
                setShowDiceSkinModal(true);
              }}
              style={styles.menuBtn}
            />

            <NovaButton
              title={`🎨 Change Board Theme (${equippedBoard.name})`}
              variant="outline"
              onPress={() => {
                setShowMenuModal(false);
                setShowBoardSkinModal(true);
              }}
              style={styles.menuBtn}
            />

            {/* Sound effects toggle */}
            <View style={[styles.settingRow, { marginTop: 12 }]}>
              <Text style={styles.settingLabel}>Sound effects</Text>
              <TouchableOpacity
                style={[styles.togglePill, soundEffects && styles.togglePillActive]}
                onPress={() => toggleSetting('soundEffects')}
              >
                <Text style={styles.togglePillText}>{soundEffects ? 'On' : 'Off'}</Text>
              </TouchableOpacity>
            </View>

            {/* Game music toggle */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Game music</Text>
              <TouchableOpacity
                style={[styles.togglePill, gameMusic && styles.togglePillActive]}
                onPress={() => toggleSetting('gameMusic')}
              >
                <Text style={styles.togglePillText}>{gameMusic ? 'On' : 'Off'}</Text>
              </TouchableOpacity>
            </View>

            {/* Auto-Roll toggle */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Auto Roll</Text>
              <TouchableOpacity
                style={[styles.togglePill, autoRollEnabled && styles.togglePillActive]}
                onPress={() => setAutoRollEnabled((prev) => !prev)}
              >
                <Text style={styles.togglePillText}>{autoRollEnabled ? 'Enabled ⚡' : 'Manual'}</Text>
              </TouchableOpacity>
            </View>

            <NovaButton
              title="🚪 Exit Game"
              variant="danger"
              onPress={() => {
                setShowMenuModal(false);
                handlePromptExit();
              }}
              style={styles.menuBtn}
            />

            <Text style={styles.menuForfeitHint}>
              Exiting returns you safely to the main lobby.
            </Text>
          </View>
        </View>
      </Modal>

      {/* ======================================================= */}
      {/* QUICK RULES MODAL                                       */}
      {/* ======================================================= */}
      <Modal visible={showRulesModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.rulesCard}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Royal Ludo Rules</Text>
                <Text style={styles.sheetSubtitle}>Master the board and claim the crown</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowRulesModal(false)}
                style={styles.sheetCloseBtn}
              >
                <Ionicons name="close" size={22} color={NOVA_COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.rulesList} showsVerticalScrollIndicator={false}>
              <View style={styles.ruleItem}>
                <Text style={styles.ruleEmoji}>🎲</Text>
                <View style={styles.ruleTextWrap}>
                  <Text style={styles.ruleHeading}>Roll a 6 to Enter</Text>
                  <Text style={styles.ruleDesc}>
                    Tokens stay safe in the yard until you roll a 6 to move them onto the track.
                  </Text>
                </View>
              </View>

              <View style={styles.ruleItem}>
                <Text style={styles.ruleEmoji}>⚡</Text>
                <View style={styles.ruleTextWrap}>
                  <Text style={styles.ruleHeading}>Bonus Turns</Text>
                  <Text style={styles.ruleDesc}>
                    Rolling a 6 or capturing an opponent's piece awards an immediate extra roll!
                  </Text>
                </View>
              </View>

              <View style={styles.ruleItem}>
                <Text style={styles.ruleEmoji}>🛡️</Text>
                <View style={styles.ruleTextWrap}>
                  <Text style={styles.ruleHeading}>Safe Star Zones</Text>
                  <Text style={styles.ruleDesc}>
                    The 4 starting tiles and 4 Star (🌟) tiles are safe havens. Tokens on these tiles cannot be captured.
                  </Text>
                </View>
              </View>

              <View style={styles.ruleItem}>
                <Text style={styles.ruleEmoji}>⚔️</Text>
                <View style={styles.ruleTextWrap}>
                  <Text style={styles.ruleHeading}>Capturing Opponents</Text>
                  <Text style={styles.ruleDesc}>
                    Landing on an unprotected opponent sends their token back to base and gives you a free turn!
                  </Text>
                </View>
              </View>

              <View style={styles.ruleItem}>
                <Text style={styles.ruleEmoji}>👑</Text>
                <View style={styles.ruleTextWrap}>
                  <Text style={styles.ruleHeading}>Victory Condition</Text>
                  <Text style={styles.ruleDesc}>
                    First player to navigate all 4 tokens around the board and into the home triangle wins the match!
                  </Text>
                </View>
              </View>

              <View style={styles.ruleItem}>
                <Text style={styles.ruleEmoji}>🚫</Text>
                <View style={styles.ruleTextWrap}>
                  <Text style={styles.ruleHeading}>Three 6s Penalty</Text>
                  <Text style={styles.ruleDesc}>
                    Rolling three consecutive 6s forfeits your turn to keep matches fair and competitive.
                  </Text>
                </View>
              </View>
            </ScrollView>

            <NovaButton
              title="Got It! Back to Match"
              variant="primary"
              onPress={() => setShowRulesModal(false)}
              style={styles.ruleCloseBtn}
            />
          </View>
        </View>
      </Modal>

      {/* ======================================================= */}
      {/* IN-GAME DICE SKIN CUSTOMIZER MODAL                      */}
      {/* ======================================================= */}
      <Modal visible={showDiceSkinModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.rulesCard}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>🎲 Change Dice Skin</Text>
                <Text style={styles.sheetSubtitle}>
                  Equipped: {equippedDie.name} ({equippedDie.rarity})
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowDiceSkinModal(false)}
                style={styles.sheetCloseBtn}
              >
                <Ionicons name="close" size={22} color={NOVA_COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 340, marginVertical: 10 }} showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {dice.map((item, idx) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleSelectDiceSkinInGame(item)}
                    activeOpacity={0.8}
                    style={{
                      width: '48%',
                      backgroundColor: item.equipped ? '#1d233d' : '#13182b',
                      borderRadius: 14,
                      padding: 12,
                      marginBottom: 10,
                      alignItems: 'center',
                      borderWidth: 1.5,
                      borderColor: item.equipped ? NOVA_COLORS.accentGold : '#222943',
                    }}
                  >
                    <NovaDie value={(idx % 6) + 1} size={42} theme={item.previewTheme} />
                    <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800', marginTop: 6 }}>
                      {item.name}
                    </Text>
                    <Text
                      style={{
                        color: item.equipped
                          ? NOVA_COLORS.accentMint
                          : item.unlocked
                          ? NOVA_COLORS.accentPurple
                          : NOVA_COLORS.accentGold,
                        fontSize: 11,
                        fontWeight: '700',
                        marginTop: 2,
                      }}
                    >
                      {item.equipped
                        ? '✓ Equipped'
                        : item.unlocked
                        ? 'Tap to Equip'
                        : `◇ ${item.priceGems} / ◈ ${item.priceCoins}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <NovaButton
              title="Done · Back to Match"
              variant="primary"
              onPress={() => setShowDiceSkinModal(false)}
              style={styles.ruleCloseBtn}
            />
          </View>
        </View>
      </Modal>

      {/* ======================================================= */}
      {/* IN-GAME BOARD THEME CUSTOMIZER MODAL                    */}
      {/* ======================================================= */}
      <Modal visible={showBoardSkinModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.rulesCard}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>🎨 Change Board Theme</Text>
                <Text style={styles.sheetSubtitle}>
                  Equipped: {equippedBoard.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowBoardSkinModal(false)}
                style={styles.sheetCloseBtn}
              >
                <Ionicons name="close" size={22} color={NOVA_COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 320, marginVertical: 10 }} showsVerticalScrollIndicator={false}>
              {boards.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  onPress={() => {
                    if (b.unlocked) {
                      sfxEngine.playTokenStep();
                      equipBoard(b.id);
                    } else if (b.priceGems && gems >= b.priceGems) {
                      spendGems(b.priceGems);
                      unlockBoard(b.id);
                      equipBoard(b.id);
                      sfxEngine.playPowerUp();
                    } else if (b.priceCoins && gold >= b.priceCoins) {
                      spendGold(b.priceCoins);
                      unlockBoard(b.id);
                      equipBoard(b.id);
                      sfxEngine.playPowerUp();
                    } else {
                      Alert.alert('Unlock Board', `Need ${b.priceGems || 30} gems or ${b.priceCoins || 3000} coins.`);
                    }
                  }}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: b.equipped ? '#1d233d' : '#13182b',
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderWidth: 1.5,
                    borderColor: b.equipped ? NOVA_COLORS.accentGold : '#222943',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: b.boardBg || '#101827',
                        borderWidth: 2,
                        borderColor: b.borderColor || NOVA_COLORS.accentGold,
                      }}
                    />
                    <View>
                      <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '800' }}>{b.name}</Text>
                      {b.description && (
                        <Text style={{ color: NOVA_COLORS.textSecondary, fontSize: 11 }}>{b.description}</Text>
                      )}
                    </View>
                  </View>
                  <Text
                    style={{
                      color: b.equipped ? NOVA_COLORS.accentMint : NOVA_COLORS.accentGold,
                      fontSize: 11,
                      fontWeight: '800',
                    }}
                  >
                    {b.equipped ? '✓ Equipped' : b.unlocked ? 'Equip' : `◇ ${b.priceGems}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <NovaButton
              title="Done · Back to Match"
              variant="primary"
              onPress={() => setShowBoardSkinModal(false)}
              style={styles.ruleCloseBtn}
            />
          </View>
        </View>
      </Modal>

      {/* ======================================================= */}
      {/* INTERACTIVE OPPONENT GIFT LAUNCHER MODAL                */}
      {/* ======================================================= */}
      <Modal visible={showGiftModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.rulesCard}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>🎁 Throw Interactive Gift</Text>
                <Text style={styles.sheetSubtitle}>Send a fun animated reaction across the board!</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowGiftModal(false)}
                style={styles.sheetCloseBtn}
              >
                <Ionicons name="close" size={22} color={NOVA_COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: 10 }}>
              {[
                { emoji: '🍅', label: 'Tomato Splat', reply: 'Hey! Ketchup in my eye! 🍅' },
                { emoji: '🥊', label: 'Boxing Glove', reply: 'Ouch! That packed a punch! 🥊' },
                { emoji: '💣', label: 'Royal Bomb', reply: 'Boom! Watch out! 💣' },
                { emoji: '☕', label: 'Hot Chai / Coffee', reply: 'Thanks for the chai! ☕🔥' },
                { emoji: '🌹', label: 'Royal Rose', reply: 'Aww, thank you! 💖🌹' },
                { emoji: '👑', label: 'Golden Crown', reply: 'All hail the Ludo King! 👑' },
              ].map((g) => (
                <TouchableOpacity
                  key={g.emoji}
                  onPress={() => {
                    setShowGiftModal(false);
                    triggerReaction(g.emoji);
                    const oppName = isTwoPlayerMode ? p2.username : p1.username;
                    setActiveSpeech({ sender: oppName.toUpperCase(), text: g.reply });
                    setTimeout(() => setActiveSpeech(null), 3200);
                  }}
                  activeOpacity={0.8}
                  style={{
                    width: '31%',
                    backgroundColor: '#13182b',
                    borderRadius: 14,
                    padding: 12,
                    marginBottom: 10,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#30254e',
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{g.emoji}</Text>
                  <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800', marginTop: 6, textAlign: 'center' }}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <NovaButton
              title="Close"
              variant="dark"
              onPress={() => setShowGiftModal(false)}
              style={styles.ruleCloseBtn}
            />
          </View>
        </View>
      </Modal>

      {/* FLOATING EMOJI ANIMATED OVERLAY */}
      {floatingEmojis.map((item) => (
        <Animated.View
          key={item.id}
          pointerEvents="none"
          style={[
            styles.floatingEmoji,
            {
              opacity: item.anim.interpolate({
                inputRange: [0, 0.2, 0.75, 1],
                outputRange: [0, 1, 1, 0],
              }),
              transform: [
                {
                  translateY: item.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -160],
                  }),
                },
                {
                  scale: item.anim.interpolate({
                    inputRange: [0, 0.3, 1],
                    outputRange: [0.6, 1.4, 1.1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.floatingEmojiText}>{item.emoji}</Text>
        </Animated.View>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NOVA_COLORS.bg,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: NOVA_COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: NOVA_COLORS.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: NOVA_COLORS.accentGold,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 124, 124, 0.22)',
    borderWidth: 1,
    borderColor: NOVA_COLORS.coral,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  exitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prizeBadge: {
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginRight: 6,
  },
  roundBadge: {
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  playersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
    paddingTop: 14,
  },
  playerCardContainer: {
    width: '48%',
    position: 'relative',
  },
  turnArrowContainer: {
    position: 'absolute',
    top: -20,
    alignSelf: 'center',
    zIndex: 30,
  },
  turnArrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
    elevation: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
  },
  turnArrowText: {
    color: '#0d101e',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  playerCard: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 14,
    paddingHorizontal: 7,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.8,
    borderColor: 'transparent',
    minHeight: 52,
  },
  playerCardActive: {
    backgroundColor: '#1f2642',
    elevation: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
  },
  playerCardSpacer: {
    opacity: 0,
  },
  playerCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginRight: 4,
  },
  playerDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  playerDotInitial: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  playerMeta: {
    flex: 1,
    minWidth: 0,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playerName: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  playerStatus: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  statusActive: {
    color: NOVA_COLORS.accentPurple,
    fontWeight: '700',
  },
  playerDicePod: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDieWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeDieWrapClickable: {
    transform: [{ scale: 1.05 }],
  },
  diceTopArrowWrap: {
    position: 'absolute',
    top: -28,
    alignSelf: 'center',
    zIndex: 40,
  },
  diceTopArrowCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2ECC71',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.85,
    shadowRadius: 5,
    elevation: 8,
  },
  tapPillOverlay: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: NOVA_COLORS.gold,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#0d101e',
    elevation: 5,
  },
  tapPillText: {
    color: '#0d101e',
    fontSize: 8,
    fontWeight: '900',
  },
  inactiveDiceSlot: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  actionConsole: {
    backgroundColor: NOVA_COLORS.surfaceBadge,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionConsoleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  turnRoleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  bottomRollBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NOVA_COLORS.gold,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 9,
    gap: 4,
  },
  bottomRollBtnText: {
    color: '#0d101e',
    fontSize: 12,
    fontWeight: '900',
  },
  actionCard: {
    backgroundColor: NOVA_COLORS.surfaceBadge,
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dieWrapper: {
    marginRight: 12,
  },
  actionTextWrap: {
    flex: 1,
  },
  statusTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 1,
  },
  statusSubtitle: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 11,
    fontWeight: '600',
  },
  tapPrompt: {
    padding: 6,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 6,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatBtnText: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceBtnText: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  chatSheet: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '65%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  sheetSubtitle: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  sheetCloseBtn: {
    padding: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  chip: {
    backgroundColor: NOVA_COLORS.surfaceBadge,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipText: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 12,
    fontWeight: '600',
  },
  messagesList: {
    maxHeight: 180,
    marginBottom: 12,
  },
  msgBubble: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '80%',
  },
  myMsg: {
    backgroundColor: NOVA_COLORS.accentPurple,
    alignSelf: 'flex-end',
  },
  theirMsg: {
    backgroundColor: NOVA_COLORS.surfaceElevated,
    alignSelf: 'flex-start',
  },
  msgSender: {
    fontSize: 10,
    fontWeight: '700',
    color: NOVA_COLORS.textMuted,
    marginBottom: 2,
  },
  msgText: {
    fontSize: 13,
    color: NOVA_COLORS.textDark,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: NOVA_COLORS.surfaceElevated,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    color: NOVA_COLORS.textPrimary,
    fontSize: 14,
    marginRight: 10,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: NOVA_COLORS.accentPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCard: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  menuTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  menuSubtitle: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: NOVA_COLORS.surfaceElevated,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  settingLabel: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  togglePill: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  togglePillActive: {
    backgroundColor: NOVA_COLORS.accentPurple,
  },
  togglePillText: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  menuBtn: {
    marginTop: 10,
  },
  menuForfeitHint: {
    color: NOVA_COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
  },
  speechBubble: {
    alignSelf: 'center',
    backgroundColor: '#30254e',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: NOVA_COLORS.accentPurple,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  speechBubbleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  boostersAndReactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
    gap: 8,
  },
  boostersGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  boosterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191e33',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#30254e',
    gap: 4,
  },
  boosterBtnDisabled: {
    opacity: 0.45,
  },
  boosterEmoji: {
    fontSize: 13,
  },
  boosterText: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 10,
    fontWeight: '800',
  },
  reactionsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 6,
  },
  reactionPill: {
    backgroundColor: '#191e33',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#30254e',
  },
  reactionEmoji: {
    fontSize: 16,
  },
  floatingEmoji: {
    position: 'absolute',
    bottom: 200,
    alignSelf: 'center',
    zIndex: 999,
  },
  floatingEmojiText: {
    fontSize: 48,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rulesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderWidth: 1,
    borderColor: NOVA_COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  rulesBtnText: {
    color: NOVA_COLORS.gold,
    fontSize: 12,
    fontWeight: '800',
  },
  turnAnnouncementBanner: {
    marginVertical: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  turnBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  turnBannerPulsingDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  turnBannerMainText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  turnBannerActionPill: {
    backgroundColor: NOVA_COLORS.gold,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  turnBannerActionPillText: {
    color: '#0d101e',
    fontSize: 9,
    fontWeight: '900',
  },
  celebrationBanner: {
    backgroundColor: 'rgba(255, 215, 0, 0.22)',
    borderWidth: 1.5,
    borderColor: NOVA_COLORS.gold,
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginVertical: 2,
  },
  celebrationBannerText: {
    color: NOVA_COLORS.gold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  captureBanner: {
    backgroundColor: 'rgba(255, 71, 87, 0.25)',
    borderWidth: 1.5,
    borderColor: '#ff4757',
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginVertical: 2,
  },
  captureBannerText: {
    color: '#ff4757',
    fontSize: 12,
    fontWeight: '900',
  },
  timerProgressContainer: {
    backgroundColor: '#13182b',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: '#222943',
  },
  timerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timerMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerPulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timerLabel: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timerCountdown: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '800',
  },
  timerCountdownCritical: {
    color: '#ff4757',
  },
  timerTrack: {
    height: 4,
    backgroundColor: '#222943',
    borderRadius: 2,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  autoRollToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191e33',
    borderWidth: 1,
    borderColor: '#30254e',
    paddingHorizontal: 7,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 3,
  },
  autoRollToggleActive: {
    backgroundColor: NOVA_COLORS.gold,
    borderColor: NOVA_COLORS.gold,
  },
  autoRollText: {
    color: NOVA_COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  autoRollTextActive: {
    color: '#0d101e',
    fontWeight: '900',
  },
  rulesCard: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 20,
    padding: 18,
    width: '92%',
    maxHeight: '82%',
    borderWidth: 1.5,
    borderColor: '#30254e',
  },
  rulesList: {
    marginVertical: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  ruleEmoji: {
    fontSize: 22,
  },
  ruleTextWrap: {
    flex: 1,
  },
  ruleHeading: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  ruleDesc: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  ruleCloseBtn: {
    marginTop: 6,
  },
});
