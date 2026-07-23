import { Request, Response, NextFunction } from "express";
import { WeatherService } from "./weather.service";

export class WeatherController {
  /**
   * Endpoint to retrieve weather forecast by latitude and longitude.
   */
  public static async getForecast(req: Request, res: Response, next: NextFunction) {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ 
          success: false, 
          message: "Bad Request: Latitude (lat) and Longitude (lng) must be valid numbers" 
        });
      }

      const forecast = await WeatherService.getForecast(lat, lng);
      return res.status(200).json({ 
        success: true, 
        data: forecast 
      });
    } catch (error) {
      next(error);
    }
  }
}
