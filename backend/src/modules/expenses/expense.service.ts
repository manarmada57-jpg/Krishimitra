import { ExpenseModel, IExpense } from "./expense.model";

const categoryHiMap: Record<string, any> = {
  Seed: "बीज",
  Fertilizer: "खाद",
  Labor: "मजदूरी",
  Water: "सिंचाई",
  Equipment: "उपकरण",
  Others: "अन्य",
};

export class ExpenseService {
  public static async getUserExpenses(userId: string): Promise<IExpense[]> {
    return ExpenseModel.find({ user: userId }).sort({ createdAt: -1 });
  }

  public static async createExpense(userId: string, data: any): Promise<IExpense> {
    const categoryHi = data.categoryHi || categoryHiMap[data.category] || "अन्य";
    return ExpenseModel.create({
      ...data,
      categoryHi,
      user: userId,
    });
  }

  public static async updateExpense(id: string, updates: Partial<IExpense>): Promise<IExpense | null> {
    if (updates.category && !updates.categoryHi) {
      updates.categoryHi = categoryHiMap[updates.category] || "अन्य";
    }
    return ExpenseModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
  }

  public static async deleteExpense(id: string): Promise<IExpense | null> {
    return ExpenseModel.findByIdAndDelete(id);
  }
}
