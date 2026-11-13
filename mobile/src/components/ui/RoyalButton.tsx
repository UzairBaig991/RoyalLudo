import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { ROYAL_COLORS } from '../../theme/colors';

interface RoyalButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'gold' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const RoyalButton: React.FC<RoyalButtonProps> = ({
  title,
  onPress,
  variant = 'gold',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return ROYAL_COLORS.border;
    switch (variant) {
      case 'gold':
        return ROYAL_COLORS.gold;
      case 'secondary':
        return ROYAL_COLORS.cardBg;
      case 'danger':
        return ROYAL_COLORS.red;
      case 'ghost':
        return 'transparent';
    }
  };

  const getTextColor = () => {
    if (disabled) return ROYAL_COLORS.textMuted;
    switch (variant) {
      case 'gold':
        return '#0A0F1D'; // High contrast black on gold
      case 'danger':
        return '#FFFFFF';
      default:
        return ROYAL_COLORS.goldLight;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        styles[size],
        {
          backgroundColor: getBackgroundColor(),
          borderColor: variant === 'secondary' ? ROYAL_COLORS.border : 'transparent',
          borderWidth: variant === 'secondary' ? 1 : 0,
        },
        style,
      ]}
    >
      {icon}
      <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  small: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 28,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
