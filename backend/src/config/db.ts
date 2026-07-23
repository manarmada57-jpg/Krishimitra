import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB(): Promise<void> {
  // Support both Atlas (mongodb+srv://) and local (mongodb://) URIs
  const mongoUri = env.MONGODB_URI || "mongodb://127.0.0.1:27017/krishimitra";

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    const isAtlas = mongoUri.includes("mongodb+srv") || mongoUri.includes(".mongodb.net");
    console.log(`🚀 Connected to ${isAtlas ? "MongoDB Atlas ☁️" : "MongoDB (local)"} successfully.`);
  } catch (error: any) {
    console.error("❌ MongoDB connection error:", error.message || error);
    console.warn("⚠️  The backend will start but database operations will fail.");
    console.warn("📌 To use MongoDB Atlas:");
    console.warn("   1. Go to https://cloud.mongodb.com → Create free cluster");
    console.warn("   2. Database Access → Create user with password");
    console.warn("   3. Network Access → Add 0.0.0.0/0");
    console.warn("   4. Connect → Copy connection string → Update MONGODB_URI in backend/.env");
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log("💤 Disconnected from MongoDB.");
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB:", error);
  }
}
