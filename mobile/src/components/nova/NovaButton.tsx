import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { NOVA_COLORS } from '../../theme/colors';

type ButtonVariant = 'primary' | 'white' | 'dark' | 'facebook' | 'gold' | 'outline' | 'danger';

interface NovaButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const NovaButton: React.FC<NovaButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return '#2a2e45';
    switch (variant) {
      case 'primary':
        return NOVA_COLORS.accentPurple;
      case 'white':
        return NOVA_COLORS.surfaceWhite;
      case 'dark':
        return NOVA_COLORS.surfaceCard;
      case 'facebook':
        return NOVA_COLORS.accentFacebook;
      case 'gold':
        return NOVA_COLORS.accentGold;
      case 'danger':
        return '#e04f5f';
      case 'outline':
        return 'transparent';
      default:
        return NOVA_COLORS.accentPurple;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#6b7280';
    switch (variant) {
      case 'primary':
      case 'white':
      case 'gold':
        return NOVA_COLORS.textDark;
      case 'dark':
      case 'facebook':
      case 'danger':
        return NOVA_COLORS.textPrimary;
      case 'outline':
        return NOVA_COLORS.accentPurple;
      default:
        return NOVA_COLORS.textDark;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outlineBorder,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  outlineBorder: {
    borderWidth: 1.5,
    borderColor: NOVA_COLORS.accentPurple,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 10,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
