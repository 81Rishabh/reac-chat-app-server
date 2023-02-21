const express = require('express');
const router = express.Router();
const chatController = require('../controller/groupChatController');



// @post request for creating group chat
router.get('/groups' , chatController.groups);

// @post request for creating group chat
router.post('/createGroupChat' , chatController.create);


// @port request for creating message
router.post('/send_message' , chatController.send_message)


module.exports = router;