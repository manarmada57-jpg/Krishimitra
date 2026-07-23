import { Schema, model, Document } from "mongoose";

export interface IPoint {
  lat: number;
  lng: number;
}

export interface IFarm extends Document {
  user: Schema.Types.ObjectId;
  name: string;
  nameHi: string;
  lat: number;
  lng: number;
  boundaryPolygon: IPoint[];
  farmAreaAcres: number;
  cropName: string;
  sowingDate: string;
  waterSource: string;
  soilType: string;
  problem: string;
  cropsPerYear: string;
  cropAreaAcres: number;
  hasIrrigation: boolean;
  additionalProblem: string;
  temp: number;
  ndvi: number;
  healthScore: number;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const farmSchema = new Schema<IFarm>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    nameHi: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    boundaryPolygon: [
      {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
      }
    ],
    farmAreaAcres: { type: Number, default: 2.5 },
    cropName: { type: String, default: "Soybean" },
    sowingDate: { type: String, default: "2026-06-15" },
    waterSource: { type: String, default: "Canal" },
    soilType: { type: String, default: "Black Soil" },
    problem: { type: String, default: "Pest Attack" },
    cropsPerYear: { type: String, default: "Two" },
    cropAreaAcres: { type: Number, default: 2.5 },
    hasIrrigation: { type: Boolean, default: true },
    additionalProblem: { type: String, default: "" },
    temp: { type: Number, default: 32 },
    ndvi: { type: Number, default: 0.72 },
    healthScore: { type: Number, default: 80 },
    isCustom: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

export const FarmModel = model<IFarm>("Farm", farmSchema);
