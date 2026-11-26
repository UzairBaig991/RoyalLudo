import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing, ViewStyle } from 'react-native';

export type NovaDieTheme =
  | 'nova'
  | 'white'
  | 'gold'
  | 'ruby'
  | 'emerald'
  | 'sapphire'
  | 'cyber'
  | 'obsidian'
  | 'coral'
  | 'mint'
  | 'dragon'
  | 'galaxy';

interface NovaDieProps {
  value: number;
  size?: number;
  rolling?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  theme?: NovaDieTheme;
  style?: ViewStyle;
}

const DIE_THEME_STYLES: Record<
  NovaDieTheme,
  {
    bg: string;
    pip: string;
    centerPipOne?: string;
    border: string;
    bevel: string;
    glow: string;
  }
> = {
  nova: {
    bg: '#3b2f5c',
    pip: '#b9a2ff',
    centerPipOne: '#ffd37b',
    border: 'rgba(185, 162, 255, 0.45)',
    bevel: 'rgba(255, 255, 255, 0.25)',
    glow: '#b9a2ff',
  },
  white: {
    bg: '#f6f5ff',
    pip: '#0d101e',
    centerPipOne: '#e74c3c',
    border: '#dcd6f7',
    bevel: '#ffffff',
    glow: '#ffffff',
  },
  gold: {
    bg: '#ffd37b',
    pip: '#30254e',
    centerPipOne: '#c0392b',
    border: '#fff3b0',
    bevel: 'rgba(255, 255, 255, 0.65)',
    glow: '#ffd37b',
  },
  ruby: {
    bg: '#b71c1c',
    pip: '#ffd54f',
    centerPipOne: '#ffffff',
    border: '#ff8a80',
    bevel: 'rgba(255, 213, 79, 0.45)',
    glow: '#ff1744',
  },
  emerald: {
    bg: '#00695c',
    pip: '#ffd700',
    centerPipOne: '#69f0ae',
    border: '#64ffda',
    bevel: 'rgba(100, 255, 218, 0.35)',
    glow: '#00e676',
  },
  sapphire: {
    bg: '#0d47a1',
    pip: '#80d8ff',
    centerPipOne: '#ffffff',
    border: '#82b1ff',
    bevel: 'rgba(128, 216, 255, 0.4)',
    glow: '#2979ff',
  },
  cyber: {
    bg: '#0a192f',
    pip: '#00f5d4',
    centerPipOne: '#ff007f',
    border: '#00f5d4',
    bevel: 'rgba(0, 245, 212, 0.5)',
    glow: '#00f5d4',
  },
  obsidian: {
    bg: '#14141f',
    pip: '#e040fb',
    centerPipOne: '#00e5ff',
    border: '#9c27b0',
    bevel: 'rgba(224, 64, 251, 0.35)',
    glow: '#e040fb',
  },
  coral: {
    bg: '#ff6b6b',
    pip: '#ffffff',
    centerPipOne: '#ffe66d',
    border: '#ff9ff3',
    bevel: 'rgba(255, 255, 255, 0.4)',
    glow: '#ff6b6b',
  },
  mint: {
    bg: '#1dd1a1',
    pip: '#0d101e',
    centerPipOne: '#ffffff',
    border: '#c8d6e5',
    bevel: 'rgba(255, 255, 255, 0.5)',
    glow: '#1dd1a1',
  },
  dragon: {
    bg: '#2d140d',
    pip: '#ff7043',
    centerPipOne: '#ffeb3b',
    border: '#ff5722',
    bevel: 'rgba(255, 87, 34, 0.45)',
    glow: '#ff5722',
  },
  galaxy: {
    bg: '#240046',
    pip: '#ea80fc',
    centerPipOne: '#00f5d4',
    border: '#9d4edd',
    bevel: 'rgba(234, 128, 252, 0.4)',
    glow: '#9d4edd',
  },
};

