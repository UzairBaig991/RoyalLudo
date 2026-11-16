import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaDie } from '../../src/components/nova/NovaDie';
import { NovaCard } from '../../src/components/nova/NovaCard';
import { NovaButton } from '../../src/components/nova/NovaButton';

export default function JoinRoomScreen() {
  const router = useRouter();
  const [code, setCode] = useState('NOVA24');

  const handleJoin = () => {
    if (code.trim().length >= 4) {
      router.push({
        pathname: '/gameplay/[matchId]',
        params: { matchId: `room_${code.toLowerCase()}`, mode: 'private' },
      } as any);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="Join your friends"
        subtitle="There’s a seat waiting for you."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        <View style={styles.dieWrap}>
          <NovaDie value={4} size={64} theme="nova" />
        </View>

        <Text style={styles.inputTitle}>Enter room code</Text>
        <Text style={styles.inputSubtitle}>
          Ask your host for their 6-character code.
        </Text>

        {/* 6 character slots display */}
        <View style={styles.slotsRow}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const char = code[i] || '';
            return (
              <View key={i} style={[styles.codeSlot, char ? styles.codeSlotFilled : null]}>
                <Text style={styles.slotChar}>{char}</Text>
              </View>
            );
          })}
        </View>

        {/* Hidden or real input */}
        <TextInput
          style={styles.hiddenInput}
          value={code}
          onChangeText={(val) => setCode(val.toUpperCase())}
          maxLength={6}
          autoCapitalize="characters"
          autoFocus={false}
        />

        <NovaCard variant="card" style={styles.infoCard}>
          <View style={styles.infoIconWrap}>
            <Ionicons name="people-outline" size={24} color={NOVA_COLORS.accentPurple} />
          </View>
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoTitle}>Your room, your rules</Text>
            <Text style={styles.infoDesc}>
              Private games are just for fun. Play free with your people anytime.
            </Text>
          </View>
        </NovaCard>
      </View>

      <View style={styles.footer}>
        <NovaButton
          title="Join room"
          variant="primary"
          onPress={handleJoin}
          disabled={code.length < 4}
        />
        <Text style={styles.footerHint}>
          Room not found? Check the code with your host.
        </Text>
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
    alignItems: 'center',
    marginTop: 10,
  },
  dieWrap: {
    marginBottom: 20,
  },
  inputTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  inputSubtitle: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 28,
  },
  codeSlot: {
    width: 48,
    height: 56,
    borderRadius: 14,
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  codeSlotFilled: {
    borderColor: NOVA_COLORS.accentPurple,
    backgroundColor: '#1d233d',
  },
  slotChar: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  hiddenInput: {
    width: '100%',
    height: 48,
    backgroundColor: NOVA_COLORS.surfaceCard,
    borderRadius: 14,
    color: NOVA_COLORS.textPrimary,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 16,
  },
  infoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(185, 162, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoDesc: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  footerHint: {
    color: NOVA_COLORS.textMuted,
    fontSize: 12,
    marginTop: 12,
  },
});
