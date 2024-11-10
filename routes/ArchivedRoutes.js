const express = require('express');
const router = express.Router();
const { chatArchived, removeArchivedChat, getArchivedChat } = require('../controllers/ArchivedController');
const checkAuthentication = require('../middlewares/CheckAuthentication');

router.get('/add/:chatId', checkAuthentication, chatArchived);
router.get('/remove/:chatId', checkAuthentication, removeArchivedChat);
router.get('/all', checkAuthentication, getArchivedChat);

module.exports = router;