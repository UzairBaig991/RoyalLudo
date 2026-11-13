import type { Server, Socket } from 'socket.io';
import { RoomService } from '../services/roomService';
import { EconomyService } from '../services/economyService';
import { DataStore } from '../services/store';
import { LudoGame } from '../../../shared/src/engine/LudoGame';
import type { ClientToServerEvents, ServerToClientEvents } from '../../../shared/src/types';

export class GameSocketHandler {
  public static register(
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    userId: string
  ): void {
    // 1. ROLL DICE
    socket.on('game:roll_dice', () => {
      try {
        const roomId = Array.from(socket.rooms).find((r) => r.startsWith('room_'));
        if (!roomId) throw new Error('Not in an active game room.');

        const game = RoomService.getActiveGame(roomId);
        if (!game) throw new Error('No active game session found.');

        const room = DataStore.rooms.get(roomId);
        const participant = room?.participants.find((p) => p.userId === userId);
        if (!participant) throw new Error('Participant not in room.');

        const seatIndex = participant.seatIndex;
        const rollResult = game.rollDice(seatIndex);

        // Broadcast roll result
        io.to(roomId).emit('game:dice_rolled', {
          seatIndex,
          diceValue: rollResult.diceValue,
          validMoves: rollResult.validMoves,
          extraTurn: false,
        });

        // If turn was forfeited or no moves available, turn was already passed
        if (rollResult.turnPassed) {
          const state = game.getState();
          io.to(roomId).emit('game:turn_change', {
            currentSeat: state.currentTurnSeat,
            turnTimer: state.rules.turnTimerSeconds,
          });

          // Check if next player is bot
          this.triggerBotTurnIfNeeded(io, roomId, game);
        }
      } catch (err: any) {
        socket.emit('error:message', { message: err.message });
      }
    });

    // 2. MOVE TOKEN
    socket.on('game:move_token', ({ tokenId }) => {
      try {
        const roomId = Array.from(socket.rooms).find((r) => r.startsWith('room_'));
        if (!roomId) throw new Error('Not in an active game room.');

        const game = RoomService.getActiveGame(roomId);
        if (!game) throw new Error('No active game session found.');

        const room = DataStore.rooms.get(roomId);
        const participant = room?.participants.find((p) => p.userId === userId);
        if (!participant) throw new Error('Participant not in room.');

        const seatIndex = participant.seatIndex;
        const moveRes = game.moveToken(seatIndex, tokenId);

        // Broadcast token movement
        io.to(roomId).emit('game:token_moved', {
          seatIndex,
          tokenId: moveRes.movedTokenId,
          fromStep: moveRes.fromStep,
          toStep: moveRes.toStep,
          capturesToken: moveRes.capturedToken,
          extraTurn: moveRes.extraTurn,
          finished: moveRes.playerFinished,
        });

        // If match concluded
        if (moveRes.gameOver) {
          const state = game.getState();
          room!.status = 'finished';

          // Distribute economy rewards
          const rewards: any[] = [];
          if (state.rankings.length > 0) {
            const winnerSeat = state.rankings[0].seatIndex;
            const winner = room?.participants.find((p) => p.seatIndex === winnerSeat);
            if (winner && !winner.isBot) {
              const prize = room!.prizePool;
              EconomyService.credit(winner.userId, 'gold', prize, 'match_victory');
              rewards.push({ userId: winner.userId, rank: 1, goldReward: prize, xpGained: 250 });
            }
          }

          io.to(roomId).emit('game:finished', {
            rankings: state.rankings,
            rewards,
          });

          return;
        }

        // If extra turn, player continues
        const state = game.getState();
        io.to(roomId).emit('game:turn_change', {
          currentSeat: state.currentTurnSeat,
          turnTimer: state.rules.turnTimerSeconds,
        });

        // Check if next player is bot
        this.triggerBotTurnIfNeeded(io, roomId, game);
      } catch (err: any) {
        socket.emit('error:message', { message: err.message });
      }
    });

    // 3. EMOJI REACTION
    socket.on('game:emoji', ({ emojiId }) => {
      const roomId = Array.from(socket.rooms).find((r) => r.startsWith('room_'));
      if (!roomId) return;
      const room = DataStore.rooms.get(roomId);
      const participant = room?.participants.find((p) => p.userId === userId);
      if (participant) {
        io.to(roomId).emit('game:emoji_reaction', {
          seatIndex: participant.seatIndex,
          emojiId,
        });
      }
    });

    // 4. LIVE CHAT
    socket.on('game:chat', ({ message }) => {
      const roomId = Array.from(socket.rooms).find((r) => r.startsWith('room_'));
      if (!roomId || !message.trim()) return;
      const room = DataStore.rooms.get(roomId);
      const participant = room?.participants.find((p) => p.userId === userId);
      if (participant) {
        io.to(roomId).emit('game:chat_message', {
          seatIndex: participant.seatIndex,
          username: participant.username,
          message: message.trim().slice(0, 100),
        });
      }
    });

    // 5. SEND GIFT
    socket.on('game:send_gift', ({ targetSeat, giftId }) => {
      const roomId = Array.from(socket.rooms).find((r) => r.startsWith('room_'));
      if (!roomId) return;
      const room = DataStore.rooms.get(roomId);
      const participant = room?.participants.find((p) => p.userId === userId);
      if (participant) {
        io.to(roomId).emit('game:gift_delivered', {
          fromSeat: participant.seatIndex,
          toSeat: targetSeat,
          giftId,
        });
      }
    });
  }

