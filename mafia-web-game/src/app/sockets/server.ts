// server.ts – Socket.IO + MongoDB Room Management

import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") }); // ✅ Ensure path is correct

import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import { nanoid } from "nanoid";
import mongoose from "mongoose";
import Room from "@/db/models/room";

// --- MongoDB Setup --- //
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("❌ Missing MONGODB_URI in environment");

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI!);
    console.log("✅ MongoDB connected");
  }
}

// --- In-memory room-to-players tracking / mapping --- //
interface PlayerInfo {
    socketId: string;
    username: string;
    role?: string;
    alive: boolean;
}


const roomPlayers = new Map<string, PlayerInfo[]>(); // Map to track players in each room

let io: Server;

export function initSocketServer(httpServer: HTTPServer) {
  if (io) return io;

  io = new Server(httpServer, {
    path: "/api/socket",
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // --- Create Room --- //
    socket.on("createRoom", async () => {
      await connectDB();
      const roomCode = nanoid(6).toUpperCase();

      const existingRoom = await Room.findOne({ code: roomCode });
      if (existingRoom) {
        socket.emit("roomError", "Room already exists.");
        return;
      }

      const room = new Room({ code: roomCode });
      await room.save();
      socket.join(roomCode);
      socket.emit("roomCreated", roomCode);
      console.log("Room Created:", roomCode);
    });

    // --- Join Room --- //
    socket.on("joinRoom", async ( {roomCode, username }: { roomCode: string; username: string}) => {
        await connectDB();
        const room = await Room.findOne({ code: roomCode });
      
        if (!room) {
          socket.emit("joinError", "Room does not exist.");
          return;
        }
      
        socket.join(roomCode);
      
        // Update in-memory player list
        const players = roomPlayers.get(roomCode) || [];
      
        const alreadyJoined = players.some((p) => p.socketId === socket.id);
        if (!alreadyJoined) {
          players.push({
            socketId: socket.id,
            username: username?.trim() || `Guest-${Math.floor(Math.random() * 10000)}`, 
            alive: true,
          });
          roomPlayers.set(roomCode, players);
        }
      
        io.to(roomCode).emit("playerJoined", socket.id); // You can emit full PlayerInfo later if needed
        console.log(`${socket.id} joined ${roomCode}`);
      });
      

    // --- Leave Room --- //
    socket.on("Leave Room", async (roomCode: string) => {
        socket.leave(roomCode);
        io.to(roomCode).emit("Player Left!", socket.id);
      
        const players = roomPlayers.get(roomCode);
        if (players) {
          const updated = players.filter((p) => p.socketId !== socket.id);
          if (updated.length === 0) {
            roomPlayers.delete(roomCode); // delete room if empty
          } else {
            roomPlayers.set(roomCode, updated); // update player list
          }

          io.to(roomCode).emit("updatePlayerList", updated); // Notify remaining players
        }
      
        const room = io.sockets.adapter.rooms.get(roomCode);
        if (!room || room.size === 0) {
          await Room.deleteOne({ code: roomCode });
          console.log(`Room ${roomCode} deleted, all players have left`);
        }
      });      
  });

  return io;
}
