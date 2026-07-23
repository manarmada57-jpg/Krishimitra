import { Request, Response, NextFunction } from "express";
import { ExpenseService } from "./expense.service";

export class ExpenseController {
  public static async getMyExpenses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const expenses = await ExpenseService.getUserExpenses(userId);
      return res.status(200).json({ success: true, data: expenses });
    } catch (error) {
      next(error);
    }
  }

  public static async createExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const expense = await ExpenseService.createExpense(userId, req.body);
      return res.status(201).json({ success: true, data: expense });
    } catch (error) {
      next(error);
    }
  }

  public static async updateExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatedExpense = await ExpenseService.updateExpense(id, req.body);
      return res.status(200).json({ success: true, data: updatedExpense });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await ExpenseService.deleteExpense(id);
      return res.status(200).json({ success: true, message: "Expense deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}
