const chatModal = require("../modal/chatModal");
const UserModal = require("../modal/user");
const groupMessageModal = require("../modal/GroupMessage");
const ErrorResponse = require("../utils/ErrorResponse");

// controller for get all the create groups
module.exports.groups = async (req, res, next) => {
  try {
    const selectKey = "username email";
    const groups = await chatModal
      .find({})
      .populate("users", selectKey)
      .populate("groupAdmin", selectKey)
      .populate({
        path: "messages",
        populate: {
          path: "sender",
          select: "username",
        },
      });

    return res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

module.exports.create = async (req, res, next) => {
  const { groupName, users, groupAdmin } = req.body;

  if (!groupName) {
    return next(new ErrorResponse("group name is required", 400));
  }

  try {
    const group = await chatModal.create(req.body);

    // updating user modal
    await UserModal.updateMany(
      {
        _id: {
          $in: [groupAdmin, ...users],
        },
      },
      {
        $push: {
          groups: group._id,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "group creaated..",
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// controller for sedning message
module.exports.send_message = async (req, res, next) => {
  const { content, group } = req.body;

  //  hanlding validaion
  if (!content || !group) {
    console.log("Invalid data passed into request.");
    return res.sendStatus(400);
  }

  //  message obj
  var messageObj = { ...req.body };

  try {
    //  saving in mongodb
    let message = await groupMessageModal.create(messageObj);
    //  populating fields
    message = await message.populate("sender", "username");
    message = await message.populate({
      path: "group",
      populate: {
        path: "users",
        select: "username email",
      },
    });

    //  save message in chat modal
    let getGroup = await chatModal.findById(group);
    getGroup.messages.push(message._id);
    getGroup.save();

    // send data to client
    return res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};
