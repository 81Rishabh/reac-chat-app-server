const express = require('express');
const router = express.Router();
const chatController = require('../controller/singleChatController');
const passport = require('passport');


// @post request for creating group chat
router.get('/messages/:id', passport.authenticate('jwt' , {session : true}) , chatController.fetchMessages);

// @port request for creating message
router.post('/create_single_chat' , chatController.createSingleMessage)

module.exports = router;