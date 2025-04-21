"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import socket from "@/sockets/client"; // Adjusted the import path to use an alias

export default function LobbyPage() {
    const { roomId } = useParams(); // Get the room ID from the URL
    const [players, setPlayers] = useState<string[]>([]); // State to hold the list of players

    useEffect(() => {
        socket.emit("joinRoom", roomId!); // Join Socket Room

        function onPLayerJoined(id: string) {
            setPlayers(prev => Array.from(new Set([...prev, id]))); // Adds new player to the list
        }

        socket.on("playerJoined", onPLayerJoined); // Listens for players joining 

        return () => {
            socket.off("playerJoined", onPLayerJoined); // Clean up listener
        };
    }, [roomId]); // Re-run when roomId changes

    return (
        <div className="p-8">
            <h1 className="text=3xl font-bold mb-4">Lobby: {roomId}</h1>
            <ul className="list-disc pl-5">
                {players.map(id => <li key={id}>{id}</li>)}
            </ul>
        </div>
    );
}