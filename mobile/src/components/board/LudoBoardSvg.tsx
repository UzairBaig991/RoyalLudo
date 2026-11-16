import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Svg, { Rect, Circle, Polygon, Path, G } from 'react-native-svg';
import { ROYAL_COLORS, COLOR_MAP } from '../../theme/colors';
import { LudoBoard } from '@royal-ludo/shared';
import type { GameState, Player, Token, ValidMove } from '@royal-ludo/shared';

interface LudoBoardSvgProps {
  boardSize?: number;
  size?: number;
  gameState?: GameState;
  validMoves?: ValidMove[];
  onSelectToken?: (seatIndex: number, tokenId: number) => void;
  onTilePress?: (gridX: number, gridY: number) => void;
  onTokenPress?: (seatIndex: number, tokenId: number) => void;
}

export const LudoBoardSvg: React.FC<LudoBoardSvgProps> = ({
  boardSize,
  size,
  gameState,
  validMoves = [],
  onSelectToken,
  onTilePress,
  onTokenPress,
}) => {
  const actualSize = size || boardSize || 340;
  const tileSize = actualSize / 15;
  const currentTurnSeat = gameState?.currentTurnSeat ?? 0;

  // Star SVG Path centered at (cx, cy)
  const renderStar = (cx: number, cy: number, r: number, color = ROYAL_COLORS.gold) => {
    const points: string[] = [];
    for (let i = 0; i < 5; i++) {
      const outerAngle = (i * 72 - 90) * (Math.PI / 180);
      const innerAngle = (i * 72 + 36 - 90) * (Math.PI / 180);
      points.push(`${cx + r * Math.cos(outerAngle)},${cy + r * Math.sin(outerAngle)}`);
      points.push(`${cx + (r * 0.45) * Math.cos(innerAngle)},${cy + (r * 0.45) * Math.sin(innerAngle)}`);
    }
    return <Polygon points={points.join(' ')} fill={color} />;
  };

  // Render 6x6 Yard for a quadrant
  const renderYard = (
    startRow: number,
    startCol: number,
    colorKey: 'RED' | 'GREEN' | 'YELLOW' | 'BLUE'
  ) => {
    const x = startCol * tileSize;
    const y = startRow * tileSize;
    const yardSize = 6 * tileSize;
    const color = COLOR_MAP[colorKey];

    const innerPadding = tileSize * 0.75;
    const innerX = x + innerPadding;
    const innerY = y + innerPadding;
    const innerSize = yardSize - 2 * innerPadding;

    // 4 base circles for tokens
    const slotRadius = tileSize * 0.55;
    const slotCenters = [
      { cx: innerX + innerSize * 0.3, cy: innerY + innerSize * 0.3 },
      { cx: innerX + innerSize * 0.7, cy: innerY + innerSize * 0.3 },
      { cx: innerX + innerSize * 0.3, cy: innerY + innerSize * 0.7 },
      { cx: innerX + innerSize * 0.7, cy: innerY + innerSize * 0.7 },
    ];

    return (
      <G key={`yard_${colorKey}`}>
        {/* Outer Colored Yard */}
        <Rect
          x={x}
          y={y}
          width={yardSize}
          height={yardSize}
          fill={color.primary}
          stroke={ROYAL_COLORS.border}
          strokeWidth={1.5}
        />
        {/* Inner Platter */}
        <Rect
          x={innerX}
          y={innerY}
          width={innerSize}
          height={innerSize}
          rx={16}
          fill={ROYAL_COLORS.cardBg}
          stroke={color.primary}
          strokeWidth={2}
        />
        {/* 4 Yard Slots */}
        {slotCenters.map((slot, i) => (
          <Circle
            key={`slot_${colorKey}_${i}`}
            cx={slot.cx}
            cy={slot.cy}
            r={slotRadius}
            fill={ROYAL_COLORS.secondaryBg}
            stroke={color.light}
            strokeWidth={1.5}
          />
        ))}
      </G>
    );
  };

  // Render individual grid cells in the cross arms
  const renderGridCells = () => {
    const cells: React.ReactNode[] = [];

    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        // Skip yard quadrants and center finish area
        const inGreenYard = r < 6 && c < 6;
        const inYellowYard = r < 6 && c > 8;
        const inRedYard = r > 8 && c < 6;
        const inBlueYard = r > 8 && c > 8;
        const inCenter = r >= 6 && r <= 8 && c >= 6 && c <= 8;

        if (inGreenYard || inYellowYard || inRedYard || inBlueYard || inCenter) {
          continue;
        }

        const x = c * tileSize;
        const y = r * tileSize;

        // Determine cell background color
        let cellBg = ROYAL_COLORS.primaryBg;
        let isSafeStar = false;
        let starColor = ROYAL_COLORS.gold;

        // Colored Home Stretch Paths
        if (r === 7 && c >= 1 && c <= 5) cellBg = COLOR_MAP.GREEN.primary; // Green Home stretch
        else if (c === 7 && r >= 1 && r <= 5) cellBg = COLOR_MAP.YELLOW.primary; // Yellow Home stretch
        else if (r === 7 && c >= 9 && c <= 13) cellBg = COLOR_MAP.BLUE.primary; // Blue Home stretch
        else if (c === 7 && r >= 9 && r <= 13) cellBg = COLOR_MAP.RED.primary; // Red Home stretch

        // Colored Starting Cells
        else if (r === 6 && c === 1) {
          cellBg = COLOR_MAP.GREEN.primary;
          isSafeStar = true;
        } else if (r === 1 && c === 8) {
          cellBg = COLOR_MAP.YELLOW.primary;
          isSafeStar = true;
        } else if (r === 8 && c === 13) {
          cellBg = COLOR_MAP.BLUE.primary;
          isSafeStar = true;
        } else if (r === 13 && c === 6) {
          cellBg = COLOR_MAP.RED.primary;
          isSafeStar = true;
        }

        // Star Cells (8 steps from starts)
        else if ((r === 8 && c === 2) || (r === 2 && c === 6) || (r === 6 && c === 12) || (r === 12 && c === 8)) {
          isSafeStar = true;
          cellBg = ROYAL_COLORS.cardBg;
        }

        cells.push(
          <G key={`cell_${r}_${c}`}>
            <Rect
              x={x}
              y={y}
              width={tileSize}
              height={tileSize}
              fill={cellBg}
              stroke={ROYAL_COLORS.border}
              strokeWidth={0.8}
            />
            {isSafeStar && renderStar(x + tileSize / 2, y + tileSize / 2, tileSize * 0.35, starColor)}
          </G>
        );
      }
    }

    return cells;
  };

  // Render 4 Center Triangles meeting in center
  const renderCenterTriangles = () => {
    const cx = 7.5 * tileSize;
    const cy = 7.5 * tileSize;
    const top = 6 * tileSize;
    const bottom = 9 * tileSize;
    const left = 6 * tileSize;
    const right = 9 * tileSize;

    return (
      <G key="center_finish">
        {/* Left Triangle (Green) */}
        <Polygon points={`${left},${top} ${cx},${cy} ${left},${bottom}`} fill={COLOR_MAP.GREEN.primary} />
        {/* Top Triangle (Yellow) */}
        <Polygon points={`${left},${top} ${cx},${cy} ${right},${top}`} fill={COLOR_MAP.YELLOW.primary} />
        {/* Right Triangle (Blue) */}
        <Polygon points={`${right},${top} ${cx},${cy} ${right},${bottom}`} fill={COLOR_MAP.BLUE.primary} />
        {/* Bottom Triangle (Red) */}
        <Polygon points={`${left},${bottom} ${cx},${cy} ${right},${bottom}`} fill={COLOR_MAP.RED.primary} />

        {/* Center Royal Crown/Medallion */}
        <Circle cx={cx} cy={cy} r={tileSize * 0.6} fill={ROYAL_COLORS.cardBg} stroke={ROYAL_COLORS.gold} strokeWidth={2} />
        {renderStar(cx, cy, tileSize * 0.35, ROYAL_COLORS.gold)}
      </G>
    );
  };

  // Render all active player tokens
  const renderTokens = () => {
    if (!gameState) return null;
    const tokenElements: React.ReactNode[] = [];

    // Group tokens by cell coordinate to display stacks cleanly
    const cellGroups: Record<string, { player: Player; token: Token; isValid: boolean }[]> = {};

    for (const player of gameState.players) {
      for (const token of player.tokens) {
        if (token.position.state === 'FINISHED') continue;

        const coord = token.position.gridCoord;
        const key = `${coord.row}_${coord.col}`;
        const isValid = validMoves.some((m) => m.tokenId === token.id && player.seatIndex === currentTurnSeat);

        if (!cellGroups[key]) cellGroups[key] = [];
        cellGroups[key].push({ player, token, isValid });
      }
    }

    // Render grouped tokens
    Object.entries(cellGroups).forEach(([key, items]) => {
      const [rStr, cStr] = key.split('_');
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);
      const cellX = c * tileSize;
      const cellY = r * tileSize;

      items.forEach((item, idx) => {
        const { player, token, isValid } = item;
        const color = COLOR_MAP[player.color as keyof typeof COLOR_MAP] || COLOR_MAP.RED;

        // Slight offset if stacked on same tile
        const offset = items.length > 1 ? (idx - (items.length - 1) / 2) * 5 : 0;
        const tokenDiameter = tileSize * 0.85;

        tokenElements.push(
          <TouchableOpacity
            key={`token_${player.color}_${token.id}`}
            activeOpacity={0.8}
            disabled={!isValid}
            onPress={() => {
              if (onTokenPress) onTokenPress(player.seatIndex, token.id);
              if (onSelectToken) onSelectToken(player.seatIndex, token.id);
            }}
            style={[
              styles.tokenContainer,
              {
                left: cellX + (tileSize - tokenDiameter) / 2 + offset,
                top: cellY + (tileSize - tokenDiameter) / 2 + offset,
                width: tokenDiameter,
                height: tokenDiameter,
                borderRadius: tokenDiameter / 2,
                backgroundColor: color.primary,
                borderColor: isValid ? ROYAL_COLORS.goldLight : '#FFFFFF',
                borderWidth: isValid ? 2.5 : 1.5,
                transform: [{ scale: isValid ? 1.12 : 1 }],
                elevation: isValid ? 8 : 4,
                shadowColor: isValid ? ROYAL_COLORS.gold : '#000',
                shadowOpacity: isValid ? 0.9 : 0.4,
                shadowRadius: isValid ? 6 : 3,
              },
            ]}
          >
            {/* Inner glossy highlight */}
            <View
              style={[
                styles.tokenInner,
                {
                  width: tokenDiameter * 0.55,
                  height: tokenDiameter * 0.55,
                  borderRadius: tokenDiameter * 0.55 / 2,
                  backgroundColor: color.light,
                },
              ]}
            >
              {items.length > 1 && (
                <Text style={styles.stackCountText}>{items.length}</Text>
              )}
            </View>
          </TouchableOpacity>
        );
      });
    });

    return tokenElements;
  };

  return (
    <View style={[styles.container, { width: boardSize, height: boardSize }]}>
      <Svg width={boardSize} height={boardSize}>
        {/* Background Base */}
        <Rect x={0} y={0} width={boardSize} height={boardSize} fill={ROYAL_COLORS.primaryBg} />

        {/* 4 Quadrant Yards */}
        {renderYard(0, 0, 'GREEN')}
        {renderYard(0, 9, 'YELLOW')}
        {renderYard(9, 9, 'BLUE')}
        {renderYard(9, 0, 'RED')}

        {/* Grid Cells */}
        {renderGridCells()}

        {/* Center Finish Triangles */}
        {renderCenterTriangles()}
      </Svg>

      {/* Interactive Token Layer */}
      {renderTokens()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: ROYAL_COLORS.borderGold,
    backgroundColor: ROYAL_COLORS.primaryBg,
  },
  tokenContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  tokenInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackCountText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '900',
  },
});
