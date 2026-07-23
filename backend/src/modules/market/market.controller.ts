import { Request, Response, NextFunction } from "express";
import { MarketService } from "./market.service";

export class MarketController {
  /**
   * Fetch list of Mandi market prices with optional search queries.
   */
  public static async getPrices(req: Request, res: Response, next: NextFunction) {
    try {
      const district = (req.query.district || req.query.location) as string | undefined;
      const cropName = (req.query.cropName || req.query.crop) as string | undefined;

      const prices = await MarketService.getPrices({ district, cropName });
      return res.status(200).json({ 
        success: true, 
        data: prices 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Log a new Mandi market price entry.
   * Typically restricted to Admin roles.
   */
  public static async createPriceEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await MarketService.createPriceEntry(req.body);
      return res.status(201).json({ 
        success: true, 
        data: entry 
      });
    } catch (error) {
      next(error);
    }
  }
}
