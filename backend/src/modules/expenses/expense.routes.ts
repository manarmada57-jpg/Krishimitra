import { Router } from "express";
import { ExpenseController } from "./expense.controller";
import { requireAuth } from "../../middleware/requireAuth";
import { validate } from "../../middleware/validate";
import { ownershipCheck } from "../../utils/ownershipCheck";
import { ExpenseModel } from "./expense.model";
import { createExpenseSchema, updateExpenseSchema } from "./expense.schema";

const router = Router();

// Require authentication for all expense operations
router.use(requireAuth);

router.get("/", ExpenseController.getMyExpenses);
router.post("/", validate(createExpenseSchema), ExpenseController.createExpense);
router.patch("/:id", validate(updateExpenseSchema), ownershipCheck(ExpenseModel, "id", "user"), ExpenseController.updateExpense);
router.delete("/:id", ownershipCheck(ExpenseModel, "id", "user"), ExpenseController.deleteExpense);

export default router;
