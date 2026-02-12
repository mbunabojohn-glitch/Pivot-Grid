const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User');

function configurePassport(passport, env) {
  try {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_SECRET,
          callbackURL: env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = (profile.emails && profile.emails[0]?.value) || null;
            let user = await User.findOne({ googleId: profile.id }).lean();
            if (!user && email) {
              user = await User.findOne({ email }).lean();
            }
            if (!user) {
              const created = await User.create({
                email,
                googleId: profile.id,
                tradingLocked: false,
              });
              user = await User.findById(created._id).lean();
            } else if (!user.googleId) {
              await User.updateOne({ _id: user._id }, { $set: { googleId: profile.id } });
              user.googleId = profile.id;
            }
            return done(null, user);
          } catch (e) {
            return done(e);
          }
        }
      )
    );
  } catch (e) {
    // swallow
  }
}

module.exports = configurePassport;
