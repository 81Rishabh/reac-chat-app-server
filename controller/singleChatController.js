const ChatModal = require("../modal/SingleChatModal");
const Users = require("../modal/user");
const Messages = require("../modal/SingleChatModal");

// controller for fetching messages
module.exports.fetchMessages = async (req, res, next) => {
  const sender_id = req.params.id;
  const receiver_id = req.user.id;

  try {
     const condition = {
      $or: [
         {$and : [{from : sender_id},{to : receiver_id}]},
         {$and : [{from : receiver_id},{to : sender_id}]},
      ],
    };
    let messages = await Messages.find(condition);
    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// controller for creating message
module.exports.createSingleMessage = async (req, res, next) => {
  try {
    await ChatModal.create(req.body);
    return res.status(200).json({
      message: "message sent",
      success: true,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

