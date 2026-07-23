import crypto from "crypto";
import { env } from "../config/env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

// The ENCRYPTION_KEY in env must be a 64-character hex string representing a 32-byte key.
const KEY = Buffer.from(env.ENCRYPTION_KEY, "hex");

if (KEY.length !== 32) {
  throw new Error("Encryption key must be exactly 32 bytes (64 hex characters)");
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  
  // Format: iv:authTag:encryptedText
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decrypt(encrypted: string): string {
  const parts = encrypted.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted string format");
  }
  
  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
