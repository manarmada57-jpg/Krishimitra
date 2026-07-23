import { Router } from "express";
import { FarmerController } from "./farmer.controller";

const router = Router();

// Passwordless Onboarding Route
router.post("/onboard", FarmerController.onboardFarmer);

export default router;
