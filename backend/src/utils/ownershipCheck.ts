import { Request, Response, NextFunction } from "express";
import { Model } from "mongoose";

/**
 * Higher-order middleware to assert that a database resource belongs to the authenticated user.
 * Admins bypass this check.
 * 
 * @param model Mongoose model of the resource
 * @param idParamName Route parameter name for the resource ID (default: "id")
 * @param userField Document field name containing the owner's user ID (default: "user")
 */
export function ownershipCheck(model: Model<any>, idParamName: string = "id", userField: string = "user") {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = req.params[idParamName];
      const userId = req.user?.userId;

      if (!resourceId) {
        return res.status(400).json({ 
          success: false, 
          message: `Missing identifier route param: ${idParamName}` 
        });
      }

      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          message: "Unauthorized: User payload not found in request" 
        });
      }

      // Admins bypass ownership check
      if (req.user?.role === "admin") {
        return next();
      }

      const resource = await model.findById(resourceId);
      if (!resource) {
        return res.status(404).json({ 
          success: false, 
          message: "Resource not found" 
        });
      }

      const ownerId = resource[userField]?.toString();
      if (ownerId !== userId) {
        return res.status(403).json({ 
          success: false, 
          message: "Forbidden: You do not own this resource" 
        });
      }

      // Keep resource attached to the request for subsequent middleware or controller handlers
      (req as any).resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
}
