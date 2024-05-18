var express = require('express');
var router = express.Router();
const cors = require('cors');
const passport = require('passport');
require('../../../config/passport')(passport);// Require controller modules.

const index_controller          = require("../../controllers/indexController");
const auth                      = require("../../../middleware/auth_user");

const usersRouter               = require('./route/users');
const authRouter                = require('./route/auth');

const statusRoute               = require('./route/status');

const taskRoute               = require('./route/task');





if (process.env.NODE_ENV == "test") { //for UNIT TESTING

} else {
    router.get('/',                 index_controller.index);
    router.use('/auth',             cors(), authRouter);
    // router.use('/user', usersRouter);
    router.use('/user',             cors(), usersRouter);
    
    router.use('/status',           cors(), statusRoute);

    //File Type or Document Type
    router.use(
      "/task",
      cors(),
      auth,
      passport.authenticate("jwt", { session: false }),
      taskRoute
    );
  

}

module.exports = router;
