const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const User = require('../models/User');

module.exports = function(passportInstance) {
  passportInstance.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // User exists, only update avatar if user doesn't have one
        if (!user.img && profile.photos && profile.photos[0] && profile.photos[0].value) {
          user.img = profile.photos[0].value;
          await user.save();
        }
        // User exists, return user
        return done(null, user);
      } else {
        // Create new user
        const newUser = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          password: 'google_oauth_' + Math.random().toString(36).substring(2), // Random password for Google users
          role: profile.emails[0].value.toLowerCase() === 'admin@gmail.com' ? 'admin' : 'user',
          hasMapAccess: profile.emails[0].value.toLowerCase() === 'admin@gmail.com',
          upgradeStatus: profile.emails[0].value.toLowerCase() === 'admin@gmail.com' ? 'approved' : 'none',
          img: profile.photos[0]?.value || null
        });
        
        await newUser.save();
        return done(null, newUser);
      }
    } catch (err) {
      console.error('Google OAuth Error:', err);
      return done(err, null);
    }
  }));
};

// Serialize and deserialize user (for sessions)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
