"use client";

import React from "react";
import PlayerAvatar from "./playeravatar";

interface PlayerInfo {
    socketId: string;
    username: string;
    role?: string;
    alive: boolean;
}
interface LobbyPlayerListProps {
  players: PlayerInfo[];
  selfId: string; // Track who "you" are
}

// Renders the main lobby panel and player list
const LobbyPlayerList: React.FC<LobbyPlayerListProps> = ({ players, selfId }) => {
    const otherPlayers = players.filter((p) => p.socketId !== selfId); // Exclude self

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Header with player count and Add Bot button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Lobby</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-zinc-400">Players: {players.length}</p>
          <button
            onClick={() => alert("Bot added (placeholder)")}
            className="bg-green-600 hover:bg-green-700 px-3 py-1 text-sm rounded text-white"
          >
            Add Bot
          </button>
        </div>
      </div>

      {/* --- Player List --- */}
      <ul className="space-y-3">
        {otherPlayers.map((player) => (
            <li key={player.socketId} className="flex items-center gap-4 bg-zinc-900/60 border border-zinc-700 p-3 rounded-md">
                <PlayerAvatar id={player.socketId} />
                <div>
                    <p className="text-white font-semibold">{player.username}</p> {/* ✅ dynamic username */}
                    <p className="text-sm text-zinc-400">ID: {player.socketId}</p>
                </div>
            </li>
        ))}
      </ul>
    </div>
  );
};

export default LobbyPlayerList;
