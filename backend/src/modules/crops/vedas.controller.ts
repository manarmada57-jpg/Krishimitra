import { Request, Response, NextFunction } from "express";
import { VedasService } from "./vedas.service";

export class VedasController {
  /**
   * GET /api/crops/satellite-insights
   * Query params: lat, lng, startDate, endDate
   * Returns computed NDVI + soil moisture metrics with farmer-friendly advice.
   */
  static async getSatelliteInsights(req: Request, res: Response, next: NextFunction) {
    try {
      // Parse required parameters
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
          success: false,
          message: "Valid 'lat' and 'lng' query parameters are required.",
        });
      }

      // Default: last 90 days of satellite data
      const today = new Date();
      const defaultStart = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

      const startDate = (req.query.startDate as string) || defaultStart.toISOString().split("T")[0];
      const endDate = (req.query.endDate as string) || today.toISOString().split("T")[0];

      const result = await VedasService.getSatelliteInsights(lat, lng, startDate, endDate);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/crops/vedas-wms-config
   * Returns WMS endpoint and available layer names for the frontend map component.
   */
  static getWmsConfig(_req: Request, res: Response) {
    return res.status(200).json({
      success: true,
      data: {
        wmsEndpoint: VedasService.getWmsEndpoint(),
        layers: VedasService.getWmsLayers(),
      },
    });
  }

  /**
   * DELETE /api/crops/satellite-insights/cache
   * Clears cached data to force a fresh fetch.
   */
  static clearCache(req: Request, res: Response) {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
    VedasService.clearCache(lat, lng);
    return res.status(200).json({ success: true, message: "VEDAS cache cleared." });
  }
}
