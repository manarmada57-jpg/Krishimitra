import { CropModel, ICrop } from "./crop.model";
import { FarmModel } from "../farms/farm.model";

export class CropService {
  public static async createCrop(userId: string, data: any): Promise<ICrop> {
    let farmId = data.farm;
    if (!farmId) {
      const existingFarm = await FarmModel.findOne({ user: userId });
      if (existingFarm) {
        farmId = existingFarm._id;
      } else {
        const newFarm = await FarmModel.create({
          user: userId,
          name: "Main Farm",
          nameHi: "मुख्य खेत",
          lat: 23.2599,
          lng: 77.4126,
          temp: 32,
          ndvi: 0.72,
          isCustom: true,
        });
        farmId = newFarm._id;
      }
    }

    return CropModel.create({
      ...data,
      farm: farmId,
      user: userId,
    });
  }

  public static async getCropsByFarm(farmId: string): Promise<ICrop[]> {
    return CropModel.find({ farm: farmId });
  }

  public static async getUserCrops(userId: string): Promise<ICrop[]> {
    return CropModel.find({ user: userId });
  }

  public static async getCropById(id: string): Promise<ICrop | null> {
    return CropModel.findById(id);
  }

  public static async updateCrop(id: string, updates: Partial<ICrop>): Promise<ICrop | null> {
    return CropModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
  }

  public static async deleteCrop(id: string): Promise<ICrop | null> {
    return CropModel.findByIdAndDelete(id);
  }
}
