import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing, ViewStyle } from 'react-native';
import { NOVA_COLORS } from '../../theme/colors';

interface NovaDieProps {
  value: number;
  size?: number;
  rolling?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  theme?: 'nova' | 'white' | 'gold';
  style?: ViewStyle;
}

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

  useEffect(() => {
    if (rolling) {
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 350,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.15,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
      scaleAnim.setValue(1);
    }
  }, [rolling]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getBgColor = () => {
    switch (theme) {
      case 'white':
        return '#f6f5ff';
      case 'gold':
        return '#ffd37b';
      case 'nova':
      default:
        return '#3b2f5c';
    }
  };

  const getPipColor = () => {
    switch (theme) {
      case 'white':
        return '#0d101e';
      case 'gold':
        return '#30254e';
      case 'nova':
      default:
        return '#b9a2ff';
    }
  };

  const pipSize = size * 0.17;
  const padding = size * 0.2;
  const pipColor = getPipColor();

  const renderPips = () => {
    // 3x3 grid coordinates
    const pips = [];
    const val = Math.max(1, Math.min(6, value));

    const hasCenter = val === 1 || val === 3 || val === 5;
    const hasTopLeft = val >= 2;
    const hasBottomRight = val >= 2;
    const hasTopRight = val >= 4;
    const hasBottomLeft = val >= 4;
    const hasMidLeft = val === 6;
    const hasMidRight = val === 6;

    return (
      <View style={[styles.pipGrid, { padding }]}>
        {/* Row 1 */}
        <View style={styles.pipRow}>
          <View style={[styles.pipSlot, { width: pipSize, height: pipSize }]}>
            {hasTopLeft && <View style={[styles.pip, { backgroundColor: pipColor, width: pipSize, height: pipSize, borderRadius: pipSize / 2 }]} />}
          </View>
          <View style={[styles.pipSlot, { width: pipSize, height: pipSize }]} />
          <View style={[styles.pipSlot, { width: pipSize, height: pipSize }]}>
            {hasTopRight && <View style={[styles.pip, { backgroundColor: pipColor, width: pipSize, height: pipSize, borderRadius: pipSize / 2 }]} />}
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.pipRow}>
          <View style={[styles.pipSlot, { width: pipSize, height: pipSize }]}>
            {hasMidLeft && <View style={[styles.pip, { backgroundColor: pipColor, width: pipSize, height: pipSize, borderRadius: pipSize / 2 }]} />}
          </View>
          <View style={[styles.pipSlot, { width: pipSize, height: pipSize }]}>
            {hasCenter && <View style={[styles.pip, { backgroundColor: pipColor, width: pipSize, height: pipSize, borderRadius: pipSize / 2 }]} />}
          </View>
          <View style={[styles.pipSlot, { width: pipSize, height: pipSize }]}>
            {hasMidRight && <View style={[styles.pip, { backgroundColor: pipColor, width: pipSize, height: pipSize, borderRadius: pipSize / 2 }]} />}
          </View>
        </View>

        {/* Row 3 */}
        <View style={styles.pipRow}>
          <View style={[styles.pipSlot, { width: pipSize, height: pipSize }]}>
            {hasBottomLeft && <View style={[styles.pip, { backgroundColor: pipColor, width: pipSize, height: pipSize, borderRadius: pipSize / 2 }]} />}
          </View>
          <View style={[styles.pipSlot, { width: pipSize, height: pipSize }]} />
          <View style={[styles.pipSlot, { width: pipSize, height: pipSize }]}>
            {hasBottomRight && <View style={[styles.pip, { backgroundColor: pipColor, width: pipSize, height: pipSize, borderRadius: pipSize / 2 }]} />}
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
          backgroundColor: getBgColor(),
          transform: [{ rotate: spin }, { scale: scaleAnim }],
        },
        style,
      ]}
    >
      <View style={styles.bevelOverlay}>{renderPips()}</View>
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
