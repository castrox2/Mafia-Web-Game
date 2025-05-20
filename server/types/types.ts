// Organizes and shares TypeScript interfaces, types, and enums.
// types.ts

// Game phases
export type Phase = 'waiting' | 'day' | 'night' | 'ended';

// Roles available in the game
export type Role = 'villager' | 'mafia' | 'detective';

// Player object used throughout GameEngine and sockets
export interface Player {
  id: string;
  role: Role;
  alive: boolean;
}

// Return type from submitVote
export interface VoteResult {
  voteComplete: boolean;
  tie: boolean;
  tieCandidates?: string[];
}

// Public state sent to the frontend via socket
export interface GameStatePublic {
  phase: Phase;
  alivePlayers: Player[];
  voteTieCandidates: string[] | null;
  winner: 'mafia win' | 'villager win' | null;
}

// Payloads received from frontend socket events
export interface PlayerVotePayload {
  gameId: string;
  voterId: string;
  targetId: string;
}

export interface MafiaVotePayload {
  gameId: string;
  voterId: string;
  targetId: string;
}

export interface DetectiveActionPayload {
  gameId: string;
  playerId: string;
  targetId: string;
}

export interface NextPhasePayload {
  gameId: string;
} 