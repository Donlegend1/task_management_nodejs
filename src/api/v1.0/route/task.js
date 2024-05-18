const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../../../../config/passport')(passport);
const task_controller = require("../../../controllers/taskController");



// Create a new Leave Type
router.post('/create', task_controller.createTask);
// Get all Leave Types
router.get("/list", task_controller.getAllTask);
// // Get a single Leave Type
router.get("/show/:id", task_controller.getATask);
// // Edit a Leave Type
router.put("/edit/:id", task_controller.editTask);
// // Delete a Leave Type
router.delete("/delete/:id", task_controller.deleteTask);


module.exports = router;
