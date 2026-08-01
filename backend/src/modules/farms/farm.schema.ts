import { z } from "zod";

const pointSchema = z.object({
  lat: z.number(),
  lng: z.number()
});

export const createFarmSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    nameHi: z.string().min(2, "Hindi name must be at least 2 characters long"),
    lat: z.number({ required_error: "Latitude is required" }),
    lng: z.number({ required_error: "Longitude is required" }),
    boundaryPolygon: z.array(pointSchema).optional(),
    farmAreaAcres: z.number().optional(),
    cropName: z.string().optional(),
    sowingDate: z.string().optional(),
    waterSource: z.string().optional(),
    soilType: z.string().optional(),
    problem: z.string().optional(),
    cropsPerYear: z.string().optional(),
    cropAreaAcres: z.number().optional(),
    hasIrrigation: z.boolean().optional(),
    additionalProblem: z.string().optional(),
    temp: z.number().optional(),
    ndvi: z.number().optional(),
    healthScore: z.number().optional(),
    isCustom: z.boolean().optional(),
  }),
});

export const updateFarmSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    nameHi: z.string().min(2).optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    boundaryPolygon: z.array(pointSchema).optional(),
    farmAreaAcres: z.number().optional(),
    cropName: z.string().optional(),
    sowingDate: z.string().optional(),
    waterSource: z.string().optional(),
    soilType: z.string().optional(),
    problem: z.string().optional(),
    cropsPerYear: z.string().optional(),
    cropAreaAcres: z.number().optional(),
    hasIrrigation: z.boolean().optional(),
    additionalProblem: z.string().optional(),
    temp: z.number().optional(),
    ndvi: z.number().optional(),
    healthScore: z.number().optional(),
    isCustom: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Mongo ID format"),
  }),
});
