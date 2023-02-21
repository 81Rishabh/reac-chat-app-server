const LocalStrategy = require("passport-local").Strategy;
const User = require("../modal/user");
const bcrypt = require('bcrypt');

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email'},
      async (email, password, done) => {
        try {
          let user = await User.findOne({email : email});
          if(!user) {
             return done(null , false , {message : 'This email was not registered...'});
          }

          bcrypt.compare(password , user.password , (err , isMatch) => {
            if(isMatch) {
                done(null , user);
            } else {
                done(null , false, { message : 'Password is incorrect'})
            }
         });
        } catch (error) {
            console.log(error);
        }
       }
    )
  );

  // serialize user
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    
    // deserializerUser
    passport.deserializeUser(function(id, done) {
        User.findById(id , function(err , user){
            if(err) {
                console.log('Error in finding user --> passport', err);
                return done(err);
            }
            return done(null , user)
        });
    });
};



