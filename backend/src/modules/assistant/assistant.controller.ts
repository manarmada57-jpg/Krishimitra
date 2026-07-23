import { Request, Response, NextFunction } from "express";
import { AssistantService } from "./assistant.service";

export class AssistantController {
  /**
   * Endpoint to post a new chat message and fetch the AI response.
   */
  public static async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { message, language } = req.body;
      const reply = await AssistantService.generateReply(userId, message, language || "en");
      
      return res.status(200).json({ 
        success: true, 
        data: { reply } 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Endpoint to retrieve full chat message logs between farmer and assistant.
   */
  public static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const history = await AssistantService.getChatHistory(userId);
      return res.status(200).json({ 
        success: true, 
        data: history 
      });
    } catch (error) {
      next(error);
    }
  }
}
