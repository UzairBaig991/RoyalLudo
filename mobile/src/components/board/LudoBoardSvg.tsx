import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Svg, { Rect, Circle, Polygon, Path, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { ROYAL_COLORS, COLOR_MAP } from '../../theme/colors';
import { LudoBoard } from '../../../../shared/src/engine/LudoBoard';
import { useCustomizationStore } from '../../store/useCustomizationStore';
import type { GameState, Player, Token, ValidMove } from '../../../../shared/src/types';

interface LudoBoardSvgProps {
  boardSize?: number;
  size?: number;
  gameState?: GameState;
  validMoves?: ValidMove[];
  selectedTokenId?: number | null;
  onSelectToken?: (seatIndex: number, tokenId: number) => void;
  onTilePress?: (gridX: number, gridY: number) => void;
  onTokenPress?: (seatIndex: number, tokenId: number) => void;
}

export const LudoBoardSvg: React.FC<LudoBoardSvgProps> = ({
  boardSize,
  size,
  gameState,
  validMoves = [],
  selectedTokenId,
  onSelectToken,
  onTilePress,
  onTokenPress,
}) => {
  const actualSize = size || boardSize || 340;
  const tileSize = actualSize / 15;
  const currentTurnSeat = gameState?.currentTurnSeat ?? 0;
  const { boards } = useCustomizationStore();
  const equippedBoard = boards.find((b) => b.equipped) || boards[0];
  const boardBgColor = equippedBoard?.boardBg || ROYAL_COLORS.primaryBg;
  const boardCellBg = equippedBoard?.cellBg || ROYAL_COLORS.cardBg;
  const boardBorderColor = equippedBoard?.borderColor || ROYAL_COLORS.borderGold;

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

  // Directional chevron arrow centered at (cx, cy)
  const renderArrow = (cx: number, cy: number, direction: 'UP' | 'RIGHT' | 'DOWN' | 'LEFT', color = '#ffffff') => {
    const s = tileSize * 0.28;
    let points = '';
    if (direction === 'UP') {
      points = `${cx},${cy - s} ${cx - s * 0.75},${cy + s * 0.45} ${cx},${cy + s * 0.1} ${cx + s * 0.75},${cy + s * 0.45}`;
    } else if (direction === 'RIGHT') {
      points = `${cx + s},${cy} ${cx - s * 0.45},${cy - s * 0.75} ${cx - s * 0.1},${cy} ${cx - s * 0.45},${cy + s * 0.75}`;
    } else if (direction === 'DOWN') {
      points = `${cx},${cy + s} ${cx - s * 0.75},${cy - s * 0.45} ${cx},${cy - s * 0.1} ${cx + s * 0.75},${cy - s * 0.45}`;
    } else if (direction === 'LEFT') {
      points = `${cx - s},${cy} ${cx + s * 0.45},${cy - s * 0.75} ${cx + s * 0.1},${cy} ${cx + s * 0.45},${cy + s * 0.75}`;
    }
    return <Polygon points={points} fill={color} opacity={0.92} />;
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

    const isYardTurn =
      (colorKey === 'RED' && currentTurnSeat === 0) ||
      (colorKey === 'GREEN' && currentTurnSeat === 1) ||
      (colorKey === 'YELLOW' && currentTurnSeat === 2) ||
      (colorKey === 'BLUE' && currentTurnSeat === 3);

    return (
      <G key={`yard_${colorKey}`}>
        {/* Outer Colored Yard */}
        <Rect
          x={x}
          y={y}
          width={yardSize}
          height={yardSize}
          fill={color.primary}
          stroke={isYardTurn ? ROYAL_COLORS.gold : ROYAL_COLORS.border}
          strokeWidth={isYardTurn ? 2.5 : 1.5}
        />
        {/* Inner Platter */}
        <Rect
          x={innerX}
          y={innerY}
          width={innerSize}
          height={innerSize}
          rx={16}
          fill={ROYAL_COLORS.cardBg}
          stroke={isYardTurn ? ROYAL_COLORS.goldLight : color.primary}
          strokeWidth={isYardTurn ? 2.8 : 2}
        />
        {/* Active Yard Glowing Turn Dash Ring */}
        {isYardTurn && (
          <Rect
            x={innerX - 2}
            y={innerY - 2}
            width={innerSize + 4}
            height={innerSize + 4}
            rx={18}
            fill="none"
            stroke={ROYAL_COLORS.gold}
            strokeWidth={1.5}
            strokeDasharray="6,3"
          />
        )}
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
        let cellBg = boardBgColor;
        let isSafeStar = false;
        let starColor = ROYAL_COLORS.gold;
        let arrowDirection: 'UP' | 'RIGHT' | 'DOWN' | 'LEFT' | null = null;
        let isStartCell = false;

        // Colored Home Stretch Paths
        if (r === 7 && c >= 1 && c <= 5) cellBg = COLOR_MAP.GREEN.primary; // Green Home stretch
        else if (c === 7 && r >= 1 && r <= 5) cellBg = COLOR_MAP.YELLOW.primary; // Yellow Home stretch
        else if (r === 7 && c >= 9 && c <= 13) cellBg = COLOR_MAP.BLUE.primary; // Blue Home stretch
        else if (c === 7 && r >= 9 && r <= 13) cellBg = COLOR_MAP.RED.primary; // Red Home stretch

        // Colored Starting Cells with Movement Direction Arrows
        else if (r === 6 && c === 1) {
          cellBg = COLOR_MAP.GREEN.primary;
          arrowDirection = 'RIGHT';
          isStartCell = true;
        } else if (r === 1 && c === 8) {
          cellBg = COLOR_MAP.YELLOW.primary;
          arrowDirection = 'DOWN';
          isStartCell = true;
        } else if (r === 8 && c === 13) {
          cellBg = COLOR_MAP.BLUE.primary;
          arrowDirection = 'LEFT';
          isStartCell = true;
        } else if (r === 13 && c === 6) {
          cellBg = COLOR_MAP.RED.primary;
          arrowDirection = 'UP';
          isStartCell = true;
        }

        // Star Cells (8 steps from starts)
        else if ((r === 8 && c === 2) || (r === 2 && c === 6) || (r === 6 && c === 12) || (r === 12 && c === 8)) {
          isSafeStar = true;
          cellBg = boardCellBg;
        }
        // Arrow Shortcut Catapult Cells (indices 4, 17, 30, 43)
        else if (r === 9 && c === 6) {
          arrowDirection = 'LEFT';
        } else if (r === 6 && c === 5) {
          arrowDirection = 'UP';
        } else if (r === 5 && c === 8) {
          arrowDirection = 'RIGHT';
        } else if (r === 8 && c === 9) {
          arrowDirection = 'DOWN';
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
            {isStartCell && arrowDirection ? (
              renderArrow(x + tileSize / 2, y + tileSize / 2, arrowDirection, '#ffffff')
            ) : !isStartCell && arrowDirection ? (
              renderArrow(x + tileSize / 2, y + tileSize / 2, arrowDirection, '#E67E22')
            ) : isSafeStar ? (
              renderStar(x + tileSize / 2, y + tileSize / 2, tileSize * 0.35, starColor)
            ) : null}
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

  // Render destination landing cell previews for the current player's valid moves
  const renderDestinationHighlights = () => {
    if (!gameState || !validMoves || validMoves.length === 0) return null;
    const activePlayer = gameState.players.find((p) => p.seatIndex === currentTurnSeat);
    if (!activePlayer) return null;

    return validMoves.map((move, index) => {
      let destCoord: { row: number; col: number } | null = null;
      try {
        destCoord = LudoBoard.resolveGridCoordinate(activePlayer.color, move.tokenId, move.toStep);
      } catch (e) {
        destCoord = null;
      }
      if (!destCoord) return null;

      const cx = destCoord.col * tileSize + tileSize / 2;
      const cy = destCoord.row * tileSize + tileSize / 2;
      const r = tileSize * 0.44;

      if (move.capturesToken) {
        // Glowing enemy target / capture cell with crosshairs
        return (
          <G key={`dest_cap_${move.tokenId}_${index}`}>
            <Circle
              cx={cx}
              cy={cy}
              r={r}
              fill="rgba(255, 71, 87, 0.35)"
              stroke="#ff4757"
              strokeWidth={2.5}
            />
            <Circle
              cx={cx}
              cy={cy}
              r={r * 0.65}
              fill="none"
              stroke="#ff4757"
              strokeWidth={1.5}
              strokeDasharray="4,2"
            />
            <Circle cx={cx} cy={cy} r={3} fill="#ff4757" />
          </G>
        );
      }

      if (move.isFinish) {
        // Glowing Royal Finish Cell with Golden Star
        return (
          <G key={`dest_fin_${move.tokenId}_${index}`}>
            <Circle
              cx={cx}
              cy={cy}
              r={r}
              fill="rgba(244, 196, 48, 0.4)"
              stroke={ROYAL_COLORS.gold}
              strokeWidth={2.5}
            />
            {renderStar(cx, cy, r * 0.55, ROYAL_COLORS.gold)}
          </G>
        );
      }

      // Standard Move Landing Target
      return (
        <G key={`dest_step_${move.tokenId}_${index}`}>
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            fill="rgba(0, 242, 254, 0.22)"
            stroke="#00f2fe"
            strokeWidth={2}
            strokeDasharray="4,2"
          />
          <Circle cx={cx} cy={cy} r={r * 0.3} fill="#00f2fe" opacity={0.85} />
        </G>
      );
    });
  };

  // Interactive destination tap targets for effortless tap-to-move
  const renderDestinationTapTargets = () => {
    if (!gameState || !validMoves || validMoves.length === 0) return null;
    const activePlayer = gameState.players.find((p) => p.seatIndex === currentTurnSeat);
    if (!activePlayer) return null;

    return validMoves.map((move, index) => {
      let destCoord: { row: number; col: number } | null = null;
      try {
        destCoord = LudoBoard.resolveGridCoordinate(activePlayer.color, move.tokenId, move.toStep);
      } catch (e) {
        destCoord = null;
      }
      if (!destCoord) return null;

      const cellX = destCoord.col * tileSize;
      const cellY = destCoord.row * tileSize;

      return (
        <TouchableOpacity
          key={`dest_tap_${move.tokenId}_${index}`}
          activeOpacity={0.6}
          onPress={() => {
            if (onTokenPress) onTokenPress(currentTurnSeat, move.tokenId);
            if (onSelectToken) onSelectToken(currentTurnSeat, move.tokenId);
            if (onTilePress) onTilePress(destCoord!.col, destCoord!.row);
          }}
          style={{
            position: 'absolute',
            left: cellX,
            top: cellY,
            width: tileSize,
            height: tileSize,
            zIndex: 9,
          }}
        />
      );
    });
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

        const move = validMoves.find((m) => m.tokenId === token.id && player.seatIndex === currentTurnSeat);
        const isCaptureMove = !!move?.capturesToken;
        const isFinishMove = !!move?.isFinish;
        const isExitMove = !!move?.isEntry;

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
                borderColor: token.isShielded
                  ? '#83e6c0'
                  : isCaptureMove
                  ? '#ff4757'
                  : isValid
                  ? ROYAL_COLORS.goldLight
                  : '#FFFFFF',
                borderWidth: token.isShielded ? 3 : isValid ? 2.8 : 1.5,
                transform: [{ scale: isValid ? 1.14 : 1 }],
                elevation: isValid ? 9 : 4,
                shadowColor: token.isShielded
                  ? '#83e6c0'
                  : isCaptureMove
                  ? '#ff4757'
                  : isValid
                  ? ROYAL_COLORS.gold
                  : '#000',
                shadowOpacity: isValid ? 0.95 : 0.4,
                shadowRadius: isValid ? 7 : 3,
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
              {token.isShielded ? (
                <Ionicons name="shield" size={10} color="#0d101e" />
              ) : items.length > 1 ? (
                <Text style={styles.stackCountText}>{items.length}</Text>
              ) : null}
            </View>

            {/* Action Badge for Playable Token */}
            {isValid && (
              <View
                style={[
                  styles.tokenActionBadge,
                  isCaptureMove && styles.badgeCapture,
                  isFinishMove && styles.badgeFinish,
                  isExitMove && styles.badgeExit,
                ]}
              >
                <Text style={styles.tokenActionText}>
                  {isCaptureMove ? '⚔️' : isFinishMove ? '👑' : isExitMove ? '🚀' : '•'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      });
    });

    return tokenElements;
  };

  return (
    <View style={[styles.container, { width: actualSize, height: actualSize, borderColor: boardBorderColor, backgroundColor: boardBgColor }]}>
      <Svg width={actualSize} height={actualSize}>
        {/* Background Base */}
        <Rect x={0} y={0} width={actualSize} height={actualSize} fill={boardBgColor} />

        {/* 4 Quadrant Yards */}
        {renderYard(0, 0, 'GREEN')}
        {renderYard(0, 9, 'YELLOW')}
        {renderYard(9, 9, 'BLUE')}
        {renderYard(9, 0, 'RED')}

        {/* Grid Cells */}
        {renderGridCells()}

        {/* Center Finish Triangles */}
        {renderCenterTriangles()}

        {/* Destination Landing Highlights */}
        {renderDestinationHighlights()}
      </Svg>

      {/* Interactive Destination Tap Targets */}
      {renderDestinationTapTargets()}

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
  tokenActionBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: ROYAL_COLORS.cardBg,
    borderWidth: 1.2,
    borderColor: ROYAL_COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 3,
  },
  badgeCapture: {
    backgroundColor: '#ff4757',
    borderColor: '#ffffff',
  },
  badgeFinish: {
    backgroundColor: '#ffd700',
    borderColor: '#ffffff',
  },
  badgeExit: {
    backgroundColor: '#2ed573',
    borderColor: '#ffffff',
  },
  tokenActionText: {
    fontSize: 9,
    lineHeight: 11,
  },
});
