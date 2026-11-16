import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaDie } from '../../src/components/nova/NovaDie';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function MatchmakingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { profile } = useAuthStore();

  const mode = (params.mode as string) || 'classic';
  const prize = (params.prize as string) || '2,000';
  const entry = (params.entry as string) || '500';

  const [seconds, setSeconds] = useState(8);
  const [playersFound, setPlayersFound] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPlayersFound(4);
          // Navigate to live game
          setTimeout(() => {
            router.replace({
              pathname: '/gameplay/[matchId]',
              params: { matchId: `match_${Date.now()}`, mode, prize },
            } as any);
          }, 800);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <NovaHeader
        title="Finding your table"
        subtitle={`Classic · 4 players · ${entry} coins`}
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        <NovaBadge label="MATCHMAKING" color="purple" style={styles.badge} />

        <Text style={styles.heading}>Good company is on the way.</Text>

        {/* 4 Player Slots */}
        <View style={styles.slotsGrid}>
          {/* Player 1: You */}
          <View style={styles.playerSlot}>
            <View style={[styles.avatarCircle, { backgroundColor: NOVA_COLORS.coral }]}>
              <View style={styles.innerDot} />
            </View>
            <Text style={styles.slotName}>You</Text>
            <Text style={styles.slotStatus}>Ready</Text>
          </View>

          {/* Player 2: Maya */}
          <View style={styles.playerSlot}>
            <View style={[styles.avatarCircle, { backgroundColor: NOVA_COLORS.mint }]}>
              <View style={styles.innerDot} />
            </View>
            <Text style={styles.slotName}>Maya</Text>
            <Text style={styles.slotStatus}>Ready</Text>
          </View>

          {/* Player 3: Sam */}
          <View style={styles.playerSlot}>
            <View style={[styles.avatarCircle, { backgroundColor: NOVA_COLORS.blue }]}>
              <View style={styles.innerDot} />
            </View>
            <Text style={styles.slotName}>Sam</Text>
            <Text style={styles.slotStatus}>Ready</Text>
          </View>

          {/* Player 4: Searching / Zara */}
          <View style={styles.playerSlot}>
            {playersFound === 4 ? (
              <View style={[styles.avatarCircle, { backgroundColor: NOVA_COLORS.gold }]}>
                <View style={styles.innerDot} />
              </View>
            ) : (
              <View style={[styles.avatarCircle, styles.searchingCircle]}>
                <NovaDie value={3} size={36} rolling={true} theme="nova" />
              </View>
            )}
            <Text style={styles.slotName}>
              {playersFound === 4 ? 'Zara' : 'Searching…'}
            </Text>
            <Text style={styles.slotStatus}>
              {playersFound === 4 ? 'Ready' : 'Finding'}
            </Text>
          </View>
        </View>

        <Text style={styles.timerText}>
          {playersFound} of 4 players ready · 00:{seconds < 10 ? `0${seconds}` : seconds}
        </Text>
      </View>

      <View style={styles.footer}>
        <NovaButton
          title="Cancel search"
          variant="dark"
          onPress={() => router.back()}
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
