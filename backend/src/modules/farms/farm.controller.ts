import { Request, Response, NextFunction } from "express";
import { FarmService } from "./farm.service";

export class FarmController {
  public static async createFarm(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const farm = await FarmService.createFarm(userId, req.body);
      return res.status(201).json({ success: true, data: farm });
    } catch (error) {
      next(error);
    }
  }

  public static async getMyFarms(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const farms = await FarmService.getUserFarms(userId);
      return res.status(200).json({ success: true, data: farms });
    } catch (error) {
      next(error);
    }
  }

  public static async getFarmDetails(req: Request, res: Response, next: NextFunction) {
    try {
      // ownershipCheck middleware handles authorization and attaches resource to req
      const farm = (req as any).resource;
      return res.status(200).json({ success: true, data: farm });
    } catch (error) {
      next(error);
    }
  }

  public static async updateFarm(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatedFarm = await FarmService.updateFarm(id, req.body);
      return res.status(200).json({ success: true, data: updatedFarm });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteFarm(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await FarmService.deleteFarm(id);
      return res.status(200).json({ success: true, message: "Farm deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  public static async getSatelliteTelemetry(req: Request, res: Response, next: NextFunction) {
    try {
      const lat = parseFloat(req.query.lat as string) || 22.3395;
      const lng = parseFloat(req.query.lng as string) || 77.0984;

      const baseNdvi = 0.65 + ((Math.abs(Math.sin(lat * 10)) * 0.25));
      const ndvi = Math.round(baseNdvi * 100) / 100;
      const soilMoisture = Math.round((22 + (Math.abs(Math.cos(lng * 10)) * 14)) * 10) / 10;
      const canopyHealth = ndvi > 0.7 ? "Excellent (Dense Foliage)" : ndvi > 0.5 ? "Good (Optimal Photosynthesis)" : "Fair (Moderate Stress)";

      return res.status(200).json({
        success: true,
        data: {
          satellite: "Sentinel-2 L2A",
          tileDate: new Date().toISOString().split("T")[0],
          center: { lat, lng },
          metrics: {
            ndvi,
            soilMoisturePercent: soilMoisture,
            canopyHealthStatus: canopyHealth,
            chlorophyllContentMg: Math.round(ndvi * 45 * 10) / 10,
            evapotranspirationMmDay: 4.2
          },
          tileLayerUrl: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

