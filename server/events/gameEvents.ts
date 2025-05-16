import { Server, Socket } from 'socket.io';
import { GameStore } from './GameStore';
import { GameEngine } from './GameEngine';

export function registerGameEvents(io: Server, gameStore: GameStore) {
    // On connection, make a new socket for the user
    io.on('connection', (socket: Socket) => {
        console.log(`Player connected: ${socket.id}`);

        socket.on('playerVote', ({ gameId, voterId, targetId}) => {

            const game = gameStore.getGame(gameId);

            if (!game) {
                console.error('Game not found with ID: ${gameId}');
                socket.emit ('error', { message: 'Game not found.'});
                return;
            }

            try {
                game.submitVote(voterId, targetId);
                console.log(`[playerVote] ${voterId} voted for ${targetId} in game ${gameId}`);
            } catch (error) {
                console.error(`[playerVote] Error:`, error);
                socket.emit('error', { message: 'Failed to submit vote.' });
                return;
            }

            const publicState = game.getPublicState();
            io.to(gameId).emit('voteUpdate', publicState);
        } 
}