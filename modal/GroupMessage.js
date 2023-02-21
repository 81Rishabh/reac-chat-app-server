const mongoose = require('mongoose');

const groupMessageSchema = mongoose.Schema({
    sender:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    content : {
        type : String,
        trim : true
    },
    time : {
        type : String,
        trim : true
    },
    group : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'GroupChat'
    }
},{timestamps : true});


const groupMessageModal =  mongoose.model('groupMessage' , groupMessageSchema);
module.exports = groupMessageModal;