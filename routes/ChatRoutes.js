const express = require('express');
const router = express.Router();
const { sendMessage, getAllMessage } = require('../controllers/ChatController');
const upload = require('../config/Multer');
const checkAuthentication = require('../middlewares/CheckAuthentication');


router.post('/send/:senderId', checkAuthentication, sendMessage);
router.get('/all_message/:senderId', checkAuthentication, getAllMessage);



module.exports = router;