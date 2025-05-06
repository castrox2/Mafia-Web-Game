"use client";

import React from "react";
import PlayerAvatar from "./playeravatar";

interface LobbyPlayerListProps {
  players: string[];
  selfId: string;
  showSettings: boolean;
  setShowSettings: (val: boolean) => void;
  onAddBot: () => void;
}

// Handles the full lobby UI: left panel (info), right panel (player list), modal
const LobbyPlayerList: React.FC<LobbyPlayerListProps> = ({
  players,
  selfId,
  showSettings,
  setShowSettings,
  onAddBot,
}) => {
  return (
    <div className="flex h-screen bg-zinc-900 text-white">
      {/* --- Left Panel: Personal Info --- */}
      <div className="w-1/4 min-w-[200px] border-r border-zinc-700 flex flex-col justify-between p-4 bg-zinc-800/70 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <PlayerAvatar id={selfId} />
            <div className="overflow-hidden">
              <p className="font-semibold truncate">UsernamePlaceholder</p>
              <p className="text-sm text-zinc-400 truncate">ID: {selfId}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Settings
          </button>
          <button
            onClick={() => alert("Leaving lobby...")}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Leave
          </button>
        </div>
      </div>

      {/* --- Right Panel: Player List --- */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Top section: Title and player count */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Lobby</h1>
          <div className="text-sm text-zinc-400">Players: {players.length}</div>
        </div>

        {/* Add Bot Button */}
        <button
          onClick={onAddBot}
          className="mb-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          Add Bot
        </button>

        {/* Player List */}
        <ul className="space-y-3 max-w-lg">
          {players.map((id) => (
            <li
              key={id}
              className="flex items-center gap-4 bg-zinc-900/60 border border-zinc-700 p-2 rounded-md"
            >
              <PlayerAvatar id={id} />
              <div>
                <p className="text-white font-semibold">UsernamePlaceholder</p>
                <p className="text-sm text-zinc-400">ID: {id}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* --- Settings Modal --- */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-800 text-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <p className="text-sm text-zinc-300">This is a placeholder settings modal.</p>
            <button
              onClick={() => setShowSettings(false)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LobbyPlayerList;
