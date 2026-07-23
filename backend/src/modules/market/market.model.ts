import { Schema, model, Document } from "mongoose";

export interface IMarketPrice extends Document {
  cropName: string;
  cropNameHi: string;
  mandiName: string;
  mandiNameHi: string;
  price: number; // mapped to modalPrice
  minPrice: number;
  maxPrice: number;
  prevModalPrice: number;
  arrivalQty: number; // in Tons
  distance: number; // in km
  unit: string;
  trend: "up" | "down" | "stable";
  state: string;
  district: string;
  variety: string;
  varietyHi: string;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

const marketPriceSchema = new Schema<IMarketPrice>(
  {
    cropName: { type: String, required: true },
    cropNameHi: { type: String, required: true },
    mandiName: { type: String, required: true },
    mandiNameHi: { type: String, required: true },
    price: { type: Number, required: true },
    minPrice: { type: Number, required: true },
    maxPrice: { type: Number, required: true },
    prevModalPrice: { type: Number, required: true },
    arrivalQty: { type: Number, required: true },
    distance: { type: Number, required: true },
    unit: { type: String, default: "Quintal" },
    trend: { type: String, enum: ["up", "down", "stable"], default: "stable" },
    state: { type: String, required: true },
    district: { type: String, required: true },
    variety: { type: String, required: true },
    varietyHi: { type: String, required: true },
    date: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const MarketPriceModel = model<IMarketPrice>("MarketPrice", marketPriceSchema);
