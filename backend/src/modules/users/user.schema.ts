import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    username: z.string().min(2, "Username must be at least 2 characters long").optional(),
    language: z.enum(["en", "hi"]).optional(),
    onboarded: z.boolean().optional(),
    locationName: z.string().optional(),
    name: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    boundaryPolygon: z.array(z.object({ lat: z.number(), lng: z.number() })).optional(),
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
    ndvi: z.number().optional(),
    healthScore: z.number().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(6, "Old password must be at least 6 characters long"),
    newPassword: z.string().min(6, "New password must be at least 6 characters long"),
  }),
});
