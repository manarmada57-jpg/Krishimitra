import { Schema, model, Document } from "mongoose";

export interface ICrop extends Document {
  farm: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  name: string;
  nameHi: string;
  healthScore: number;
  ndvi: number;
  moisture: "Good" | "Moderate" | "Dry" | "Critical";
  moistureHi: string;
  stage: string;
  stageHi: string;
  sowedDate: string;
  expectedHarvest: string;
  status: "healthy" | "moderate" | "critical";
  diseaseRisk: number; // 0 to 100
  diseaseName: string;
  recommendedAction: string;
  createdAt: Date;
  updatedAt: Date;
}

const cropSchema = new Schema<ICrop>(
  {
    farm: { type: Schema.Types.ObjectId, ref: "Farm", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    nameHi: { type: String, required: true },
    healthScore: { type: Number, default: 85 },
    ndvi: { type: Number, default: 0.68 },
    moisture: { type: String, enum: ["Good", "Moderate", "Dry", "Critical"], default: "Good" },
    moistureHi: { type: String, default: "अच्छा" },
    stage: { type: String, required: true },
    stageHi: { type: String, required: true },
    sowedDate: { type: String, required: true },
    expectedHarvest: { type: String, required: true },
    status: { type: String, enum: ["healthy", "moderate", "critical"], default: "healthy" },
    diseaseRisk: { type: Number, default: 0 },
    diseaseName: { type: String, default: "None" },
    recommendedAction: { type: String, default: "None" },
  },
  {
    timestamps: true,
  }
);

export const CropModel = model<ICrop>("Crop", cropSchema);
