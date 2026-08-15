import { io, Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@lostcities/shared";

const serverUrl = import.meta.env.VITE_SERVER_URL || (import.meta.env.DEV ? "http://localhost:3001" : undefined);

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(serverUrl, {
  autoConnect: true,
  transports: ["websocket", "polling"],
});
