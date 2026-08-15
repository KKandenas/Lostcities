import { Move } from "./types.js";
import { RedactedGameState } from "./redact.js";

export interface CreateRoomResponse {
  ok: true;
  roomCode: string;
  playerToken: string;
  playerIndex: 0 | 1;
}

export interface JoinRoomResponse {
  ok: true;
  playerToken: string;
  playerIndex: 0 | 1;
}

export interface RejoinResponse {
  ok: true;
  playerIndex: 0 | 1;
}

export interface ErrorResponse {
  ok: false;
  error: string;
}

export interface ClientToServerEvents {
  create_room: (payload: { name: string }, cb: (res: CreateRoomResponse | ErrorResponse) => void) => void;
  join_room: (
    payload: { roomCode: string; name: string },
    cb: (res: JoinRoomResponse | ErrorResponse) => void,
  ) => void;
  rejoin_room: (
    payload: { roomCode: string; playerToken: string },
    cb: (res: RejoinResponse | ErrorResponse) => void,
  ) => void;
  move: (payload: { move: Move }) => void;
}

export interface ServerToClientEvents {
  state: (state: RedactedGameState) => void;
  opponent_status: (payload: { connected: boolean; name: string | null }) => void;
  error_message: (payload: { message: string }) => void;
  room_closed: (payload: { reason: string }) => void;
}
