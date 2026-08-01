import express from "express";
import cors from "cors";
import passport from "passport";
import { configurePassport } from "./config/passport";
import { errorHandler } from "./middleware/errorHandler";
import { env } from "./config/env";

// Route module imports
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import farmRoutes from "./modules/farms/farm.routes";
import cropRoutes from "./modules/crops/crop.routes";
import vedasRoutes from "./modules/crops/vedas.routes";
import weatherRoutes from "./modules/weather/weather.routes";
import marketRoutes from "./modules/market/market.routes";
import assistantRoutes from "./modules/assistant/assistant.routes";
import farmerRoutes from "./modules/farmer/farmer.routes";
import expenseRoutes from "./modules/expenses/expense.routes";

import { requireAuth } from "./middleware/requireAuth";
import { AssistantController } from "./modules/assistant/assistant.controller";
import { CropController } from "./modules/crops/crop.controller";

const app = express();

const allowedOrigins = [
  env.FRONTEND_URL,
  "https://krishimitra-coral.vercel.app",
  "http://localhost:5173"
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Prevent browser caching on all API GET requests (Cache-Control: no-store requirement)
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Initialize passport OAuth configurations
app.use(passport.initialize());
configurePassport();

// API Route mountpoints
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/crops", vedasRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/farmer", farmerRoutes);
app.use("/api/expenses", expenseRoutes);

// Compatibility legacy direct paths
app.post("/api/chat", requireAuth, AssistantController.sendMessage);
app.post("/api/diagnose", requireAuth, CropController.diagnoseCrop);
app.post("/api/predict-yield", requireAuth, CropController.predictYield);

// Root endpoint for simple checks and Render defaults
app.get("/", (_req, res) => {
  res.status(200).send("KrishiMitra API Server is running!");
});

// Simple heartbeat endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ 
    success: true, 
    message: "KrishiMitra API Server is active and operating", 
    timestamp: new Date().toISOString() 
  });
});

// Centralized error recovery interceptor
app.use(errorHandler);

export default app;
