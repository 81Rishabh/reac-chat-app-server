const User = require("../modal/user");

module.exports.users = async (req, res, next) => {
  try {
    let users = await User.find({})
    .select('username profile_img groups message email')
    .populate('groups' , 'groupName groupAdmin')
    .populate('message')

    return res.status(200).json({
      users: users,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Something went wrong");
  }
};
