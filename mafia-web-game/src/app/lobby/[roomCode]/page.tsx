"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import socket from "../../sockets/client";
import PlayerAvatar from "@/app/components/UI/playeravatar";

interface Player {
  id: string;
  name: string;
}

export default function LobbyPage() {
  const router = useRouter();
  const params = useParams<{ roomCode: string }>();
  const roomCode = params?.roomCode ?? "unknown";

  const [players, setPlayers] = useState<Player[]>([]);
  const [selfId, setSelfId] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const tryJoinRoom = () => {
      const currentId = socket.id;
      const storedName = sessionStorage.getItem("guest_username") || "Guest";

      setSelfId(currentId);
      setPlayers((prev) =>
        Array.from(new Set([...prev, { id: currentId, name: storedName }]))
      );

      socket.emit("joinRoom", {
        roomCode,
        username: storedName,
      });
    };

    if (socket.connected) {
      tryJoinRoom();
    } else {
      socket.once("connect", tryJoinRoom);
    }

    const onPlayerJoined = (id: string) => {
      setPlayers((prev) => {
        if (prev.some((p) => p.id === id)) return prev;
        return [...prev, { id, name: "Guest" }]; // fallback until real name is available from server
      });
    };

    const onJoinError = (msg: string) => {
      alert(msg);
      router.push("/");
    };

    socket.on("playerJoined", onPlayerJoined);
    socket.on("joinError", onJoinError);

    return () => {
      socket.off("playerJoined", onPlayerJoined);
      socket.off("joinError", onJoinError);
      socket.off("connect", tryJoinRoom);
    };
  }, [roomCode, router]);

  const handleAddBot = () => {
    const botId = "bot-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    setPlayers((prev) => [...prev, { id: botId, name: "Bot" }]);
  };

  return (
    <div className="flex h-screen bg-zinc-900 text-white">
      <div className="w-1/4 min-w-[200px] border-r border-zinc-700 flex flex-col justify-between p-4 bg-zinc-800/70 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <PlayerAvatar id={selfId} />
            <div className="overflow-hidden">
              <p className="font-semibold truncate">
                {players.find((p) => p.id === selfId)?.name ?? "Loading..."}
              </p>
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

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Lobby Code:</h1>
          <div className="text-sm text-zinc-400">Players: {players.length}</div>
        </div>

        <ul className="space-y-3 max-w-lg">
          {players.map((player) => (
            <li
              key={player.id}
              className="flex items-center gap-4 bg-zinc-900/60 border border-zinc-700 p-2 rounded-md"
            >
              <PlayerAvatar id={player.id} />
              <div>
                <p className="text-white font-semibold truncate">{player.name}</p>
                <p className="text-sm text-zinc-400 truncate">ID: {player.id}</p>
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
