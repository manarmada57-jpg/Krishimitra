import { Router } from "express";
import { UserController } from "./user.controller";
import { requireAuth } from "../../middleware/requireAuth";
import { validate } from "../../middleware/validate";
import { updateProfileSchema } from "./user.schema";

const router = Router();

router.get("/profile", requireAuth, UserController.getProfile);
router.patch("/profile", requireAuth, validate(updateProfileSchema), UserController.updateProfile);

export default router;
