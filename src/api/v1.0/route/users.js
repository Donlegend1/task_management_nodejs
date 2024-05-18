const express = require('express');
const router = express.Router();
const user_controller = require("../../../controllers/userController");



// Create a new User
router.post('/create', user_controller.postCreateNewUser);
// Get List of Users
router.get('/list', user_controller.getCreateUserList);
// Get User by ID
router.get('/show/:id', user_controller.getUserById);



module.exports = router;
