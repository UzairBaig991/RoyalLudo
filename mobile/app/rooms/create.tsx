import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function CreateRoomScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();

  const [copied, setCopied] = useState(false);
  const roomCode = 'N O V A 2 4';

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    router.push({
      pathname: '/gameplay/[matchId]',
      params: { matchId: 'room_nova24', mode: 'private' },
    } as any);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="Room ready"
        subtitle="Classic · 4 players · Private"
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        {/* Room Code Card */}
        <TouchableOpacity
          style={styles.codeCard}
          onPress={handleCopy}
          activeOpacity={0.8}
        >
          <Text style={styles.codeLabel}>ROOM CODE</Text>
          <Text style={styles.codeText}>{roomCode}</Text>
          <Text style={styles.tapToCopy}>
            {copied ? '✓ Copied to clipboard!' : 'Tap to copy · Share with your friends'}
          </Text>
        </TouchableOpacity>

        <NovaButton
          title="Share invite link"
          variant="dark"
          onPress={handleCopy}
          icon={<Ionicons name="share-outline" size={18} color={NOVA_COLORS.textPrimary} />}
          style={styles.shareBtn}
        />

        {/* Table Seats */}
        <Text style={styles.seatsTitle}>Your table  ·  2 / 4</Text>

        <View style={styles.seatsList}>
          {/* Seat 1: Host */}
          <View style={styles.seatRow}>
            <View style={[styles.tokenDot, { backgroundColor: NOVA_COLORS.coral }]} />
            <View style={styles.seatInfo}>
              <Text style={styles.seatName}>{profile?.username || 'Alex Nova'}</Text>
              <Text style={styles.seatRole}>You · Host</Text>
            </View>
            <View style={styles.checkWrap}>
              <Ionicons name="checkmark" size={16} color="#0d101e" />
            </View>
          </View>

          {/* Seat 2: Maya */}
          <View style={styles.seatRow}>
            <View style={[styles.tokenDot, { backgroundColor: NOVA_COLORS.mint }]} />
            <View style={styles.seatInfo}>
              <Text style={styles.seatName}>Maya</Text>
              <Text style={styles.seatRole}>Ready to play</Text>
            </View>
            <View style={styles.checkWrap}>
              <Ionicons name="checkmark" size={16} color="#0d101e" />
            </View>
          </View>

          {/* Seat 3: Open */}
          <TouchableOpacity
            style={[styles.seatRow, styles.seatOpen]}
            onPress={() => router.push('/(tabs)/friends' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.tokenDot, styles.tokenOpen]}>
              <Ionicons name="add" size={18} color={NOVA_COLORS.textMuted} />
            </View>
            <View style={styles.seatInfo}>
              <Text style={styles.seatNameOpen}>Open seat</Text>
              <Text style={styles.seatRole}>Invite a friend</Text>
            </View>
            <Ionicons name="person-add-outline" size={18} color={NOVA_COLORS.accentPurple} />
          </TouchableOpacity>

          {/* Seat 4: Open */}
          <TouchableOpacity
            style={[styles.seatRow, styles.seatOpen]}
            onPress={() => router.push('/(tabs)/friends' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.tokenDot, styles.tokenOpen]}>
              <Ionicons name="add" size={18} color={NOVA_COLORS.textMuted} />
            </View>
            <View style={styles.seatInfo}>
              <Text style={styles.seatNameOpen}>Open seat</Text>
              <Text style={styles.seatRole}>Invite a friend</Text>
            </View>
            <Ionicons name="person-add-outline" size={18} color={NOVA_COLORS.accentPurple} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <NovaButton
          title="Start game  ·  2 players ready"
          variant="primary"
          onPress={handleStartGame}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: NOVA_COLORS.bg,
    justifyContent: 'space-between',
    paddingBottom: 28,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  codeCard: {
    backgroundColor: NOVA_COLORS.surfaceBadge,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  codeLabel: {
    color: NOVA_COLORS.accentPurple,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  codeText: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 6,
  },
  tapToCopy: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  shareBtn: {
    marginBottom: 24,
  },
  seatsTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 14,
  },
  seatsList: {},
  seatRow: {
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  seatOpen: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'transparent',
  },
  tokenDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  tokenOpen: {
    backgroundColor: NOVA_COLORS.surfaceCard,
  },
  seatInfo: {
    flex: 1,
  },
  seatName: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  seatNameOpen: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  seatRole: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  checkWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: NOVA_COLORS.accentMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
});
