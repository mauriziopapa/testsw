const express = require('express');
// const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const path = require('path');
const compression = require('compression');
const createError = require('http-errors');

const routes = require('./routes');
const auth = require('./lib/auth');
const { db } = require('./lib/db');

const config = require('./config')[process.env.NODE_ENV || 'local'];

const log = config.log();

module.exports = () => {
  const app = express();
  // app.use(helmet());
  app.use(cors({ credentials: true, origin: true }));
  app.use(compression());

  app.locals.title = config.sitename;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));
  app.use(cookieParser());

  const sessionStore = new SequelizeStore({
    db: db.sequelize,
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: 10 * 60 * 60 * 1000
  });

  /* if (app.get('env') === 'production') {
    app.set('trust proxy', 'loopback');
    app.use(
      session({
        secret: process.env.SESSION_SECRET,
        name: 'sessionId',
        proxy: true,
        resave: false,
        cookie: { secure: true },
        saveUninitialized: false,
        store: sessionStore
      })
    );
  } else { */
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: sessionStore
    })
  );
  // }

  sessionStore.sync();

  app.use(auth.initialize);
  app.use(auth.session);

  // prefix api for all the api routes
  app.use('/api', routes());

  // serve static files
  app.use('/assets', express.static(path.join(__dirname, '../public'), { maxAge: '1d' }));
  app.get('*.*', express.static(path.join(__dirname, '../dist'), { maxAge: '1d' }));

  // serve frontend paths
  app.all('*', (req, res) => {
    res.status(200).sendFile('/', { root: path.join(__dirname, '../dist') });
  });

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    next(createError(404));
  });

  if (app.get('env') === 'local') {
    app.locals.pretty = true;
  }

  // error handler
  app.use((err, req, res) => {
    res.locals.message = err.message;
    log.error(err);
    const status = err.status || 500; // If no status is provided, let's assume it's a 500
    res.locals.status = status;
    res.locals.error = req.app.get('env') === 'local' ? err : {};
    res.status(status);
    res.send('error');
  });

  return app;
};
