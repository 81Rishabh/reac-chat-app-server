const mongoose = require("mongoose");

const singleChatSchema = mongoose.Schema({
  from:{
    type: mongoose.Schema.Types.ObjectId,
    ref : "User",
  },
  to:{
    type: mongoose.Schema.Types.ObjectId,
    ref : "User",
  },
  content : {
    type : String,
    trim  : true
  },
  time : {
    type : String
  }
},{timestamps : true});

const singleChat = mongoose.model("SingleChat", singleChatSchema);
module.exports = singleChat;
