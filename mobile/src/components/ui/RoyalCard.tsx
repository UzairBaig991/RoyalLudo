import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { ROYAL_COLORS } from '../../theme/colors';

interface RoyalCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  goldBorder?: boolean;
}

export const RoyalCard: React.FC<RoyalCardProps> = ({ children, style, goldBorder = false }) => {
  return (
    <View
      style={[
        styles.card,
        {
          borderColor: goldBorder ? ROYAL_COLORS.borderGold : ROYAL_COLORS.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: ROYAL_COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
});
