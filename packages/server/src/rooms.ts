import { randomUUID } from "node:crypto";
import { createGame, GameState } from "@lostcities/shared";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1 to avoid confusion

export interface RoomPlayer {
  token: string;
  id: string;
  name: string;
  socketId: string | null;
}

export interface Room {
  code: string;
  players: RoomPlayer[]; // length 1 while waiting, 2 once started
  state: GameState | null;
  createdAt: number;
  lastActivity: number;
}

const rooms = new Map<string, Room>();
const ROOM_TTL_MS = 30 * 60 * 1000; // clean up abandoned rooms after 30 minutes of inactivity

function generateRoomCode(): string {
  for (let attempt = 0; attempt < 50; attempt++) {
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    if (!rooms.has(code)) return code;
  }
  throw new Error("Could not generate a unique room code");
}

export function detachSocket(socketId: string) {
  for (const room of rooms.values()) {
    const player = room.players.find((p) => p.socketId === socketId);
    if (player) player.socketId = null;
  }
}

export function createRoom(hostName: string): { room: Room; player: RoomPlayer } {
  const code = generateRoomCode();
  const player: RoomPlayer = { token: randomUUID(), id: randomUUID(), name: hostName, socketId: null };
  const room: Room = { code, players: [player], state: null, createdAt: Date.now(), lastActivity: Date.now() };
  rooms.set(code, room);
  return { room, player };
}

export function joinRoom(code: string, guestName: string): { room: Room; player: RoomPlayer } {
  const room = rooms.get(code.toUpperCase());
  if (!room) throw new Error("Room not found");
  if (room.players.length >= 2) throw new Error("Room is full");

  const player: RoomPlayer = { token: randomUUID(), id: randomUUID(), name: guestName, socketId: null };
  room.players.push(player);
  room.state = createGame(
    { id: room.players[0].id, name: room.players[0].name },
    { id: player.id, name: player.name },
  );
  room.lastActivity = Date.now();
  return { room, player };
}

export function findRoomByToken(token: string): { room: Room; player: RoomPlayer; playerIndex: 0 | 1 } | null {
  for (const room of rooms.values()) {
    const idx = room.players.findIndex((p) => p.token === token);
    if (idx !== -1) return { room, player: room.players[idx], playerIndex: idx as 0 | 1 };
  }
  return null;
}

export function findRoomBySocket(socketId: string): { room: Room; player: RoomPlayer; playerIndex: 0 | 1 } | null {
  for (const room of rooms.values()) {
    const idx = room.players.findIndex((p) => p.socketId === socketId);
    if (idx !== -1) return { room, player: room.players[idx], playerIndex: idx as 0 | 1 };
  }
  return null;
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code.toUpperCase());
}

export function touchRoom(room: Room) {
  room.lastActivity = Date.now();
}

export function sweepAbandonedRooms() {
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (now - room.lastActivity > ROOM_TTL_MS) rooms.delete(code);
  }
}
