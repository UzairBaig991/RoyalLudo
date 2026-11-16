import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { NOVA_COLORS } from '../../theme/colors';

interface NovaCardProps {
  children: React.ReactNode;
  variant?: 'card' | 'purple' | 'elevated';
  style?: ViewStyle;
  onPress?: () => void;
}

export const NovaCard: React.FC<NovaCardProps> = ({
  children,
  variant = 'card',
  style,
  onPress,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'purple':
        return NOVA_COLORS.surfaceBadge;
      case 'elevated':
        return NOVA_COLORS.surfaceElevated;
      case 'card':
      default:
        return NOVA_COLORS.surfaceCard;
    }
  };

  const cardStyle = [
    styles.card,
    { backgroundColor: getBackgroundColor() },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
  },
});
