"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import socket from "../../sockets/client";
import PlayerAvatar from "@/app/components/UI/playeravatar";

export default function LobbyPage() {
  const router = useRouter();
  const params = useParams<{ roomCode: string }>();
  const roomCode = params?.roomCode ?? "unknown"; // fallback if undefined

  const [players, setPlayers] = useState<string[]>([]); // Tracks all players
  const [selfId, setSelfId] = useState<string>(""); // Holds actual socket.id
  const [showSettings, setShowSettings] = useState(false); // Settings modal toggle

  useEffect(() => {
    // Wait until socket is connected
    const tryJoinRoom = () => {
      const currentId = socket.id;
      setSelfId(currentId); // Save self ID
      setPlayers((prev) => Array.from(new Set([...prev, currentId]))); // Add self to list
      socket.emit("joinRoom", roomCode); // Ask server to join
    };

    if (socket.connected) {
      tryJoinRoom();
    } else {
      socket.once("connect", tryJoinRoom); // Wait for connection if not ready
    }

    // When someone joins the room
    const onPlayerJoined = (id: string) => {
      setPlayers((prev) => Array.from(new Set([...prev, id]))); // Add to lobby list
    };

    // If room doesn't exist
    const onJoinError = (msg: string) => {
      alert(msg);
      router.push("/"); // Go back to home
    };

    socket.on("playerJoined", onPlayerJoined);
    socket.on("joinError", onJoinError);

    return () => {
      socket.off("playerJoined", onPlayerJoined);
      socket.off("joinError", onJoinError);
      socket.off("connect", tryJoinRoom);
    };
  }, [roomCode, router]);

  // Adds a fake bot for testing
  const handleAddBot = () => {
    const botId = "bot-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    setPlayers((prev) => Array.from(new Set([...prev, botId])));
  };

  return (
    <div className="flex h-screen bg-zinc-900 text-white">
      {/* --- Panel 1: Personal Info --- */}
      <div className="w-1/4 min-w-[200px] border-r border-zinc-700 flex flex-col justify-between p-4 bg-zinc-800/70 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <PlayerAvatar id={selfId} />
            <div className="overflow-hidden">
              <p className="font-semibold truncate">UsernamePlaceholder</p>
              <p className="text-sm text-zinc-400 truncate">ID: {selfId || "Loading..."}</p>
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

      {/* --- Panel 2: Player List --- */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Lobby Code:</h1>
          <div className="text-sm text-zinc-400">Players: {players.length}</div>
        </div>

        <ul className="space-y-3 max-w-lg">
          {players.map((id) => (
            <li
              key={id}
              className="flex items-center gap-4 bg-zinc-900/60 border border-zinc-700 p-2 rounded-md"
            >
              <PlayerAvatar id={id} />
              <div>
                <p className="text-white font-semibold truncate">UsernamePlaceholder</p>
                <p className="text-sm text-zinc-400 truncate">ID: {id}</p>
              </div>
            </li>
          ))}
        </ul>

        <button
          onClick={handleAddBot}
          className="mt-6 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Add Bot
        </button>
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
}
