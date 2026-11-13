import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ROYAL_COLORS } from '../../theme/colors';

interface CurrencyBadgeProps {
  type: 'gold' | 'gems';
  amount: number;
  onPressPlus?: () => void;
}

export const CurrencyBadge: React.FC<CurrencyBadgeProps> = ({ type, amount, onPressPlus }) => {
  const isGold = type === 'gold';

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconPill, { backgroundColor: isGold ? '#B8860B' : '#008080' }]}>
        <Text style={styles.iconText}>{isGold ? '🪙' : '💎'}</Text>
      </View>
      <Text style={styles.amountText}>{formatNumber(amount)}</Text>
      {onPressPlus && (
        <TouchableOpacity style={styles.plusButton} onPress={onPressPlus} activeOpacity={0.7}>
          <Text style={styles.plusText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 24, 39, 0.75)',
    borderWidth: 1,
    borderColor: ROYAL_COLORS.border,
    borderRadius: 20,
    paddingRight: 6,
    paddingLeft: 4,
    height: 32,
  },
  iconPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  iconText: {
    fontSize: 13,
  },
  amountText: {
    color: ROYAL_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginRight: 6,
  },
  plusButton: {
    backgroundColor: ROYAL_COLORS.gold,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 14,
  },
});
