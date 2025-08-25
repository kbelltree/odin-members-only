const passport = require('passport');

const authenticateLocal = passport.authenticate('local', {
  failureRedirect: '/log-in',
  successRedirect: 'member-only',
});

function redirectIfAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.is_member === true) {
      return res.redirect('/member-only');
    }
    return res.redirect('/');
  }
  next();
}

function verifyAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/log-in');
  }
  next();
}

function verifyMembership(req, res, next) {
  if (req.user.is_member === false) {
    return res.redirect('/');
  }
  next();
}

function verifyAdminGranted(req, res, next) {
  if (req.user.is_admin === false) {
    return res.redirect('/member-only');
  }
  next();
}

module.exports = {
  authenticateLocal,
  redirectIfAuthenticated,
  verifyAuthenticated,
  verifyMembership,
  verifyAdminGranted,
};
