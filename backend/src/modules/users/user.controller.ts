import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";

export class UserController {
  public static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  public static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const updatedUser = await UserService.updateProfile(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      return res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
      next(error);
    }
  }
}