  /**
   * Helper to execute autonomous bot actions when bot's turn arrives
   */
  public static triggerBotTurnIfNeeded(
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    roomId: string,
    game: LudoGame
  ): void {
    const state = game.getState();
    if (state.turnPhase === 'GAME_OVER') return;

    const currentSeat = state.currentTurnSeat;
    const player = state.players.find((p) => p.seatIndex === currentSeat);
    if (!player || !player.isBot) return;

    // Simulate 800ms bot thinking time for natural realism
    setTimeout(() => {
      try {
        const botRes = game.playBotTurn('medium');
        if (!botRes) return;

        io.to(roomId).emit('game:dice_rolled', {
          seatIndex: currentSeat,
          diceValue: botRes.rolledValue,
          validMoves: [],
          extraTurn: botRes.extraTurn,
        });

        if (botRes.movedTokenId !== null) {
          setTimeout(() => {
            const updatedState = game.getState();
            const token = player.tokens.find((t) => t.id === botRes.movedTokenId);
            io.to(roomId).emit('game:token_moved', {
              seatIndex: currentSeat,
              tokenId: botRes.movedTokenId!,
              fromStep: token?.position.step || 0,
              toStep: token?.position.step || 0,
              extraTurn: botRes.extraTurn,
              finished: token?.position.state === 'FINISHED',
            });

            if (botRes.gameOver) {
              io.to(roomId).emit('game:finished', {
                rankings: updatedState.rankings,
                rewards: [],
              });
              return;
            }

            io.to(roomId).emit('game:turn_change', {
              currentSeat: updatedState.currentTurnSeat,
              turnTimer: updatedState.rules.turnTimerSeconds,
            });

            // If bot gets another turn, recurse
            if (botRes.extraTurn) {
              this.triggerBotTurnIfNeeded(io, roomId, game);
            }
          }, 600);
        } else {
          // Bot rolled and had no legal moves
          const updatedState = game.getState();
          io.to(roomId).emit('game:turn_change', {
            currentSeat: updatedState.currentTurnSeat,
            turnTimer: updatedState.rules.turnTimerSeconds,
          });
        }
      } catch (e) {
        console.error('Error during bot turn:', e);
      }
    }, 700);
  }
}
