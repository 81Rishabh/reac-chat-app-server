const mongoose = require("mongoose");
const multer = require('multer');
const path = require('path');
const AVATAR_PATH = path.join('/uploads/users/avatars');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "username is required"],
    },
    email: {
      type: String,
      required: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please use a valid email address",
      ],
    },
    profile_img : {
      type : String,
      default : 'https://cdn-icons-png.flaticon.com/512/149/149071.png?w=740&t=st=1676900870~exp=1676901470~hmac=219e2eb5832263ac6c13321aa42f2b1f2ca32eebedaf50e0cea421a640ec7540'
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    conform_password: {
      type: String,
      required: [true, "conform_password is required"],
    },
    groups : [{
      type : mongoose.Schema.Types.ObjectId,
      ref : 'GroupChat'
    }],
    message : [{
      type : mongoose.Schema.Types.ObjectId,
      ref : 'SingleChat'
    }]
  },
  { timestamps: true }
);

// storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..' , AVATAR_PATH));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
});

userSchema.statics.uploadAvatar = multer({storage : storage}).single('avatar');
userSchema.statics.avatar_path = AVATAR_PATH;


const User = mongoose.model('User', userSchema);
module.exports = User;