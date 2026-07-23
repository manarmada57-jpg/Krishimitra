import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { UserModel } from "../users/user.model";
import { signAccess, signRefresh } from "../../utils/jwt";

export class AuthController {
  public static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, email, password } = req.body;

      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: "Email address is already in use" 
        });
      }

      const user = await AuthService.registerUser({ username, email, password });
      
      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: { 
          userId: user._id, 
          username: user.username, 
          email: user.email 
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findOne({ email });
      if (!user || !user.password) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid email or password" 
        });
      }

      const isMatch = await AuthService.comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid email or password" 
        });
      }

      const accessToken = signAccess({ userId: user._id.toString(), role: user.role });
      const refreshToken = signRefresh({ userId: user._id.toString() });

      await AuthService.addRefreshToken(user._id.toString(), refreshToken);

      return res.status(200).json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: { 
            userId: user._id, 
            username: user.username, 
            email: user.email, 
            role: user.role 
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const rotated = await AuthService.rotateTokens(refreshToken);
      if (!rotated) {
        return res.status(401).json({ 
          success: false, 
          message: "Invalid or expired refresh token" 
        });
      }

      return res.status(200).json({ 
        success: true, 
        data: rotated 
      });
    } catch (error) {
      next(error);
    }
  }

  public static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const userId = req.user?.userId;
      
      if (userId && refreshToken) {
        await AuthService.removeRefreshToken(userId, refreshToken);
      }

      return res.status(200).json({ 
        success: true, 
        message: "Logged out successfully" 
      });
    } catch (error) {
      next(error);
    }
  }

  public static async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      if (!user) {
        return res.status(400).json({ 
          success: false, 
          message: "Google OAuth authentication failed" 
        });
      }

      const accessToken = signAccess({ userId: user._id.toString(), role: user.role });
      const refreshToken = signRefresh({ userId: user._id.toString() });

      await AuthService.addRefreshToken(user._id.toString(), refreshToken);

      // Return tokens via JSON response for testing / API clients
      return res.status(200).json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            userId: user._id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
