import { Router } from "express";
import { VedasController } from "./vedas.controller";
import { requireAuth } from "../../middleware/requireAuth";

const router = Router();

/**
 * GET /api/crops/satellite-insights
 * Fetch NDVI time-series + soil moisture + farmer advice for a location.
 * Requires: ?lat=<number>&lng=<number>
 * Optional: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
router.get("/satellite-insights", VedasController.getSatelliteInsights);

/**
 * GET /api/crops/vedas-wms-config
 * Returns WMS endpoint and layer names for frontend Leaflet map.
 */
router.get("/vedas-wms-config", VedasController.getWmsConfig);

/**
 * DELETE /api/crops/satellite-insights/cache
 * Clears the in-memory cache. Useful for admins / debugging.
 * Optional: ?lat=<number>&lng=<number> to clear specific farm cache.
 */
router.delete("/satellite-insights/cache", requireAuth, VedasController.clearCache);

export default router;
