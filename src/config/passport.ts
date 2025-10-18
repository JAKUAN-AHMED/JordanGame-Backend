import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { User } from "../modules/user/user.model";
import { config } from ".";



// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: config.provider.google_client_id as string,
      clientSecret: config.provider.google_client_secret!,
      callbackURL:config.provider.google_callback_url!,
    },
    async (_, __, profile, done) => {
      try {
        let user = await User.findOne({
          provider: "google",
          providerId: profile?.id,
        });

        if (!user) {
          user = await User.create({
            provider: "google",
            providerId: profile?.id,
            email: profile.emails?.[0]?.value || null,
            fname: profile?.displayName,
            isEmailVerified: true,
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err,null!);
      }
    }
  )
);



export default passport;
