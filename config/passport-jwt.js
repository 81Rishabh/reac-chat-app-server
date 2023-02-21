
const JWTStratergy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

// require User Model
const User = require('../modal/user');  

module.exports = function(passport){
    const opts = {
        jwtFromRequest :  ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey  : 'chitchat',
    }
    passport.use(new JWTStratergy(opts , function(jwtPayload , done){
        User.findById(jwtPayload._id , function(err, user){
            if(err) {
                console.log('error is finding user..!');
                return;
            }
            if(user) {
                return done(null, user);
            }else {
                return done(null , false);
            }
        })
    }));
} 
