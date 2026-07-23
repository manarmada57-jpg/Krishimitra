import http from "http";
import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import { initializeCrons } from "./services/cron.service";
import { initializeSockets } from "./sockets";

const server = http.createServer(app);
const PORT = env.PORT;

/**
 * Main application bootstrapper.
 * Establishes Mongoose connection, initializes WebSocket events, configures crons, and binds HTTP listener.
 */
async function bootstrap() {
  // 1. Establish connection to MongoDB
  await connectDB();

  // 2. Start background cron services
  initializeCrons();

  // 3. Mount and configure socket.io handlers on the HTTP server
  initializeSockets(server);

  // 4. Start listening for incoming connections
  server.listen(PORT, () => {
    console.log(`🚀 KrishiMitra API Server running on port ${PORT} in [${env.NODE_ENV}] mode.`);
  });
}

bootstrap().catch((error) => {
  console.error("❌ Fatal system crash during initialization boot:", error);
  process.exit(1);
});
