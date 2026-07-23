import { Router } from "express";
import { WeatherController } from "./weather.controller";
import { requireAuth } from "../../middleware/requireAuth";

const router = Router();

// Protect all weather endpoints
router.get("/forecast", requireAuth, WeatherController.getForecast);

export default router;
