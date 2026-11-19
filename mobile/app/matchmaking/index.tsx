import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaDie } from '../../src/components/nova/NovaDie';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useCustomizationStore } from '../../src/store/useCustomizationStore';
import { useGameStore } from '../../src/store/useGameStore';

export default function MatchmakingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { profile } = useAuthStore();
  const { dice } = useCustomizationStore();
  const equippedDie = dice.find((d) => d.equipped) || dice[0];
  const { startNewGame } = useGameStore();

  const mode = (params.mode as string) || 'classic';
  const prize = (params.prize as string) || '2,000';
  const entry = (params.entry as string) || '500';
  const players = (params.players as string) || '4';
  const isTwoPlayer = players === '2';

  const [seconds, setSeconds] = useState(isTwoPlayer ? 3 : 4);
  const [playersFound, setPlayersFound] = useState(isTwoPlayer ? 1 : 3);
  const cancelledRef = useRef<boolean>(false);

  const launchMatchNow = () => {
    if (cancelledRef.current) return;
    cancelledRef.current = true;
    const myName = profile?.username || 'You';
    startNewGame({
      mode: (mode === 'quick' ? 'quick' : 'classic') as any,
      playerCount: isTwoPlayer ? 2 : 4,
      randomizeTurn: true,
      players: isTwoPlayer
        ? [
            { id: profile?.id || 'usr_me', username: myName, isBot: false },
            { id: 'usr_companion', username: 'Companion (Yellow)', isBot: true },
          ]
        : [
            { id: profile?.id || 'usr_me', username: myName, isBot: false },
            { id: 'b1', username: 'Maya', isBot: true },
            { id: 'b2', username: 'Zara', isBot: true },
            { id: 'b3', username: 'Sam', isBot: true },
          ],
    });
    router.replace({
      pathname: '/gameplay/[matchId]',
      params: { matchId: `match_${Date.now()}`, mode, prize, players },
    } as any);
  };

  useEffect(() => {
    cancelledRef.current = false;
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPlayersFound(isTwoPlayer ? 2 : 4);
          setTimeout(() => {
            launchMatchNow();
          }, 350);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      cancelledRef.current = true;
      clearInterval(timer);
    };
  }, [isTwoPlayer, players]);

  return (
    <View style={styles.container}>
      <NovaHeader
        title="Finding your table"
        subtitle={`Classic · ${isTwoPlayer ? '2 players (1v1 Diagonal)' : '4 players'} · ${entry} coins`}
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        <NovaBadge
          label={isTwoPlayer ? '1v1 DIAGONAL DUEL' : 'MATCHMAKING'}
          color="purple"
          style={styles.badge}
        />

        <Text style={styles.heading}>
          {isTwoPlayer ? 'Finding your diagonal companion…' : 'Good company is on the way.'}
        </Text>

        {/* Player Slots */}
        <View style={styles.slotsGrid}>
          {/* Player 1: You */}
          <View style={styles.playerSlot}>
            <View style={[styles.avatarCircle, { backgroundColor: NOVA_COLORS.coral }]}>
              <View style={styles.innerDot} />
            </View>
            <Text style={styles.slotName}>You</Text>
            <Text style={styles.slotStatus}>Ready</Text>
          </View>

          {/* Player 2: Companion (Yellow, Diagonal) */}
          <View style={styles.playerSlot}>
            {playersFound >= 2 ? (
              <>
                <View style={[styles.avatarCircle, { backgroundColor: NOVA_COLORS.gold }]}>
                  <View style={styles.innerDot} />
                </View>
                <Text style={styles.slotName}>Companion</Text>
                <Text style={styles.slotStatus}>Ready (Diagonal)</Text>
              </>
            ) : (
              <>
                <View style={[styles.avatarCircle, styles.searchingCircle]}>
                  <NovaDie value={2} size={36} rolling={true} theme={equippedDie.previewTheme} />
                </View>
                <Text style={styles.slotName}>Companion</Text>
                <Text style={styles.slotStatus}>Finding…</Text>
              </>
            )}
          </View>

          {!isTwoPlayer && (
            <>
              {/* Player 3: Maya */}
              <View style={styles.playerSlot}>
                <View style={[styles.avatarCircle, { backgroundColor: NOVA_COLORS.mint }]}>
                  <View style={styles.innerDot} />
                </View>
                <Text style={styles.slotName}>Maya</Text>
                <Text style={styles.slotStatus}>Ready</Text>
              </View>

              {/* Player 4: Searching / Sam */}
              <View style={styles.playerSlot}>
                {playersFound === 4 ? (
                  <>
                    <View style={[styles.avatarCircle, { backgroundColor: NOVA_COLORS.blue }]}>
                      <View style={styles.innerDot} />
                    </View>
                    <Text style={styles.slotName}>Sam</Text>
                    <Text style={styles.slotStatus}>Ready</Text>
                  </>
                ) : (
                  <>
                    <View style={[styles.avatarCircle, styles.searchingCircle]}>
                      <NovaDie value={4} size={36} rolling={true} theme={equippedDie.previewTheme} />
                    </View>
                    <Text style={styles.slotName}>Sam</Text>
                    <Text style={styles.slotStatus}>Finding…</Text>
                  </>
                )}
              </View>
            </>
          )}
        </View>

        <Text style={styles.timerText}>
          {playersFound} of {isTwoPlayer ? 2 : 4} players ready · 00:{seconds < 10 ? `0${seconds}` : seconds}
        </Text>
      </View>

      <View style={styles.footer}>
        <NovaButton
          title="⚡ Start Match Immediately"
          variant="primary"
          onPress={launchMatchNow}
          style={{ marginBottom: 10 }}
        />
        <NovaButton
          title="Cancel search"
          variant="dark"
          onPress={() => {
            cancelledRef.current = true;
            router.back();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NOVA_COLORS.bg,
    justifyContent: 'space-between',
    paddingBottom: 28,
  },
  content: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  badge: {
    marginBottom: 16,
  },
  heading: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 32,
  },
  slotsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
  },
  playerSlot: {
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  innerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  searchingCircle: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: NOVA_COLORS.accentPurple,
  },
  slotName: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  slotStatus: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  timerText: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
  },
  footer: {
    paddingHorizontal: 20,
  },
});
