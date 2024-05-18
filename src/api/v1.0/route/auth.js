const express = require('express');
const router = express.Router();
const cors = require('cors');
const passport = require('passport');
require('../../../../config/passport')(passport);
const auth_controller = require("../../../controllers/authController")


router.post('/register', auth_controller.register);
router.post('/login', auth_controller.login);
router.get('/logout', auth_controller.logout);
router.post('/forgot-password', auth_controller.forgetPassword);
router.post('/reset-password', auth_controller.resetPassword);



module.exports = router;
