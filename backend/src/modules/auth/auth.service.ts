import bcrypt from "bcrypt";
import { UserModel, IUser } from "../users/user.model";
import { signAccess, signRefresh, verifyRefresh } from "../../utils/jwt";
import { encrypt, decrypt } from "../../utils/encryption";
import { safeCompare } from "../../utils/tokenCompare";

export class AuthService {
  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  public static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  public static async registerUser(data: any): Promise<IUser> {
    const hashedPassword = await this.hashPassword(data.password);
    return UserModel.create({
      username: data.username,
      email: data.email,
      password: hashedPassword,
      role: "farmer",
      language: "en",
    });
  }

  /**
   * Performs Refresh Token Rotation (RTR).
   * Detects reuse and invalidates all sessions of the user if reuse occurs.
   */
  public static async rotateTokens(token: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const decoded = verifyRefresh(token);
      const user = await UserModel.findById(decoded.userId);
      if (!user) return null;

      let matchedIndex = -1;
      for (let i = 0; i < user.refreshTokens.length; i++) {
        try {
          const decryptedToken = decrypt(user.refreshTokens[i]);
          if (safeCompare(decryptedToken, token)) {
            matchedIndex = i;
            break;
          }
        } catch (e) {
          // Skip corrupted or un-decryptable tokens
        }
      }

      // If token not found in the list, it's either an invalid token or a reused token
      if (matchedIndex === -1) {
        // Reuse detection: clear all sessions
        user.refreshTokens = [];
        await user.save();
        return null;
      }

      // Generate new tokens
      const newAccessToken = signAccess({ userId: user._id.toString(), role: user.role });
      const newRefreshToken = signRefresh({ userId: user._id.toString() });

      // Encrypt new refresh token at rest
      const encryptedNewToken = encrypt(newRefreshToken);

      // Replace old refresh token with new rotated token
      user.refreshTokens[matchedIndex] = encryptedNewToken;
      await user.save();

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      return null;
    }
  }

  public static async addRefreshToken(userId: string, token: string): Promise<void> {
    const encryptedToken = encrypt(token);
    await UserModel.findByIdAndUpdate(userId, {
      $push: { refreshTokens: encryptedToken }
    });
  }

  public static async removeRefreshToken(userId: string, token: string): Promise<void> {
    const user = await UserModel.findById(userId);
    if (!user) return;

    const remainingTokens: string[] = [];
    for (const t of user.refreshTokens) {
      try {
        const decrypted = decrypt(t);
        if (!safeCompare(decrypted, token)) {
          remainingTokens.push(t);
        }
      } catch (e) {
        remainingTokens.push(t);
      }
    }

    user.refreshTokens = remainingTokens;
    await user.save();
  }
}
