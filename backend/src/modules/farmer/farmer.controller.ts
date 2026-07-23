import { Request, Response, NextFunction } from "express";
import { UserModel } from "../users/user.model";
import { FarmModel } from "../farms/farm.model";
import { CropModel } from "../crops/crop.model";
import { signAccess, signRefresh } from "../../utils/jwt";
import { encrypt } from "../../utils/encryption";

export class FarmerController {
  public static async onboardFarmer(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        farmerName,
        locationName,
        lat,
        lng,
        boundaryPolygon,
        farmAreaAcres,
        cropName,
        sowingDate,
        waterSource,
        soilType,
        problem,
        cropsPerYear,
        cropAreaAcres,
        hasIrrigation,
        additionalProblem,
        language
      } = req.body;

      if (!farmerName) {
        return res.status(400).json({ success: false, message: "Farmer name is required" });
      }

      // Generate a unique anonymous email & dummy password for passwordless Mongoose compliance
      const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const email = `farmer_${uniqueId}@krishimitra.local`;
      const dummyPasswordHash = "$2b$10$WpQ8jGvF8o.9QZ7M1Y8c7e1Z3P4K5L6M7N8O9P0Q1R2S3T4U5V6W"; // pre-hashed placeholder

      // 1. Save User Document
      const user = await UserModel.create({
        username: farmerName,
        email,
        password: dummyPasswordHash,
        role: "farmer",
        language: language === "hi" ? "hi" : "en",
        onboarded: true
      });

      // 2. Save Farm Document (matching expanded IFarm schema)
      const farm = await FarmModel.create({
        user: user._id,
        name: locationName || `${farmerName}'s Farm`,
        nameHi: locationName || `${farmerName} का खेत`,
        lat: lat || 22.3395,
        lng: lng || 77.0984,
        boundaryPolygon: Array.isArray(boundaryPolygon) ? boundaryPolygon : [],
        farmAreaAcres: Number(farmAreaAcres) || 2.5,
        cropName: cropName || "Soybean",
        sowingDate: sowingDate || "20 Jun 2024",
        waterSource: waterSource || "Canal",
        soilType: soilType || "Black Soil",
        problem: problem || "Pest Attack",
        cropsPerYear: cropsPerYear || "One",
        cropAreaAcres: Number(cropAreaAcres) || Number(farmAreaAcres) || 2.5,
        hasIrrigation: hasIrrigation !== undefined ? Boolean(hasIrrigation) : true,
        additionalProblem: additionalProblem || "",
        temp: 32,
        ndvi: 0.72,
        isCustom: true
      });

      // 3. Save Crop Document (matching ICrop schema properties)
      let crop = null;
      if (cropName) {
        crop = await CropModel.create({
          farm: farm._id,
          user: user._id,
          name: cropName || "Soybean",
          nameHi: cropName === "Soybean" ? "सोयाबीन" : cropName === "Wheat" ? "गेहूं" : cropName === "Paddy" ? "धान" : cropName,
          healthScore: 85,
          ndvi: 0.75,
          moisture: "Good",
          moistureHi: "अच्छा",
          stage: "Sowing / Vegetative",
          stageHi: "वानस्पतिक विकास",
          sowedDate: sowingDate ? new Date(sowingDate).toISOString().split("T")[0] : "2026-06-01",
          expectedHarvest: "2026-10-15",
          status: "healthy",
          diseaseRisk: 5,
          diseaseName: "None",
          recommendedAction: "Maintain balanced irrigation and monitor foliage."
        });
      }

      // 4. Generate JWT Tokens for passwordless session persistence
      const accessToken = signAccess({ userId: user._id.toString(), role: user.role });
      const refreshToken = signRefresh({ userId: user._id.toString() });

      // Save encrypted refresh token to DB for rotation tracking
      const encrypted = encrypt(refreshToken);
      user.refreshTokens.push(encrypted);
      await user.save();

      return res.status(201).json({
        success: true,
        message: "Farmer profile and farm boundary successfully registered!",
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user._id,
            username: user.username,
            role: user.role,
            language: user.language
          },
          farm,
          crop
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
