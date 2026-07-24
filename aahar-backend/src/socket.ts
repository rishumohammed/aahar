import { Server }     from "socket.io";
import { Server as HttpServer } from "http";
import jwt            from "jsonwebtoken";

let io: Server;

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        process.env.FRONTEND_URL,
      ].filter((o): o is string => !!o),
      methods: ["GET","POST"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET!) as any;
      socket.data.user = user;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;
    console.log(`Socket connected: ${user.email} (${user.role})`);

    // Join role-based rooms
    socket.join(`user_${user.id}`);

    if (user.role === "manager") {
      // Manager joins all their hotel rooms
      // We'll let the client send join_hotel events
    }

    if (["admin","super_admin"].includes(user.role)) {
      socket.join("admin_room");
    }

    // Client sends this after connecting to join their hotel room
    socket.on("join_hotel", (hotelId: string) => {
      if (user.role === "manager" || ["admin","super_admin"].includes(user.role)) {
        socket.join(`hotel_${hotelId}`);
        console.log(`${user.email} joined hotel_${hotelId}`);
      }
    });

    socket.on("leave_hotel", (hotelId: string) => {
      socket.leave(`hotel_${hotelId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${user.email}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
