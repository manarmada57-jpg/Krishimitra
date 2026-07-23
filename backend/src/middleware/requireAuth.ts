import { Request, Response, NextFunction } from "express";
import { verifyAccess } from "../utils/jwt";

/**
 * Middleware to enforce authentication using JWT access tokens.
 * Attaches decoded payload (userId, role) to req.user.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized: Access token missing or malformed" 
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccess(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: "Unauthorized: Invalid or expired access token" 
    });
  }
}
