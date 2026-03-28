import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.js';
import User from '../models/User.js';
import { generateDEK, wrapDEK } from '../services/cryptoService.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // First login — generate a fresh DEK and wrap it with the KEK
          const { dek, iv: dekIV, encryptedDEK } = generateAndWrapDEK();

          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            displayName: profile.displayName,
            avatarUrl: profile.photos?.[0]?.value ?? null,
            encryptedDEK,
            dekIV,
          });
        } else {
          user.lastLogin = new Date();
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

function generateAndWrapDEK() {
  const dek = generateDEK();              // raw 32-byte Buffer
  const { encryptedDEK, iv } = wrapDEK(dek, env.SERVER_KEK);
  return { dek, iv, encryptedDEK };
}

export default passport;
