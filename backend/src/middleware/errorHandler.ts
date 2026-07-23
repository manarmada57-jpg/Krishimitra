import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

/**
 * Centralized Express error-handling middleware.
 * Returns a standardized JSON response.
 */
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log full error stack in development, otherwise just message
  if (env.NODE_ENV === "development") {
    console.error("🔥 Centralized Error Handler Caught:", err);
  } else {
    console.error(`🔥 Centralized Error: ${err.message || err}`);
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "An unexpected server error occurred";

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.errors && { errors: err.errors }),
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
