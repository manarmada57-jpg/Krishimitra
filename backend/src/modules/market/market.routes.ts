import { Router } from "express";
import { MarketController } from "./market.controller";
import { requireAuth } from "../../middleware/requireAuth";
import { roleGuard } from "../../middleware/roleGuard";

const router = Router();

// Protect market endpoints
router.get("/", requireAuth, MarketController.getPrices);

// Only admins can post new mandi price entries
router.post("/", requireAuth, roleGuard(["admin"]), MarketController.createPriceEntry);

export default router;
