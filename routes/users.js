const router = require("express").Router();
const authController = require("../controller/authController");
const usersController = require("../controller/usersController");
const passport = require("passport");
const authMiddleware = require("./authMiddleware");

// @post requests
router.post(
  "/sign_in",
  passport.authenticate('local' , {failWithError : true}),
  authController.sign_in,
);
router.post("/sign_up", authController.sign_up);

// @get request
router.get('/profile/:id', passport.authenticate('jwt' , {session : true}) ,authController.getProfile);

// @post request for upload profile
router.post('/upload-profile/:user_id' , authController.uploadProfile);

// @get request for get all the users
router.get('/get_users', usersController.users)

module.exports = router;
