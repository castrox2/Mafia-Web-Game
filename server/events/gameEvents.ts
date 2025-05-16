import { Server, Socket } from 'socket.io';
import { GameStore } from './GameStore';
import { GameEngine } from './GameEngine';

export function registerGameEvents(io: Server, gameStore: GameStore) {
    // On connection, sets up new listener on new player connection to Socket.IO server
    io.on('connection', (socket: Socket) => {
        // DEBUG
        console.log(`Player connected: ${socket.id}`);

        // Sets up listener for custom event called "playerVote"
        socket.on('playerVote', ({ gameId, voterId, targetId}) => {

            // Calls your gameStore to retrieve in-memory GameEngine instance that matches given gameId
            const game = gameStore.getGame(gameId);

            // Logs error if no game found
            if (!game) {
                console.error('Game not found with ID: ${gameId}');
                socket.emit ('error', { message: 'Game not found.'});
                return;
            }
            
            try {
                // Stores signal of a completevoted (and if tie)
                const { voteComplete, tie, tieCandidates } = game.submitVote(voterId, targetId);
                // DEBUG
                console.log(`[playerVote] ${voterId} voted for ${targetId} in game ${gameId}`);
            
                // Only broadcast/change state when voting is done
                if (voteComplete) {
                const publicState = game.getPublicState();
                io.to(gameId).emit('voteUpdate', publicState);
        
                if (tie) {
                    // Send tie-specific event with allowed candidates for the frontend
                    io.to(gameId).emit('voteTie', {
                        message: 'Vote tied. Revoting among tied players only.',
                        candidates: tieCandidates,
                    });
                    } else {
                    io.to(gameId).emit('phaseReady', { message: 'Vote complete. Ready to continue.' });
                    }
                }
              } catch (error) {
                console.error('[playerVote] Error:', error);
                socket.emit('error', { message: 'Failed to submit vote.' });
            }
        });

        // Sets up listener for custom event called "nextPhase"
        socket.on('nextPhase', ({ gameId }) => {

            // Calls your gameStore to retrieve in-memory GameEngine instance that matches given gameId
            const game = gameStore.getGame(gameId);

            // Logs error if no game found
            if (!game) {
                console.error('Game not found with ID: ${gameId}');
                socket.emit ('error', { message: 'Game not found.'});
                return;
            }

            try {
                game.nextPhase(); 
                console.log('[nextphase] Phase advanced. New phase: ${game.getPublicState().phase}');

                // Emit the updated game state to all players
                const publicState = game.getPublicState();
                io.to(gameId).emit('phaseUpdate', publicState);

                // Optionally inform players of game end
                if (publicState.winner) {
                    io.to(gameId).emit('gameEnded', { winner: publicState.winner });
                }
            } catch (error) {
                console.error(`[nextPhase] Error:`, error);
                socket.emit('error', { message: 'Failed to advance phase.' });
            }
        });

        // Sets up listener for custom event called "submitMafiaVote"
        socket.on('submitMafiaVote', ({ gameId, voterId, targetId }) => {
            // Calls your gameStore to retrieve in-memory GameEngine instance that matches given gameId
            const game = gameStore.getGame(gameId);

            // Logs error if no game found
            if (!game) {
                console.error('Game not found with ID: ${gameId}');
                socket.emit ('error', { message: 'Game not found.'});
                return;
            }

            try {
                game.submitMafiaVote(voterId, targetId);
                console.log('[submitMafiaVote] ${voterId} voted to kill ${targetId} in game ${gameId}');
            
                // Optionally: emit a status update (e.g., to notify mafia that voting is complete)
                const state = game.getPublicState();
                io.to(gameId).emit('mafiaVoteUpdate', state);
            
              } catch (error) {
                console.error('[submitMafiaVote] Error:', error);
                socket.emit('error', { message: 'Failed to submit mafia vote.' });
              }
        });

        // Sets up listener for custom event called "detectiveAction"
        socket.on('detectiveAction', ({ gameId, playerId, targetId }) => {
            // Calls your gameStore to retrieve in-memory GameEngine instance that matches given gameId
            const game = gameStore.getGame(gameId);

            // Logs error if no game found
            if (!game) {
                console.error('Game not found with ID: ${gameId}');
                socket.emit ('error', { message: 'Game not found.'});
                return;
            }

            try {
                // Store the detective's choice; result is processed during nextPhase()
                game['detectiveTargetId'] = targetId;
            
                console.log('[detectiveAction] Detective ${playerId} chose to investigate ${targetId}');
            
                socket.emit('detectiveConfirmed', { message: 'Target locked. Awaiting next phase.' });
            
              } catch (error) {
                console.error('[detectiveAction] Error:', error);
                socket.emit('error', { message: 'Failed to process detective action.' });
              }
        });
    }
}