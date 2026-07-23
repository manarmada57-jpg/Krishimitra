import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  role: "farmer" | "admin";
  language: "en" | "hi";
  googleId?: string;
  onboarded: boolean;
  refreshTokens: string[]; // Store encrypted refresh tokens
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    role: { type: String, enum: ["farmer", "admin"], default: "farmer" },
    language: { type: String, enum: ["en", "hi"], default: "en" },
    googleId: { type: String },
    onboarded: { type: Boolean, default: false },
    refreshTokens: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export const UserModel = model<IUser>("User", userSchema);
