import { FarmModel, IFarm } from "./farm.model";

export class FarmService {
  public static async createFarm(userId: string, data: any): Promise<IFarm> {
    return FarmModel.create({
      ...data,
      user: userId,
    });
  }

  public static async getUserFarms(userId: string): Promise<IFarm[]> {
    return FarmModel.find({ user: userId });
  }

  public static async getFarmById(id: string): Promise<IFarm | null> {
    return FarmModel.findById(id);
  }

  public static async updateFarm(id: string, updates: Partial<IFarm>): Promise<IFarm | null> {
    return FarmModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
  }

  public static async deleteFarm(id: string): Promise<IFarm | null> {
    return FarmModel.findByIdAndDelete(id);
  }
}
