import { z } from "zod";

export const createFarmSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    nameHi: z.string().min(2, "Hindi name must be at least 2 characters long"),
    lat: z.number({ required_error: "Latitude is required" }),
    lng: z.number({ required_error: "Longitude is required" }),
    temp: z.number().optional(),
    ndvi: z.number().optional(),
    isCustom: z.boolean().optional(),
  }),
});

export const updateFarmSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    nameHi: z.string().min(2).optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    temp: z.number().optional(),
    ndvi: z.number().optional(),
    isCustom: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Mongo ID format"),
  }),
});
