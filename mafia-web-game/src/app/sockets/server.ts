// server.ts – Self-contained Socket.IO + MongoDB Room Management

import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import { nanoid } from "nanoid";
import mongoose from "mongoose";

// --- MongoDB Setup --- //
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("❌ Missing MONGODB_URI in environment");

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  await mongoose.connect(MONGODB_URI!);
  console.log("✅ MongoDB connected");
}

// --- Room Schema --- //
const roomSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});
const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);

// --- In-memory room-to-players tracking --- //
interface PlayerInfo {
  socketId: string;
  username: string;
  role?: string;
  alive: boolean;
}
const roomPlayers = new Map<string, PlayerInfo[]>();

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
    socket.on("joinRoom", async ({ roomCode, username }: { roomCode: string; username: string }) => {
      await connectDB();
      const room = await Room.findOne({ code: roomCode });

      if (!room) {
        socket.emit("joinError", "Room does not exist.");
        return;
      }

      socket.join(roomCode);
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

      io.to(roomCode).emit("playerJoined", socket.id);
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
          roomPlayers.delete(roomCode);
        } else {
          roomPlayers.set(roomCode, updated);
        }

        io.to(roomCode).emit("updatePlayerList", updated);
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
