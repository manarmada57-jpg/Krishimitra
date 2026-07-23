import { Router } from "express";
import passport from "passport";
import { AuthController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/requireAuth";
import { signupSchema, loginSchema, refreshSchema } from "./auth.schema";

const router = Router();

router.post("/signup", validate(signupSchema), AuthController.signup);
router.post("/login", validate(loginSchema), AuthController.login);
router.post("/refresh", validate(refreshSchema), AuthController.refresh);
router.post("/logout", requireAuth, AuthController.logout);

// Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  AuthController.googleCallback
);

export default router;
