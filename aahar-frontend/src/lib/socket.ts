import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000", {
      autoConnect: false,
      auth: { token: "" },
    });
  }
  return socket;
};

export const connectSocket = (token: string): void => {
  const s = getSocket();
  s.auth = { token };
  if (!s.connected) s.connect();
};

export const disconnectSocket = (): void => {
  socket?.disconnect();
  socket = null;
};
