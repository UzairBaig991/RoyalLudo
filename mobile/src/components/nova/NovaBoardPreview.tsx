import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NOVA_COLORS } from '../../theme/colors';

interface NovaBoardPreviewProps {
  size?: number;
  style?: ViewStyle;
}

export const NovaBoardPreview: React.FC<NovaBoardPreviewProps> = ({
  size = 258,
  style,
}) => {
  const homeSize = size * 0.4;
  const finishSize = size * 0.2;
  const cellSize = size / 15;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* 1. TOP-LEFT: Coral Home */}
      <View
        style={[
          styles.homeBox,
          {
            width: homeSize,
            height: homeSize,
            top: 0,
            left: 0,
            backgroundColor: NOVA_COLORS.coral,
          },
        ]}
      >
        <View style={styles.homeInner}>
          <View style={[styles.tokenDot, { backgroundColor: NOVA_COLORS.coral }]} />
          <View style={[styles.tokenDot, { backgroundColor: NOVA_COLORS.coral }]} />
          <View style={[styles.tokenDot, { backgroundColor: NOVA_COLORS.coral }]} />
          <View style={[styles.tokenDot, { backgroundColor: NOVA_COLORS.coral }]} />
        </View>
      </View>

      {/* 2. TOP-RIGHT: Mint Home */}
      <View
        style={[
          styles.homeBox,
          {
            width: homeSize,
            height: homeSize,
            top: 0,
            right: 0,
            backgroundColor: NOVA_COLORS.mint,
          },
        ]}
      >
        <View style={styles.homeInner}>
          <View style={[styles.tokenDot, { backgroundColor: NOVA_COLORS.mint }]} />
          <View style={[styles.tokenDot, { backgroundColor: NOVA_COLORS.mint }]} />
          <View style={[styles.tokenDot, { backgroundColor: NOVA_COLORS.mint }]} />
          <View style={[styles.tokenDot, { backgroundColor: NOVA_COLORS.mint }]} />
        </View>
      </View>

      {/* 3. BOTTOM-LEFT: Blue Home */}
      <View
        style={[
          styles.homeBox,
          {
            width: homeSize,
            height: homeSize,
            bottom: 0,
            left: 0,
            backgroundColor: NOVA_COLORS.blue,
          },
        ]}
      >
        <View style={styles.homeInner}>
          <View style={[styles.tokenDot, { backgroundColor: NOVA_COLORS.blue }]} />
          <View style={[styles.tokenDot, { backgroundColor: NOVA_COLORS.blue }]} />
          <View style={[styles.tokenDot, { backgroundColor: NOVA_COLORS.blue }]} />
          <View style={[styles.tokenDot, { backgroundColor: NOVA_COLORS.blue }]} />
        </View>
      </View>

      {/* 4. BOTTOM-RIGHT: Gold Home */}
      <View
        style={[
          styles.homeBox,
          {
            width: homeSize,
            height: homeSize,
            bottom: 0,
            right: 0,
            backgroundColor: NOVA_COLORS.gold,
          },
        ]}
      >
        <View style={styles.homeInner}>
          <View style={[styles.tokenDot, { backgroundColor: NOVA_COLORS.gold }]} />
          <View style={[styles.tokenDot, { backgroundColor: NOVA_COLORS.gold }]} />
          <View style={[styles.tokenDot, { backgroundColor: NOVA_COLORS.gold }]} />
          <View style={[styles.tokenDot, { backgroundColor: NOVA_COLORS.gold }]} />
        </View>
      </View>

      {/* 5. Center Finish Star */}
      <View
        style={[
          styles.centerFinish,
          {
            width: finishSize,
            height: finishSize,
            top: homeSize,
            left: homeSize,
          },
        ]}
      >
        <Ionicons name="star" size={finishSize * 0.55} color={NOVA_COLORS.accentPurple} />
      </View>

      {/* Cross Paths Grid Highlights */}
      {/* Top runway (Mint) */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: homeSize + cellSize,
          width: cellSize,
          height: homeSize,
          backgroundColor: NOVA_COLORS.mint,
          opacity: 0.85,
          borderRadius: 2,
        }}
      />
      {/* Right runway (Blue) */}
      <View
        style={{
          position: 'absolute',
          top: homeSize + cellSize,
          left: homeSize + finishSize,
          width: homeSize,
          height: cellSize,
          backgroundColor: NOVA_COLORS.blue,
          opacity: 0.85,
          borderRadius: 2,
        }}
      />
      {/* Bottom runway (Gold) */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: homeSize + cellSize,
          width: cellSize,
          height: homeSize,
          backgroundColor: NOVA_COLORS.gold,
          opacity: 0.85,
          borderRadius: 2,
        }}
      />
      {/* Left runway (Coral) */}
      <View
        style={{
          position: 'absolute',
          top: homeSize + cellSize,
          left: 0,
          width: homeSize,
          height: cellSize,
          backgroundColor: NOVA_COLORS.coral,
          opacity: 0.85,
          borderRadius: 2,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f1f9',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  homeBox: {
    position: 'absolute',
    borderRadius: 14,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeInner: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f8f9ff',
    borderRadius: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 6,
    justifyContent: 'space-around',
    alignContent: 'space-around',
  },
  tokenDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  centerFinish: {
    position: 'absolute',
    backgroundColor: '#30254e',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
