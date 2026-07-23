import { z } from "zod";

export const createCropSchema = z.object({
  body: z.object({
    farm: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Farm ID format").optional(),
    name: z.string().min(2, "Name must be at least 2 characters long"),
    nameHi: z.string().min(2, "Hindi name must be at least 2 characters long"),
    healthScore: z.number().min(0).max(100).optional(),
    ndvi: z.number().optional(),
    moisture: z.enum(["Good", "Moderate", "Dry", "Critical"]).optional(),
    moistureHi: z.string().optional(),
    stage: z.string().min(2, "Growth stage is required"),
    stageHi: z.string().min(2, "Hindi growth stage is required"),
    sowedDate: z.string().min(1, "Sowed date is required"),
    expectedHarvest: z.string().min(1, "Expected harvest date is required"),
    status: z.enum(["healthy", "moderate", "critical"]).optional(),
    diseaseRisk: z.number().min(0).max(100).optional(),
    diseaseName: z.string().optional(),
    recommendedAction: z.string().optional(),
  }),
});

export const updateCropSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    nameHi: z.string().min(2).optional(),
    healthScore: z.number().min(0).max(100).optional(),
    ndvi: z.number().optional(),
    moisture: z.enum(["Good", "Moderate", "Dry", "Critical"]).optional(),
    moistureHi: z.string().optional(),
    stage: z.string().min(2).optional(),
    stageHi: z.string().min(2).optional(),
    sowedDate: z.string().optional(),
    expectedHarvest: z.string().optional(),
    status: z.enum(["healthy", "moderate", "critical"]).optional(),
    diseaseRisk: z.number().min(0).max(100).optional(),
    diseaseName: z.string().optional(),
    recommendedAction: z.string().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Crop ID format"),
  }),
});
