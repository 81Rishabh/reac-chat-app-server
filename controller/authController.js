const User = require("../modal/user");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");


module.exports.getProfile = async function (req, res, next) {
   try {
    const id = req.params.id;
    const user = await User.findById(id)
    .populate('groups')
    .select('username email profile_img groups  message');

    return res.status(200).json({
       data : user
    });

   } catch (error) {
     res.status(404);
     return next(new Error('We did not ge profile of this user'));
   }
}

module.exports.sign_in = async function (req, res, next) {
  const {email , password} = req.body;
 
  try {
    let user = await User.findOne({ email: email});
    if(user) {
      bcrypt.compare(password , user.password , (err , isMatch) => {
        if(!isMatch) {
          return res.status(400).json({
            message: "Invalid Email/password",
          });
        }
        else {
          return res.json(200, {
            message: "Sign in successfull , here is your token , keep it secret",
            data: {
              user: user,
              token: jwt.sign(user.toJSON(), "chitchat", { expiresIn: "2 days" }),
            },
          });
        }
       });
    }
  } catch (err) {
    res.status(401);
    return next(new Error('Unauthenticated!'));
  }
};




module.exports.sign_up = async function (req, res, next) {
  const { username, email, password, conform_password } = req.body;
  try {
    let isEmailExist = await User.findOne({ email : email});
    if(isEmailExist) {
       res.status(400);
       return next(new Error("Email already Exits"));
    }

    if (!username || !email || !password || !conform_password) {
      res.status(400);
      return next(new Error("Enter required fields"));
    }
    // password don't match
    if (password !== conform_password) {
      res.status(400);
      return next(new Error("password don't match"));
    }

    let user = await User.create(req.body);
    bcrypt.hash(password, saltRounds, function (err, hash) {
      // Store hash in your password DB.
      if (err) {
        return next(err);
      }
      user.password = hash;
      user.conform_password = hash;
      user.save();
    });
    return res.status(200).json({
      success: true,
      message: "Success! You have registered",
    });
  } catch (error) {
    res.status(404);
    return next(new Error(error.message))
  }
};


// controler for upload profile image
module.exports.uploadProfile = async function (req, res, next) { 
  try {
    const USER_ID = req.params.user_id;
    
    User.uploadAvatar(req , res , async (err) => {
      console.log(req.file);
      if (err) {
        console.log(err);
        res.status(400);
        throw new Error("somthing went wrong in uploadig image");
      } 
      
         await User.findByIdAndUpdate(USER_ID , {
           profile_img : User.avatar_path + "/" + req.file.filename
         });

          //  send back response to the server
          return res.status(201).json({
            success: true,
            message: "success",
            img_url : User.avatar_path + "/" + req.file.filename
          });
        });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "error",
      });
    }                                     
}