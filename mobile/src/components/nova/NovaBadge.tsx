import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { NOVA_COLORS } from '../../theme/colors';

type BadgeColor = 'gold' | 'mint' | 'purple' | 'coral' | 'blue';

interface NovaBadgeProps {
  label: string;
  color?: BadgeColor;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const NovaBadge: React.FC<NovaBadgeProps> = ({
  label,
  color = 'purple',
  icon,
  style,
  textStyle,
}) => {
  const getTextColor = () => {
    switch (color) {
      case 'gold':
        return NOVA_COLORS.accentGold;
      case 'mint':
        return NOVA_COLORS.accentMint;
      case 'coral':
        return NOVA_COLORS.accentCoral;
      case 'blue':
        return NOVA_COLORS.accentBlue;
      case 'purple':
      default:
        return NOVA_COLORS.accentPurple;
    }
  };

  return (
    <View style={[styles.badge, style]}>
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text style={[styles.label, { color: getTextColor() }, textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    height: 30,
    backgroundColor: NOVA_COLORS.surfaceBadge,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  iconWrapper: {
    marginRight: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
