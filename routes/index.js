const router = require('express').Router();

router.use('/auth' , require('./users'));
router.use('/chat' , require('./groupChat'));
router.use('/chat' , require('./singleChat'));
module.exports = router;