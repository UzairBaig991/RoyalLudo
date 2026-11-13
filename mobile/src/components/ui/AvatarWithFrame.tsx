import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ROYAL_COLORS } from '../../theme/colors';

interface AvatarProps {
  username: string;
  avatarUrl?: string;
  size?: number;
  level?: number;
  isTurn?: boolean;
}

export const AvatarWithFrame: React.FC<AvatarProps> = ({
  username,
  avatarUrl,
  size = 48,
  level,
  isTurn = false,
}) => {
  const initial = username ? username.charAt(0).toUpperCase() : 'P';

  return (
    <View style={[styles.wrapper, { width: size + 6, height: size + 6 }]}>
      <View
        style={[
          styles.frame,
          {
            width: size + 6,
            height: size + 6,
            borderRadius: (size + 6) / 2,
            borderColor: isTurn ? ROYAL_COLORS.gold : ROYAL_COLORS.border,
            borderWidth: isTurn ? 2.5 : 1.5,
          },
        ]}
      >
        <View
          style={[
            styles.avatarCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: ROYAL_COLORS.secondaryBg,
            },
          ]}
        >
          <Text style={[styles.avatarInitial, { fontSize: size * 0.45 }]}>{initial}</Text>
        </View>
      </View>
      {level !== undefined && (
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{level}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: ROYAL_COLORS.goldLight,
    fontWeight: '800',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: ROYAL_COLORS.goldDark,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#000',
  },
  levelText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
