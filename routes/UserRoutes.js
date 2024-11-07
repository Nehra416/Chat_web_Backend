const express = require('express');
const router = express.Router();
const { signup, signin, updateUser, verifyOtpForForgetPassword, updateForgetPassword, logout } = require('../controllers/UserController');
const upload = require('../config/Multer');
const checkAuthentication = require('../middlewares/CheckAuthentication');


router.post('/signup', signup);
router.post('/signin', signin);
router.post('/forget', verifyOtpForForgetPassword);
router.post('/forget/update', updateForgetPassword);
router.post('/update', checkAuthentication, upload.single('avatarUrl'), updateUser);
router.get('/logout', logout);


module.exports = router;