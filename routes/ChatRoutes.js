const express = require('express');
const router = express.Router();
const { sendMessage, getAllMessage, getUserChats, deleteMessage, editMessage } = require('../controllers/ChatController');
const upload = require('../config/Multer');
const checkAuthentication = require('../middlewares/CheckAuthentication');


router.post('/send/:senderId', checkAuthentication, sendMessage);
router.get('/all_message/:senderId', checkAuthentication, getAllMessage);
router.get('/user_chat/', checkAuthentication, getUserChats);
router.delete('/message/delete/:messageId', checkAuthentication, deleteMessage);
router.post('/message/edit/:messageId', checkAuthentication, editMessage);



module.exports = router;