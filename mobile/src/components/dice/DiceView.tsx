import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ROYAL_COLORS, COLOR_MAP } from '../../theme/colors';
import type { PlayerColor } from '@royal-ludo/shared';

interface DiceViewProps {
  value: number | null;
  isRolling: boolean;
  canRoll: boolean;
  activeColor: PlayerColor;
  onPressRoll: () => void;
  size?: number;
}

export const DiceView: React.FC<DiceViewProps> = ({
  value,
  isRolling,
  canRoll,
  activeColor,
  onPressRoll,
  size = 54,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value || 6);
  const colorScheme = COLOR_MAP[activeColor as keyof typeof COLOR_MAP] || COLOR_MAP.RED;

  // Animate rapid dice face cycling while rolling
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRolling) {
      interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 70);
    } else if (value !== null) {
      setDisplayValue(value);
    }
    return () => clearInterval(interval);
  }, [isRolling, value]);

  // Render pips for current dice face
  const renderPips = () => {
    const pipSize = size * 0.18;
    const dotColor = '#101827';

    const Pip = () => (
      <View
        style={{
          width: pipSize,
          height: pipSize,
          borderRadius: pipSize / 2,
          backgroundColor: dotColor,
        }}
      />
    );

    switch (displayValue) {
      case 1:
        return (
          <View style={styles.pipCenter}>
            <Pip />
          </View>
        );
      case 2:
        return (
          <View style={styles.pipDiagonal}>
            <Pip />
            <Pip />
          </View>
        );
      case 3:
        return (
          <View style={styles.pipThree}>
            <Pip />
            <Pip />
            <Pip />
          </View>
        );
      case 4:
        return (
          <View style={styles.pipGrid}>
            <View style={styles.pipRow}><Pip /><Pip /></View>
            <View style={styles.pipRow}><Pip /><Pip /></View>
          </View>
        );
      case 5:
        return (
          <View style={styles.pipGrid}>
            <View style={styles.pipRow}><Pip /><Pip /></View>
            <View style={styles.pipCenterRow}><Pip /></View>
            <View style={styles.pipRow}><Pip /><Pip /></View>
          </View>
        );
      case 6:
      default:
        return (
          <View style={styles.pipGrid}>
            <View style={styles.pipRow}><Pip /><Pip /></View>
            <View style={styles.pipRow}><Pip /><Pip /></View>
            <View style={styles.pipRow}><Pip /><Pip /></View>
          </View>
        );
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={!canRoll || isRolling}
      onPress={onPressRoll}
      style={[
        styles.diceCube,
        {
          width: size,
          height: size,
          borderColor: canRoll ? colorScheme.primary : ROYAL_COLORS.border,
          borderWidth: canRoll ? 2.5 : 1,
          opacity: canRoll ? 1 : 0.65,
          shadowColor: canRoll ? colorScheme.primary : '#000',
          shadowOpacity: canRoll ? 0.7 : 0.3,
          shadowRadius: canRoll ? 8 : 4,
          elevation: canRoll ? 8 : 3,
        },
      ]}
    >
      <View style={styles.innerFace}>{renderPips()}</View>
      {canRoll && !isRolling && (
        <View style={[styles.rollBadge, { backgroundColor: colorScheme.primary }]}>
          <Text style={styles.rollBadgeText}>TAP</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  diceCube: {
    backgroundColor: '#F7FAFC',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  innerFace: {
    width: '78%',
    height: '78%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipDiagonal: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    padding: 2,
    flexDirection: 'row',
  },
  pipThree: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 2,
  },
  pipGrid: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-around',
  },
  pipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  pipCenterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  rollBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  rollBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },
});
