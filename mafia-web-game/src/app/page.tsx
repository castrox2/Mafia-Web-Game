"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import socket from "./sockets/client";

export default function Home() {
  const [JoinCode, setJoinCode] = useState(""); // useState for join code
  const [isCreating, setIsCreating] = useState(false); // flag while waiting for room to be created
  const router = useRouter();

  // --- Listen for room creation confirmation --- //
  useEffect(() => {
    function onRoomCreated(code: string) {
      console.log("roomCreated received:", code); // log room code
      setIsCreating(false); // reset creating flag
      router.push(`/lobby/${code}`); // redirect to new room's lobby
    }

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id); // log socket connection
    });

    socket.on("roomCreated", (code: string) => {
      console.log("🔥 received roomCreated:", code);
      alert("Room created! Redirecting...");
      setIsCreating(false);
      router.push(`/lobby/${code}`);
    }); // listen for room creation event

    return () => {
      socket.off("roomCreated", onRoomCreated); // clean up listener
      socket.off("connect"); // clean up connection listener
    };
  }, [router]);

  // --- Handler for "Join" --- //
  function handleJoin() {
    if (!JoinCode) return; // no code entered
    router.push(`/lobby/${JoinCode}`); // redirect to lobby
  }

  // --- Handler for "Create" --- //
  function handleCreate() {
    setIsCreating(true); // Shows "creating..." message
    console.log("Creating button clicked"); // log room creation
    socket.emit("createRoom"); // Emit event to create room
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold font-style italic mb-8">Mafia 👹</h1>

      {/* --- Join Form --- */}
      <div className="w-full max-w-sm mb-6">
        <label className="block mb-2 text-sm font-medium">
          Enter Room Code!
        </label>
        <div className="flex">
          <input
            type="text"
            value={JoinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="e.g A2B4C"
            className="flex-grow border rounded-1 px-3 py-2 focus:outline-none"
          />
          <button
            onClick={handleJoin}
            className="bg-blue-500 text-white rounded-r px-4 py-2 ml-2 hover:bg-blue-700"
          >
            Join
          </button>
        </div>
      </div>

      <div className="text-gray-500 mb-6">-- OR --</div>

      {/* --- Create Form --- */}
      <button
        onClick={handleCreate}
        disabled={isCreating}
        className={`px-6 py-3 rounded text-white ${
          isCreating ? "bg-gray-400" : "bg-green-500 hover:bg-green-700"
        }`}
      >
        {isCreating ? "Creating..." : "Create Room!"}
      </button>
    </div>
  );
}