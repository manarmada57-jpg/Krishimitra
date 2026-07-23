import { Schema, model, Document } from "mongoose";

export interface IExpense extends Document {
  user: Schema.Types.ObjectId;
  category: "Seed" | "Fertilizer" | "Labor" | "Water" | "Equipment" | "Others";
  categoryHi: "बीज" | "खाद" | "मजदूरी" | "सिंचाई" | "उपकरण" | "अन्य";
  amount: number;
  date: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      enum: ["Seed", "Fertilizer", "Labor", "Water", "Equipment", "Others"],
      required: true,
    },
    categoryHi: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    notes: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

export const ExpenseModel = model<IExpense>("Expense", expenseSchema);
