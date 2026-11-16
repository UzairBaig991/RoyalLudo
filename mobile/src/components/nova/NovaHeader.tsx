import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../theme/colors';

interface NovaHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export const NovaHeader: React.FC<NovaHeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightElement,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Status Row */}
      <View style={styles.statusBarMock}>
        <Text style={styles.clockText}>9:41</Text>
        <Text style={styles.signalIndicator}>{`▰  ▰  ▱`}</Text>
      </View>

      {/* Main Header Content */}
      <View style={styles.contentRow}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={24} color={NOVA_COLORS.textPrimary} />
          </TouchableOpacity>
        )}

        <View style={[styles.titleContainer, !showBack && { marginLeft: 0 }]}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          )}
        </View>

        {rightElement && <View style={styles.rightContainer}>{rightElement}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: NOVA_COLORS.bg,
  },
  statusBarMock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clockText: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  signalIndicator: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: NOVA_COLORS.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: NOVA_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: NOVA_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
    lineHeight: 18,
  },
  rightContainer: {
    marginLeft: 10,
  },
});
