import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AccessTokenPayload } from "../utils/jwt";

/**
 * Configure and initialize Socket.io server with authentication guards.
 */
export function initializeSockets(server: HttpServer): SocketServer {
  const io = new SocketServer(server, {
    cors: {
      origin: "*", // Adjust origins in production
      methods: ["GET", "POST"],
    },
  });

  // Socket.io Authentication Guard Middleware
  io.use((socket, next) => {
    const token = 
      socket.handshake.auth?.token || 
      socket.handshake.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return next(new Error("Authentication error: Token is required"));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
      (socket as any).user = decoded;
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user;
    console.log(`🔌 Client connected via WebSockets: UserID=${user.userId}, SocketID=${socket.id}`);

    // Place user in their private room
    socket.join(`user:${user.userId}`);

    // Handle incoming messages
    socket.on("message", (data: { text: string; language?: string }) => {
      console.log(`💬 Chat event from ${user.userId}:`, data);
      
      socket.emit("typing", { isTyping: true });

      // Simulate network latency / AI generation delay
      setTimeout(() => {
        const isHindi = data.language === "hi";
        const replyText = isHindi
          ? `नमस्ते! यह सॉकेट.आईओ के माध्यम से एक रीयल-टाइम एआई जवाब है। आपका प्रश्न था: "${data.text}"`
          : `Hello! This is a real-time AI response streamed back over Socket.io. You asked: "${data.text}"`;

        socket.emit("message", {
          sender: "assistant",
          text: replyText,
          createdAt: new Date().toISOString()
        });
      }, 1200);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: SocketID=${socket.id}`);
    });
  });

  return io;
}
