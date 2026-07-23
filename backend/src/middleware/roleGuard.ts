import { Request, Response, NextFunction } from "express";

/**
 * Middleware to restrict route access to specific roles.
 * Must be used after requireAuth.
 */
export function roleGuard(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: "Unauthorized: User not authenticated" 
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          success: false, 
          message: `Forbidden: Insufficient privileges. Allowed roles: [${allowedRoles.join(", ")}]` 
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
