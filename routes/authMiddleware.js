const express = require('express');
const router = express.Router();
const passport = require('passport');


router.all('*', function (req, res, next) {
  passport.authenticate('local', { failWithError: true }, function(err, user, info) {

    // If authentication failed, `user` will be set to false. If an exception occurred, `err` will be set.
    if (err || !user ) {
      // PASS THE ERROR OBJECT TO THE NEXT ROUTE i.e THE APP'S COMMON ERROR HANDLING MIDDLEWARE
      return next(info);
    } else {
      return next();
    }
  })(req, res, next);
});

module.exports = router;