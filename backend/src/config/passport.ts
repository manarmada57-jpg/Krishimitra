import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env";
import { UserModel } from "../modules/users/user.model";

export function configurePassport(): void {
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          callbackURL: env.GOOGLE_CALLBACK_URL,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error("No email found in Google profile"), undefined);
            }

            let user = await UserModel.findOne({ email });
            if (!user) {
              // Create user if not exists
              user = await UserModel.create({
                email,
                username: profile.displayName || email.split("@")[0],
                googleId: profile.id,
                role: "farmer",
                language: "en",
                onboarded: true,
              });
            } else if (!user.googleId) {
              // Link google account to existing email account
              user.googleId = profile.id;
              await user.save();
            }

            return done(null, user as any);
          } catch (error) {
            return done(error as Error, undefined);
          }
        }
      )
    );
  } else {
    console.log("ℹ️ Google OAuth not configured (missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_CALLBACK_URL).");
  }
}
