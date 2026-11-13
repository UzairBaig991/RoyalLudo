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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLOR_MAP } from '../../src/theme/colors';
import { LudoBoardSvg } from '../../src/components/board/LudoBoardSvg';
import { useGameStore } from '../../src/store/useGameStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useEconomyStore } from '../../src/store/useEconomyStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// Scaled so the entire screen fits 100% without any scrollbars
const BOARD_SIZE = Math.min(SCREEN_WIDTH - 20, SCREEN_HEIGHT * 0.44, 380);

export default function LudoStarGamePlayScreen() {
  const router = useRouter();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { profile } = useAuthStore();
  const { gems, debitGems, addGold } = useEconomyStore();
  const {
    gameState,
    isRolling,
    lastDiceRoll,
    rollDice,
    selectAndMoveToken,
    triggerBotTurn,
    resetGame,
  } = useGameStore();

  const [activeToast, setActiveToast] = useState<string>('Match in progress!');
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showChatPicker, setShowChatPicker] = useState<boolean>(false);
  const [activeSpeechBubble, setActiveSpeechBubble] = useState<string | null>('👑');
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string }[]>([]);
  const [bounceAnim] = useState(new Animated.Value(0));
  const [turnSecondsLeft, setTurnSecondsLeft] = useState<number>(15);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  const [giftTarget, setGiftTarget] = useState<string | null>(null);
  const [comboBanner, setComboBanner] = useState<string | null>(null);

  const showCombo = (text: string) => {
    setComboBanner(text);
    setTimeout(() => setComboBanner(null), 1800);
  };

  // Bouncing arrow animation for active turn
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -6, duration: 400, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  }, [bounceAnim]);

  // Turn Countdown Timer (15s) with Auto-Play support
  useEffect(() => {
    setTurnSecondsLeft(15);
    const interval = setInterval(() => {
      setTurnSecondsLeft((prev) => {
        if (prev <= 1) {
          // If time expires on user turn, trigger auto move or pass
          if (isMyTurn) {
            if (canRollDice) {
              handleRoll();
            } else if (gameState?.turnPhase === 'SELECT_TOKEN' && gameState.validMoves.length > 0) {
              handleSelectToken(0, gameState.validMoves[0].tokenId);
            }
          }
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState?.currentTurnSeat, gameState?.turnPhase, isMyTurn, canRollDice]);

  // Immediate Auto-Play Trigger
  useEffect(() => {
    if (isAutoPlay && isMyTurn) {
      if (canRollDice) {
        const t = setTimeout(handleRoll, 350);
        return () => clearTimeout(t);
      } else if (gameState?.turnPhase === 'SELECT_TOKEN' && gameState.validMoves.length > 0) {
        const t = setTimeout(() => {
          handleSelectToken(0, gameState.validMoves[0].tokenId);
        }, 400);
        return () => clearTimeout(t);
      }
    }
  }, [isAutoPlay, isMyTurn, canRollDice, gameState?.turnPhase, gameState?.validMoves]);

  // Handle Game Over
  useEffect(() => {
    if (gameState?.turnPhase === 'GAME_OVER') {
      const winner = gameState.rankings[0];
      const isWinner = winner && (winner.username === profile?.username || winner.username === 'Govind' || winner.username === 'You');
      if (isWinner) {
        addGold(2000);
      }
      setTimeout(() => {
        router.replace('/gameplay/result');
      }, 1200);
    }
  }, [gameState?.turnPhase, router]);

  if (!gameState) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingTitle}>Connecting to Arena...</Text>

    </SafeAreaView>
    );
  }

  const currentTurnSeat = gameState.currentTurnSeat;
  const activePlayer = gameState.players.find((p) => p.seatIndex === currentTurnSeat);
  const myPlayer = gameState.players.find((p) => p.seatIndex === 0);
  const isMyTurn = currentTurnSeat === 0;
  const canRollDice = isMyTurn && gameState.turnPhase === 'ROLL_DICE' && !isRolling;
  const canLuckyReroll = isMyTurn && gameState.turnPhase === 'SELECT_TOKEN' && !isRolling;

  const handleRoll = () => {
    if (canRollDice) {
      rollDice(0);
    }
  };

  const handleLuckyReroll = () => {
    if (!canLuckyReroll) {
      Alert.alert('Reroll Unavailable', 'You can only reroll immediately after rolling the dice on your turn!');
      return;
    }
    if (gems < 3) {
      Alert.alert('Need 3 Gems 💎', 'You need 3 gems to use the Lucky Reroll!');
      return;
    }
    debitGems(3);
    rollDice(0);
    setActiveToast('💎 Lucky Reroll used! Rerolling dice...');
  };

  const handleSelectToken = (seatIndex: number, tokenId: number) => {
    if (seatIndex === currentTurnSeat && gameState.turnPhase === 'SELECT_TOKEN') {
      selectAndMoveToken(seatIndex, tokenId);
    }
  };

  const sendEmoji = (emoji: string) => {
    const newId = Date.now();
    setFloatingEmojis((prev) => [...prev, { id: newId, emoji }]);
    setShowEmojiPicker(false);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== newId));
    }, 2500);
  };

  const sendChat = (message: string) => {
    setActiveSpeechBubble(message);
    setShowChatPicker(false);
    setTimeout(() => setActiveSpeechBubble('👑'), 4000);
  };

  const handleLeaveGame = () => {
    Alert.alert('Leave Game?', 'Leaving now counts as a forfeit.', [
      { text: 'Stay', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => {
          resetGame();
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  // Helper for 3D Beveled Dice Pips Display
  const renderDicePipsView = () => {
    if (isRolling) {
      return <Text style={{ fontSize: 26, transform: [{ rotate: '15deg' }] }}>🎲</Text>;
    }
    if (lastDiceRoll === null) {
      return <Text style={{ fontSize: 24 }}>👑</Text>;
    }

    const pip = (isRuby = false) => (
      <View
        style={{
          width: 8.5,
          height: 8.5,
          borderRadius: 4.5,
          backgroundColor: isRuby ? '#E74C3C' : '#1A202C',
          shadowColor: isRuby ? '#FF4136' : '#000',
          shadowOpacity: 0.6,
          shadowRadius: 2,
          elevation: 2,
        }}
      />
    );

    switch (lastDiceRoll) {
      case 1:
        return (
          <View style={{ alignItems: 'center', justifyContent: 'center', width: 36, height: 36 }}>
            {pip(true)}
          </View>
        );
      case 2:
        return (
          <View style={{ width: 36, height: 36, justifyContent: 'space-between', padding: 2 }}>
            <View style={{ alignItems: 'flex-start' }}>{pip()}</View>
            <View style={{ alignItems: 'flex-end' }}>{pip()}</View>
          </View>
        );
      case 3:
        return (
          <View style={{ width: 36, height: 36, justifyContent: 'space-between', padding: 2 }}>
            <View style={{ alignItems: 'flex-start' }}>{pip()}</View>
            <View style={{ alignItems: 'center' }}>{pip()}</View>
            <View style={{ alignItems: 'flex-end' }}>{pip()}</View>
          </View>
        );
      case 4:
        return (
          <View style={{ width: 36, height: 36, justifyContent: 'space-between', padding: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>{pip()}{pip()}</View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>{pip()}{pip()}</View>
          </View>
        );
      case 5:
        return (
          <View style={{ width: 36, height: 36, justifyContent: 'space-between', padding: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>{pip()}{pip()}</View>
            <View style={{ alignItems: 'center' }}>{pip()}</View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>{pip()}{pip()}</View>
          </View>
        );
      case 6:
        return (
          <View style={{ width: 36, height: 36, justifyContent: 'space-between', padding: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>{pip()}{pip()}</View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>{pip()}{pip()}</View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>{pip()}{pip()}</View>
          </View>
        );
      default:
        return <Text style={{ fontSize: 24 }}>👑</Text>;
    }
  };

  const timerColor = turnSecondsLeft > 7 ? '#27AE70' : turnSecondsLeft > 3 ? '#F5A623' : '#E74C4C';

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. TOP HEADER (Image 2 Screen 3 replica) */}
      <View style={styles.topHeader}>
        {/* Menu Icon */}
        <TouchableOpacity style={styles.topIconBtn} onPress={handleLeaveGame}>
          <Text style={{ fontSize: 18, color: '#FFF' }}>☰</Text>
        </TouchableOpacity>

        {/* INFO Pill */}
        <TouchableOpacity
          style={styles.infoPill}
          onPress={() => Alert.alert('Game Info', `Mode: ${gameState.mode.toUpperCase()}\nRules: 4 Tokens, Exact finish, Star safe cells.`)}
        >
          <Text style={styles.infoPillText}>INFO</Text>
        </TouchableOpacity>

        {/* WIN Trophy Pill */}
        <View style={styles.winPill}>
          <Text style={{ fontSize: 14, marginRight: 4 }}>🏆</Text>
          <Text style={styles.winPillText}>WIN 2,000</Text>
        </View>

        {/* Gems Pill */}
        <View style={styles.gemsPill}>
          <Text style={{ fontSize: 12, marginRight: 4 }}>💎</Text>
          <Text style={styles.gemsPillText}>{gems}</Text>
          <TouchableOpacity style={styles.plusSmallBtn} onPress={() => router.push('/profile')}>
            <Text style={styles.plusSmallText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Shop Cart */}
        <TouchableOpacity style={styles.topIconBtn} onPress={() => router.push('/profile')}>
          <Text style={{ fontSize: 16, color: '#FFF' }}>🛒</Text>
        </TouchableOpacity>
      </View>

      {/* 2. TOP OPPONENTS HUD ROW */}
      <View style={styles.topOpponentsRow}>
        {/* Player 2 (Green / Top-Left): Shivali Mahajan */}
        <TouchableOpacity
          style={[styles.playerPod, currentTurnSeat === 1 && styles.playerPodActive]}
          onPress={() => setGiftTarget('Shivali Mahajan')}
        >
          <View style={styles.avatarBorderGreen}>
            <Text style={{ fontSize: 20 }}>👩</Text>
          </View>
          <View style={styles.playerMeta}>
            <Text style={styles.playerName} numberOfLines={1}>
              {gameState.players[1]?.username || 'Shivali Mahajan'}
            </Text>
            <Text style={styles.playerTokensHome}>
              {gameState.players[1]?.tokensHome || 0}/4 🏁
            </Text>
          </View>
          <View style={styles.giftMiniBtn}>
            <Text style={{ fontSize: 13 }}>🎁</Text>
          </View>
        </TouchableOpacity>

        {/* Player 3 (Yellow / Top-Right): Sachin Kumar Sh */}
        {gameState.playerCount === 4 && (
          <TouchableOpacity style={[styles.playerPod, currentTurnSeat === 2 && styles.playerPodActive]} onPress={() => setGiftTarget('Sachin Kumar Sh')}>
            <View style={styles.avatarBorderYellow}>
              <Text style={{ fontSize: 20 }}>🧔</Text>
            </View>
            <View style={styles.playerMeta}>
              <Text style={styles.playerName} numberOfLines={1}>
                {gameState.players[2]?.username || 'Sachin Kumar Sh'}
              </Text>
              <Text style={styles.playerTokensHome}>
                {gameState.players[2]?.tokensHome || 0}/4 🏁
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* 3. LUDO BOARD CANVAS (Clamped for zero scroll) */}
      <View style={styles.boardContainer}>
        <LudoBoardSvg
          boardSize={BOARD_SIZE}
          gameState={gameState}
          validMoves={gameState.validMoves}
          onSelectToken={handleSelectToken}
        />

        {/* Floating animated emojis */}
        {floatingEmojis.map((item) => (
          <View key={item.id} style={styles.floatingEmojiContainer}>
            <Text style={{ fontSize: 44 }}>{item.emoji}</Text>
          </View>
        ))}
      </View>

      {/* 4. BOTTOM PLAYERS & DICE STATION ROW (Image 2 Screen 3 replica) */}
      <View style={styles.bottomSection}>
        {/* Bottom-Right Opponent (Blue / Thiago Rodrigues) */}
        {gameState.playerCount === 4 && (
          <View style={styles.bottomOpponentRow}>
            <View />
            <TouchableOpacity style={[styles.playerPod, currentTurnSeat === 3 && styles.playerPodActive]} onPress={() => setGiftTarget('Thiago Rodrigues')}>
              <View style={styles.avatarBorderBlue}>
                <Text style={{ fontSize: 20 }}>👱‍♂️</Text>
              </View>
              <View style={styles.playerMeta}>
                <Text style={styles.playerName} numberOfLines={1}>
                  {gameState.players[3]?.username || 'Thiago Rodrigues'}
                </Text>
                <Text style={styles.playerTokensHome}>
                  {gameState.players[3]?.tokensHome || 0}/4 🏁
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom-Left Active User: Govind */}
        <View style={styles.activePlayerRow}>
          {/* Govind Avatar Pod with Speech Bubble */}
          <View style={styles.govindPod}>
            {/* Speech Bubble */}
            {activeSpeechBubble && (
              <View style={styles.speechBubble}>
                <Text style={styles.speechBubbleText}>{activeSpeechBubble}</Text>
                <View style={styles.speechBubbleArrow} />
              </View>
            )}

            {/* Circular Avatar with Green Turn Timer Ring */}
            <View style={styles.avatarWrapperTimer}>
              <View style={[styles.timerRingIndicator, { borderColor: isMyTurn ? timerColor : '#752273' }]} />
              <View style={[styles.avatarCircleGovind, isMyTurn && { borderColor: timerColor }]}>
                <Text style={{ fontSize: 24 }}>😎</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.govindName}>{profile?.username || 'Uzair (You)'}</Text>
              <View style={[styles.killPill, myPlayer?.hasKilledOpponent ? styles.killPillOpen : styles.killPillLocked]}>
                <Text style={styles.killPillText}>
                  {myPlayer?.hasKilledOpponent ? '🔓 HOME OPEN' : '🔒 KILL NEEDED'}
                </Text>
              </View>
            </View>

            {/* Emoji, Chat & Auto-Play Action Buttons */}
            <View style={styles.chatButtonsRow}>
              <TouchableOpacity
                style={styles.chatActionBtn}
                onPress={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Text style={styles.chatActionText}>EMOJI</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.chatActionBtn}
                onPress={() => setShowChatPicker(!showChatPicker)}
              >
                <Text style={styles.chatActionText}>CHAT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chatActionBtn, isAutoPlay && { backgroundColor: '#27AE70', borderColor: '#FFF' }]}
                onPress={() => setIsAutoPlay(!isAutoPlay)}
              >
                <Text style={styles.chatActionText}>{isAutoPlay ? 'AUTO ON' : 'AUTO'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bouncing Green Arrow Pointing to Dice */}
          {canRollDice && (
            <Animated.View style={[styles.bouncingArrow, { transform: [{ translateY: bounceAnim }] }]}>
              <Text style={{ fontSize: 28, color: '#27AE70' }}>⬇️</Text>
            </Animated.View>
          )}

          {/* THE LUDO STAR DICE STATION */}
          <View style={styles.diceStation}>
            {/* Main Square 3D Dice Button */}
            <TouchableOpacity
              style={[
                styles.ludoStarDiceBtn,
                canRollDice && styles.ludoStarDiceBtnActive,
              ]}
              onPress={handleRoll}
              disabled={!canRollDice}
              activeOpacity={0.8}
            >
              <View style={styles.diceFaceInside}>
                {renderDicePipsView()}
              </View>
            </TouchableOpacity>

            {/* The Iconic Lucky Reroll Button (💎 3) */}
            <TouchableOpacity
              style={[
                styles.rerollBtn,
                canLuckyReroll && styles.rerollBtnActive,
              ]}
              onPress={handleLuckyReroll}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 15 }}>🔄</Text>
              <View style={styles.rerollBadge}>
                <Text style={styles.rerollBadgeText}>💎 3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ============================================================ */}
      {/* EMOJI PICKER POPUP */}
      {/* ============================================================ */}
      <Modal visible={showEmojiPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowEmojiPicker(false)}
        >
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>SEND EMOJI</Text>
            <View style={styles.emojisGrid}>
              {['👑', '😎', '😂', '🔥', '💖', '😡', '💀', '😱', '👍', '🎉', '🍀', '🪙'].map((emo) => (
                <TouchableOpacity
                  key={emo}
                  style={styles.emojiItem}
                  onPress={() => sendEmoji(emo)}
                >
                  <Text style={{ fontSize: 30 }}>{emo}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ============================================================ */}
      {/* QUICK CHAT PICKER POPUP */}
      {/* ============================================================ */}
      <Modal visible={showChatPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowChatPicker(false)}
        >
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>QUICK CHAT PHRASES</Text>
            {[
              'Good Luck! 🍀',
              'Roll a 6 please! 🎲',
              'Well Played! 👏',
              'Oops! 😅',
              'Hurry up! ⏳',
              'Kill him! ⚔️',
              'Don\'t kill me! 🛡️',
              'Haha! 😂',
            ].map((msg) => (
              <TouchableOpacity
                key={msg}
                style={styles.chatPhraseItem}
                onPress={() => sendChat(msg)}
              >
                <Text style={styles.chatPhraseText}>{msg}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

        {/* COMBO ANNOUNCER BANNER */}
      {comboBanner && (
        <View style={styles.comboBannerOverlay}>
          <Text style={styles.comboBannerText}>{comboBanner}</Text>
        </View>
      )}

      {/* INTERACTIVE OPPONENT GIFT MODAL */}
      <Modal visible={!!giftTarget} transparent animationType="fade" onRequestClose={() => setGiftTarget(null)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setGiftTarget(null)}>
          <View style={styles.giftModalBox}>
            <Text style={styles.giftModalTitle}>🎯 THROW GIFT TO {giftTarget?.toUpperCase()}</Text>
            <View style={styles.giftGrid}>
              {[
                { emoji: '🍅', name: 'TOMATO' },
                { emoji: '🥊', name: 'PUNCH' },
                { emoji: '💣', name: 'BOMB' },
                { emoji: '☕', name: 'COFFEE' },
                { emoji: '🌹', name: 'ROSE' },
                { emoji: '👑', name: 'CROWN' },
              ].map((g) => (
                <TouchableOpacity
                  key={g.name}
                  style={styles.giftBtn}
                  onPress={() => {
                    const t = giftTarget;
                    setGiftTarget(null);
                    sendEmoji(g.emoji);
                    showCombo(`${g.emoji} Threw ${g.name} at ${t}!`);
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{g.emoji}</Text>
                  <Text style={styles.giftBtnText}>{g.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.giftCloseBtn} onPress={() => setGiftTarget(null)}>
              <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 12 }}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#370A36', // Deep purple Ludo Star background
    justifyContent: 'space-between',
    paddingVertical: 2,
    overflow: 'hidden', // Strictly single page, zero scrolling!
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#370A36',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    color: '#FFDF00',
    fontSize: 16,
    fontWeight: '800',
  },

  // 1. Top Header
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#2F062E',
    borderBottomWidth: 1.5,
    borderBottomColor: '#521350',
  },
  topIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#1E051E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#752273',
  },
  infoPill: {
    backgroundColor: '#521350',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#752273',
  },
  infoPillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  winPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E051E',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1.5,
    borderColor: '#FFDF00',
  },
  winPillText: {
    color: '#FFDF00',
    fontSize: 11,
    fontWeight: '900',
  },
  gemsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E051E',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#521350',
  },
  gemsPillText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    marginRight: 4,
  },
  plusSmallBtn: {
    backgroundColor: '#27AE70',
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusSmallText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    marginTop: -2,
  },

  // 2. Opponents HUD
  topOpponentsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  playerPod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#521350',
    borderRadius: 16,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#752273',
    maxWidth: '48%',
  },
  playerPodActive: {
    borderColor: '#FFDF00',
    borderWidth: 2,
    backgroundColor: '#681765',
  },
  avatarBorderGreen: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#27AE60',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  avatarBorderYellow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1C40F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  avatarBorderBlue: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2980B9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  playerMeta: {
    marginLeft: 6,
    flex: 1,
  },
  playerName: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  playerTokensHome: {
    color: '#E6C985',
    fontSize: 9,
    fontWeight: '700',
  },
  giftMiniBtn: {
    marginLeft: 4,
  },

  // 3. Board Container
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  floatingEmojiContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 4. Bottom Section
  bottomSection: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  bottomOpponentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  activePlayerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  govindPod: {
    alignItems: 'flex-start',
  },
  speechBubble: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 3,
    borderWidth: 1.5,
    borderColor: '#FFDF00',
  },
  speechBubbleText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '800',
  },
  speechBubbleArrow: {
    position: 'absolute',
    bottom: -5,
    left: 14,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFF',
  },
  avatarWrapperTimer: {
    position: 'relative',
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerRingIndicator: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2.5,
  },
  avatarCircleGovind: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E74C3C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  govindName: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 2,
  },
  chatButtonsRow: {
    flexDirection: 'row',
    marginTop: 3,
  },
  chatActionBtn: {
    backgroundColor: '#521350',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#752273',
  },
  chatActionText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '800',
  },
  killPill: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  killPillLocked: {
    backgroundColor: '#C0392B',
  },
  killPillOpen: {
    backgroundColor: '#27AE70',
  },
  killPillText: {
    color: '#FFF',
    fontSize: 7.5,
    fontWeight: '900',
  },
  bouncingArrow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    marginBottom: 8,
  },

  // Dice Station
  diceStation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ludoStarDiceBtn: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#E74C3C',
    borderWidth: 3,
    borderColor: '#FFDF00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 8,
  },
  ludoStarDiceBtnActive: {
    backgroundColor: '#27AE70',
    borderColor: '#FFDF00',
  },
  diceFaceInside: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diceFaceValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
  },
  rerollBtn: {
    width: 44,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#521350',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    borderWidth: 1.5,
    borderColor: '#752273',
  },
  rerollBtnActive: {
    borderColor: '#27AE70',
    backgroundColor: '#681765',
  },
  rerollBadge: {
    backgroundColor: '#27AE70',
    borderRadius: 5,
    paddingHorizontal: 3,
    paddingVertical: 1,
    marginTop: 2,
  },
  rerollBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  },

  // Picker Overlays
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  pickerBox: {
    width: '88%',
    backgroundColor: '#420A3F',
    borderRadius: 18,
    padding: 14,
    borderWidth: 2,
    borderColor: '#FFDF00',
  },
  pickerTitle: {
    color: '#FFDF00',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
  },
  emojisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiItem: {
    width: '23%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F062E',
    borderRadius: 10,
    marginBottom: 6,
  },
  chatPhraseItem: {
    backgroundColor: '#2F062E',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#752273',
  },
  chatPhraseText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },

  comboBannerOverlay: {
    position: 'absolute',
    top: '46%',
    left: '10%',
    right: '10%',
    backgroundColor: '#FFDF00',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 20,
    zIndex: 9999,
  },
  comboBannerText: {
    color: '#1A021A',
    fontSize: 16,
    fontWeight: '900',
  },
  giftModalBox: {
    backgroundColor: '#521350',
    borderRadius: 20,
    padding: 16,
    width: '85%',
    maxWidth: 340,
    borderWidth: 2,
    borderColor: '#FFDF00',
    alignItems: 'center',
  },
  giftModalTitle: {
    color: '#FFDF00',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 12,
  },
  giftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  giftBtn: {
    width: '30%',
    backgroundColor: '#3B093A',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#752273',
  },
  giftBtnText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 4,
  },
  giftCloseBtn: {
    backgroundColor: '#370A36',
    borderRadius: 10,
    paddingVertical: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#752273',
    marginTop: 4,
  },



  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});