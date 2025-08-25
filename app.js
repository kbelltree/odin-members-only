require('dotenv').config();
const express = require('express');
const path = require('node:path');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const pool = require('./db/pool');
const methodOverride = require('method-override');
const index = require('./routes');

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(
  session({
    store: new pgSession({
      pool: pool,
      createTableIfMissing: true,
      // 'PruneSessionInterval' option below explicitly set it here only for future reference.
      // Sets the interval (in seconds) for removing expired sessions from the store.
      // Default is 900 (15 minutes), so this option DOES NOT NEEDED TO BE ADDED unless
      // you want a different interval or to disable pruning.
      pruneSessionInterval: 900,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // pruneSessionInterval compares this expiration time against the current time
    // to remove expired sessions from the store.
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use(passport.session());

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      const user = rows[0];
      if (!user) {
        return done(null, false, { message: 'Incorrect username' });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: 'Incorrect password' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [
      id,
    ]);
    const user = rows[0];
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use('/', index);

app.use((req, res, next) => {
  res.status(404).send('404 - Page Not Found.');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('500 - Something went wrong.');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Members Only App - listening on port ${PORT}`);
});
