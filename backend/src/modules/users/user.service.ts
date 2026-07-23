import { UserModel, IUser } from "./user.model";
import { FarmModel, IFarm } from "../farms/farm.model";

export class UserService {
  public static async getUserById(userId: string): Promise<any | null> {
    const user = await UserModel.findById(userId).select("-password -refreshTokens");
    if (!user) return null;

    const farm = await FarmModel.findOne({ user: userId });
    return {
      ...user.toObject(),
      farm: farm ? farm.toObject() : null
    };
  }

  public static async updateProfile(
    userId: string,
    payload: Record<string, any>
  ): Promise<any | null> {
    const { username, language, onboarded, locationName, name, ...farmData } = payload;
    
    // 1. Update user fields if present
    const userUpdates: Record<string, any> = {};
    if (username !== undefined) userUpdates.username = username;
    if (language !== undefined) userUpdates.language = language;
    if (onboarded !== undefined) userUpdates.onboarded = onboarded;

    if (Object.keys(userUpdates).length > 0) {
      await UserModel.findByIdAndUpdate(userId, { $set: userUpdates }, { runValidators: true });
    }

    // 2. Update farm fields if present
    const farmUpdates: Record<string, any> = { ...farmData };
    if (locationName) farmUpdates.name = locationName;
    if (name) farmUpdates.name = name;

    let farm = null;
    if (Object.keys(farmUpdates).length > 0) {
      farm = await FarmModel.findOneAndUpdate(
        { user: userId },
        { $set: farmUpdates },
        { new: true, upsert: true, runValidators: true }
      );
    } else {
      farm = await FarmModel.findOne({ user: userId });
    }

    const updatedUser = await UserModel.findById(userId).select("-password -refreshTokens");
    if (!updatedUser) return null;

    return {
      ...updatedUser.toObject(),
      farm: farm ? farm.toObject() : null
    };
  }
}
