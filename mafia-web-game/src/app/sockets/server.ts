// server set up + event handlers 
import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import { nanoid } from "nanoid"; // ✅ Generates unique room codes

let io: Server;

export function initSocketServer(httpServer: HTTPServer) {
    if (io) return io; // Only initialize once
    io = new Server(httpServer, { // Create Server, attach to http server
        path: "/api/socket", // must match API route
        cors: { origin: "*" }, // allow all origins (dev only)
    });

    // In-memory store for active rooms and their code
    const activeRooms = new Set<string>();

    // Listens for incoming connections 
    io.on("connection", (socket) => {
        console.log("Client Connected:", socket.id);

        // --- Room Creation --- //
        socket.on("createRoom", () => { // no longer needs client to send roomCode
            const roomCode = nanoid(6); // Generates a 6-character unique code

            if (!activeRooms.has(roomCode)) {
                activeRooms.add(roomCode); // Marks the code as an active code
                socket.join(roomCode); // put this socket in the room
                console.log("Room Created:", roomCode); // log new room
                socket.emit("roomCreated", roomCode); // let room creator know (event renamed)
                console.log("Room Created:", roomCode); // log new room
            } else {
                socket.emit("ERROR:", "Room Already Exists!");
            }
        });

        // --- Join Existing Room --- //
        socket.on("Join Room", (roomCode: string) => {
            if (activeRooms.has(roomCode)) { // Checks if room exists
                socket.join(roomCode); // Adds this socket to that room || Goes ahead if room exists
                io.to(roomCode).emit("Player Joined!", socket.id); // Notifies Players when someone joins
            } else {
                socket.emit("ERROR:", "Room Not Found!");
            }
        });

        // --- Leave Room --- //
        socket.on("Leave Room", (roomCode: string) => {
            if (activeRooms.has(roomCode)) { // Checks if the room exists
                socket.leave(roomCode); // Removes socket from the room || Goes ahead if room exists
                io.to(roomCode).emit("Player Left!", socket.id); // Notifies Players when someone leaves
                
                // --- Room Delete --- // 
                const room = io.sockets.adapter.rooms.get(roomCode);
                if (!room || room.size === 0) { // Check room size / does a player count
                    activeRooms.delete(roomCode); // Deletes room if room is empty / if player count = 0
                    console.log(`Room ${roomCode} deleted (Now an Empty Room)`); // Just saying that the room is empty and has been deleted
                }
            } else {
                socket.emit("ERROR:", "Room Not Found!");
            }
        });
    });

    return io;
}
