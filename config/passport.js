const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./database');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    accessType: 'offline',  // Refresh Token을 받기 위해 offline으로 설정
    prompt: 'consent' // Refresh Token을 받기 위한 설정 근데 안됨....
  },
  async (accessToken, refreshToken, profile, done) => {
    // console.log('profile :',profile)
    const email = profile.emails[0].value;
    
    console.log('access: ',accessToken);
    console.log('refresh: ',refreshToken);

    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        user['accessToken'] = accessToken;
        return done(null, user);
      } else {
        const newUser = await pool.query(
          'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
          [email, profile.displayName]
        );
        const user = newUser.rows[0];
        user['accessToken'] = accessToken;
        return done(null, user);
      }
    } catch (err) {
      return done(err);
    }
  }
));

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
//     done(null, result.rows[0]);
//   } catch (err) {
//     done(err);
//   }
// });
