"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import socket from "./sockets/client";
import UsernamePrompt from "./components/UI/modal";

export default function Home() {
  const [JoinCode, setJoinCode] = useState(""); // Join code input
  const [isCreating, setIsCreating] = useState(false); // Track create-room state
  const [username, setUsername] = useState(""); // Username input 
  const [showPrompt, setShowPrompt] = useState(false); // Show username prompt
  const router = useRouter();

  // --- Username Prompt --- //
  useEffect(() => {
    const stored = sessionStorage.getItem("guest_username");
    if (stored) {
      setUsername(stored);
    } else {
      setShowPrompt(true);
    }
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

      // ============================================================= //

    // Handle room creation success
    const onRoomCreated = (code: string) => {
      console.log("🔥 Room created:", code);
      alert("Room created! Redirecting...");
      setIsCreating(false);
      router.push(`/lobby/${code}`);
    };

    socket.on("roomCreated", onRoomCreated);

    return () => {
      socket.off("roomCreated", onRoomCreated);
      socket.off("connect");
    };
  }, [router]);

  // --- Join Room --- //
  function handleJoin() {
    if (!JoinCode || !username) return;

    socket.emit("joinRoom", {roomCode: JoinCode, username}); // Ask server to join room

    // Success: only redirect if this socket successfully joined
    const onJoinSuccess = (id: string) => {
      if (id === socket.id) {
        router.push(`/lobby/${JoinCode}`);
      }
    };

    // Failure: show alert
    const onJoinError = (msg: string) => {
      alert(`Error: ${msg}`);
    };

    socket.once("playerJoined", onJoinSuccess);
    socket.once("joinError", onJoinError);
  }

  // --- Create Room --- //
  function handleCreate() {
    setIsCreating(true);
    const username = sessionStorage.getItem("mafia-username") || `Guest-${Math.floor(Math.random() * 10000)}`;
    socket.emit("createRoom");
  
    socket.once("roomCreated", (code: string) => {
      socket.emit("joinRoom", code, username); // ⬅ send username here
      setIsCreating(false);
      router.push(`/lobby/${code}`);
    });
  }
  
  function handleUsernameSubmit(finalUsername: string) {
    setUsername(finalUsername); // Set it in state
    sessionStorage.setItem("guest_username", finalUsername); // Save to session
    setShowPrompt(false); // Close the modal
  }

  // ============================================================= //

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold italic mb-8">Mafia 👹</h1>

      {/* --- Username Modal --- */}
      {showPrompt && <UsernamePrompt onSubmit={handleUsernameSubmit} />}

      {/* --- Join Section --- */}
      <div className="w-full max-w-sm mb-6">
        <label className="block mb-2 text-sm font-medium">Enter Room Code</label>
        <div className="flex">
          <input
            type="text"
            value={JoinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="e.g. A2B4C"
            className="flex-grow border rounded-l px-3 py-2 focus:outline-none"
          />
          <button
            onClick={handleJoin}
            className="bg-blue-500 text-white rounded-r px-4 py-2 hover:bg-blue-700"
          >
            Join
          </button>
        </div>
      </div>

      <div className="text-gray-500 mb-6">-- OR --</div>

      {/* --- Create Section --- */}
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
