var express = require('express');
var router = express.Router();
const cors = require('cors');
const passport = require('passport');
require('../../../config/passport')(passport);// Require controller modules.

const index_controller = require("../../controllers/indexController");





if (process.env.NODE_ENV == "test") { //for UNIT TESTING

} else {
    router.get('/', index_controller.index);
}

module.exports = router;
