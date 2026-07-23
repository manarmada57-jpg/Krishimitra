import { z } from "zod";

export const createExpenseSchema = z.object({
  body: z.object({
    category: z.enum(["Seed", "Fertilizer", "Labor", "Water", "Equipment", "Others"]),
    categoryHi: z.string().optional(),
    amount: z.number().positive("Amount must be positive"),
    date: z.string().min(1, "Date is required"),
    notes: z.string().optional(),
  }),
});

export const updateExpenseSchema = z.object({
  body: z.object({
    category: z.enum(["Seed", "Fertilizer", "Labor", "Water", "Equipment", "Others"]).optional(),
    categoryHi: z.string().optional(),
    amount: z.number().positive().optional(),
    date: z.string().optional(),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Expense ID format"),
  }),
});
