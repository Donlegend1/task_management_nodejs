const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../../../../config/passport')(passport);
const status_controller = require("../../../controllers/statusController");


// Create a new  Title
router.post('/create', status_controller.createNewStatus);

// Get List of Title
router.get('/list', status_controller.getStatusList);

// Get Title by ID
router.get('/show/:status_id', status_controller.getStatusById);

// Update a Title
router.put('/edit/:status_id', status_controller.editStatusById);

// delete a Title
router.delete('/delete/:status_id', status_controller.deleteStatusById);



module.exports = router;