export const NovaDie: React.FC<NovaDieProps> = ({
  value = 6,
  size = 64,
  rolling = false,
  onPress,
  disabled = false,
  theme = 'nova',
  style,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState<number>(value);

  useEffect(() => {
    let faceInterval: ReturnType<typeof setInterval> | null = null;

    if (rolling) {
      faceInterval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 48);

      bounceAnim.setValue(0);
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 185,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ),
        // Realistic 2-bounce physical toss arc!
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -14,
            duration: 90,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 85,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: -6,
            duration: 60,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 55,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(scaleAnim, {
          toValue: 1.18,
          duration: 95,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      setDisplayValue(value);
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
      bounceAnim.stopAnimation();
      bounceAnim.setValue(0);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 190,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (faceInterval) clearInterval(faceInterval);
    };
  }, [rolling, value]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const palette = DIE_THEME_STYLES[theme] || DIE_THEME_STYLES.nova;

  const pipSize = size * 0.17;
  const padding = size * 0.2;
  const pipColor = palette.pip;

  const renderPips = () => {
    const val = Math.max(1, Math.min(6, displayValue));

    const hasCenter = val === 1 || val === 3 || val === 5;
    const hasTopLeft = val >= 2;
    const hasBottomRight = val >= 2;
    const hasTopRight = val >= 4;
    const hasBottomLeft = val >= 4;
    const hasMidLeft = val === 6;
    const hasMidRight = val === 6;

    const centerColor = val === 1 && palette.centerPipOne ? palette.centerPipOne : pipColor;
    const centerSize = val === 1 ? pipSize * 1.25 : pipSize;

    return (
      <View style={[styles.pipGrid, { padding }]}>
        {/* Row 1 */}
        <View style={styles.pipRow}>
          <View style={[styles.pipSlot, { width: pipSize, height: pipSize }]}>
            {hasTopLeft && (
              <View
                style={[
                  styles.pip,
                  { backgroundColor: pipColor, width: pipSize, height: pipSize, borderRadius: pipSize / 2 },
                ]}
              />
            )}
          </View>
          <View style={[styles.pipSlot, { width: pipSize, height: pipSize }]} />
          <View style={[styles.pipSlot, { width: pipSize, height: pipSize }]}>
            {hasTopRight && (
              <View
                style={[
                  styles.pip,
                  { backgroundColor: pipColor, width: pipSize, height: pipSize, borderRadius: pipSize / 2 },
                ]}
              />
            )}
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.pipRow}>
          <View style={[styles.pipSlot, { width: pipSize, height: pipSize }]}>
            {hasMidLeft && (
              <View
                style={[
                  styles.pip,
                  { backgroundColor: pipColor, width: pipSize, height: pipSize, borderRadius: pipSize / 2 },
                ]}
              />
            )}
          </View>
          <View style={[styles.pipSlot, { width: centerSize, height: centerSize }]}>
            {hasCenter && (
              <View
                style={[
                  styles.pip,
                  {
                    backgroundColor: centerColor,
                    width: centerSize,
                    height: centerSize,
                    borderRadius: centerSize / 2,
                  },
                ]}
              />
            )}
          </View>
          <View style={[styles.pipSlot, { width: pipSize, height: pipSize }]}>
            {hasMidRight && (
              <View
                style={[
                  styles.pip,
                  { backgroundColor: pipColor, width: pipSize, height: pipSize, borderRadius: pipSize / 2 },
                ]}
              />
            )}
          </View>
        </View>

        {/* Row 3 */}
        <View style={styles.pipRow}>
          <View style={[styles.pipSlot, { width: pipSize, height: pipSize }]}>
            {hasBottomLeft && (
              <View
                style={[
                  styles.pip,
                  { backgroundColor: pipColor, width: pipSize, height: pipSize, borderRadius: pipSize / 2 },
                ]}
              />
            )}
          </View>
          <View style={[styles.pipSlot, { width: pipSize, height: pipSize }]} />
          <View style={[styles.pipSlot, { width: pipSize, height: pipSize }]}>
            {hasBottomRight && (
              <View
                style={[
                  styles.pip,
                  { backgroundColor: pipColor, width: pipSize, height: pipSize, borderRadius: pipSize / 2 },
                ]}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const dieContent = (
    <Animated.View
      style={[
        styles.dieContainer,
        {
          width: size,
          height: size,
          borderRadius: size * 0.26,
          backgroundColor: palette.bg,
          borderColor: palette.border,
          shadowColor: palette.glow,
          transform: [{ translateY: bounceAnim }, { rotate: spin }, { scale: scaleAnim }],
        },
        style,
      ]}
    >
      <View style={[styles.bevelOverlay, { borderColor: palette.bevel }]}>{renderPips()}</View>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || rolling}
        activeOpacity={0.8}
      >
        {dieContent}
      </TouchableOpacity>
    );
  }

  return dieContent;
};

const styles = StyleSheet.create({
  dieContainer: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  bevelOverlay: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pipGrid: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  pipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pipSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pip: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },
});
