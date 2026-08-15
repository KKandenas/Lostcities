import { existsSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";

import {
  applyMove,
  ClientToServerEvents,
  GameRuleError,
  redactStateFor,
  ServerToClientEvents,
} from "@lostcities/shared";

import {
  createRoom,
  detachSocket,
  findRoomBySocket,
  findRoomByToken,
  getRoom,
  joinRoom,
  sweepAbandonedRooms,
  touchRoom,
} from "./rooms.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;

const app = express();
app.use(cors());
app.get("/healthz", (_req, res) => res.json({ ok: true }));

const clientDist = path.resolve(__dirname, "../../client/dist");
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => res.sendFile(path.join(clientDist, "index.html")));
}

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: process.env.CLIENT_ORIGIN ?? "*" },
});

function broadcastState(room: NonNullable<ReturnType<typeof getRoom>>) {
  if (!room.state) return;
  room.players.forEach((p, idx) => {
    if (p.socketId) {
      io.to(p.socketId).emit("state", redactStateFor(room.state!, idx as 0 | 1));
    }
  });
}

io.on("connection", (socket) => {
  socket.on("create_room", ({ name }, cb) => {
    detachSocket(socket.id);
    const trimmed = (name || "").trim().slice(0, 24) || "Player 1";
    const { room, player } = createRoom(trimmed);
    player.socketId = socket.id;
    socket.join(room.code);
    cb({ ok: true, roomCode: room.code, playerToken: player.token, playerIndex: 0 });
  });

  socket.on("join_room", ({ roomCode, name }, cb) => {
    detachSocket(socket.id);
    const trimmed = (name || "").trim().slice(0, 24) || "Player 2";
    try {
      const { room, player } = joinRoom(roomCode, trimmed);
      player.socketId = socket.id;
      socket.join(room.code);
      cb({ ok: true, playerToken: player.token, playerIndex: 1 });
      broadcastState(room);
      const host = room.players[0];
      if (host.socketId) io.to(host.socketId).emit("opponent_status", { connected: true, name: player.name });
    } catch (err) {
      cb({ ok: false, error: err instanceof Error ? err.message : "Could not join room" });
    }
  });

  socket.on("rejoin_room", ({ roomCode, playerToken }, cb) => {
    const found = findRoomByToken(playerToken);
    if (!found || found.room.code !== roomCode.toUpperCase()) {
      cb({ ok: false, error: "Room not found" });
      return;
    }
    found.player.socketId = socket.id;
    socket.join(found.room.code);
    touchRoom(found.room);
    cb({ ok: true, playerIndex: found.playerIndex });
    broadcastState(found.room);
    const opponent = found.room.players[found.playerIndex === 0 ? 1 : 0];
    if (opponent?.socketId) {
      io.to(opponent.socketId).emit("opponent_status", { connected: true, name: found.player.name });
    }
  });

  socket.on("move", ({ move }) => {
    const found = findRoomBySocket(socket.id);
    if (!found || !found.room.state) return;
    touchRoom(found.room);
    try {
      found.room.state = applyMove(found.room.state, found.playerIndex, move);
      broadcastState(found.room);
    } catch (err) {
      const message = err instanceof GameRuleError ? err.message : "Invalid move";
      socket.emit("error_message", { message });
    }
  });

  socket.on("disconnect", () => {
    const found = findRoomBySocket(socket.id);
    if (!found) return;
    found.player.socketId = null;
    const opponent = found.room.players[found.playerIndex === 0 ? 1 : 0];
    if (opponent?.socketId) {
      io.to(opponent.socketId).emit("opponent_status", { connected: false, name: found.player.name });
    }
  });
});

setInterval(sweepAbandonedRooms, 5 * 60 * 1000).unref();

httpServer.listen(PORT, () => {
  console.log(`Lost Cities server listening on port ${PORT}`);
});
