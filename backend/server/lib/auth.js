const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { User, UserDashboard, Dashboard } = require('../models');

const config = require('../config')[process.env.NODE_ENV || 'local'];

const log = config.log();

passport.use(
  new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
    try {
      const user = await User.findOne({
        where: { username },
        include: [
          {
            model: UserDashboard,
            where: { visible: 1 },
            include: [Dashboard]
          }
        ]
      });
      if (!user) {
        return done(null, false, { message: 'Invalid username or password' });
      }
      const passwordOK = await user.comparePassword(password);
      if (!passwordOK) {
        return done(null, false, { message: 'Invalid username or password' });
      }
      return done(null, user);
    } catch (err) {
      log.error('Error during login', err.message);
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id, {
      include: [
        {
          model: UserDashboard,
          where: { visible: 1 },
          include: [Dashboard]
        }
      ]
    });
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});

module.exports = {
  initialize: passport.initialize(),
  session: passport.session()
};
