"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import socket from "../../sockets/client"; // Adjusted the import path to use an alias

export default function LobbyPage() {
    const params = useParams<{ roomCode: string }>();
    const roomCode = params!.roomCode; // Get the room ID from the URL
    const [players, setPlayers] = useState<string[]>([]); // State to hold the list of players

    useEffect(() => {
        socket.emit("joinRoom", roomCode!); // Join Socket Room

        function onPlayerJoined(id: string) {
            setPlayers(prev => Array.from(new Set([...prev, id]))); // Adds new player to the list
        }

        socket.on("playerJoined", onPlayerJoined); // Listens for players joining 

        return () => {
            socket.off("playerJoined", onPlayerJoined); // Clean up listener
        };
    }, [roomCode]); // Re-run when roomId changes

    return (
        <div className="p-8">
            <h1 className="text=3xl font-bold mb-4">Lobby: { roomCode }</h1>
            <ul className="list-disc pl-5">
                {players.map(id => <li key={id}>{id}</li>)}
            </ul>
        </div>
    );
}