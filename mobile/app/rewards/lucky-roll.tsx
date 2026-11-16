import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Easing, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../src/theme/colors';
import { NovaHeader } from '../../src/components/nova/NovaHeader';
import { NovaBadge } from '../../src/components/nova/NovaBadge';
import { NovaDie } from '../../src/components/nova/NovaDie';
import { NovaButton } from '../../src/components/nova/NovaButton';
import { useEconomyStore } from '../../src/store/useEconomyStore';
import { useMissionsStore } from '../../src/store/useMissionsStore';

const SEGMENTS = [
  { val: 100, color: '#30254e' },
  { val: 25, color: '#191e33' },
  { val: 500, color: '#30254e' },
  { val: 10, color: '#191e33' },
  { val: 200, color: '#30254e' },
  { val: 50, color: '#191e33' },
];

export default function LuckyRollScreen() {
  const router = useRouter();
  const { addGold } = useEconomyStore();
  const { luckyRollAvailable, performLuckyRoll } = useMissionsStore();

  const [spinning, setSpinning] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;

  const handleSpin = () => {
    if (spinning || !luckyRollAvailable) return;
    setSpinning(true);

    const randomRotations = 4 + Math.random() * 3;
    Animated.timing(spinAnim, {
      toValue: randomRotations,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      const wonCoins = performLuckyRoll();
      addGold(wonCoins);
      setSpinning(false);
      Alert.alert('Lucky Roll Victory! 🎲✨', `You won +${wonCoins} coins!`);
    });
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <NovaHeader
        title="Your lucky roll"
        subtitle="One free chance to brighten your day."
        showBack={true}
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        <NovaBadge label="FREE DAILY ROLL" color="purple" style={styles.badge} />

        {/* Lucky Wheel Graphic */}
        <View style={styles.wheelContainer}>
          {/* Wheel Pointer */}
          <View style={styles.wheelPointer}>
            <Ionicons name="caret-down" size={32} color={NOVA_COLORS.accentGold} />
          </View>

          {/* Spinning Wheel */}
          <Animated.View style={[styles.wheel, { transform: [{ rotate: spin }] }]}>
            {SEGMENTS.map((seg, i) => {
              const angle = (i * 360) / SEGMENTS.length;
              return (
                <View
                  key={i}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: seg.color,
                      transform: [{ rotate: `${angle}deg` }],
                    },
                  ]}
                >
                  <Text style={styles.segmentText}>{seg.val}</Text>
                </View>
              );
            })}

            {/* Central Die */}
            <View style={styles.centerHub}>
              <NovaDie value={6} size={50} theme="nova" />
            </View>
          </Animated.View>
        </View>

        <Text style={styles.luckText}>A little luck goes a long way.</Text>
        <Text style={styles.luckSubtext}>
          Free daily rewards. No purchase needed. Prizes added directly to your coin balance.
        </Text>
      </View>

      <View style={styles.footer}>
        <NovaButton
          title={spinning ? 'Rolling the wheel…' : luckyRollAvailable ? 'Take my free roll' : 'Claimed for today ✓'}
          variant={luckyRollAvailable ? 'primary' : 'dark'}
          onPress={handleSpin}
          disabled={spinning || !luckyRollAvailable}
        />
        <Text style={styles.footerSubtext}>
          Next free roll in 24 hours after claiming
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
    marginTop: 10,
    alignItems: 'center',
  },
  badge: {
    marginBottom: 20,
  },
  wheelContainer: {
    position: 'relative',
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  wheelPointer: {
    position: 'absolute',
    top: -14,
    zIndex: 10,
  },
  wheel: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 4,
    borderColor: NOVA_COLORS.accentPurple,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: NOVA_COLORS.surfaceCard,
  },
  segment: {
    position: 'absolute',
    width: 90,
    height: 110,
    top: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
  segmentText: {
    color: NOVA_COLORS.accentGold,
    fontSize: 16,
    fontWeight: '900',
  },
  centerHub: {
    position: 'absolute',
    zIndex: 5,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  luckText: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  luckSubtext: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  footerSubtext: {
    color: NOVA_COLORS.textMuted,
    fontSize: 12,
    marginTop: 10,
  },
});
