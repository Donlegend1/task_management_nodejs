var createError = require('http-errors'); //Error handler
var express = require('express'); //Framwork
version = require('express-version');
var app = express(); //init framework
const path = require('path'); // provides a way of working with directories and file paths
var cookieParser = require('cookie-parser'); //request body
var logger = require('morgan'); //logger
var bodyParser = require('body-parser'); // pass body reques
const session = require('express-session'); //session for login
const passport = require('passport'); //login
const jwt = require('jsonwebtoken'); //login
require('./config/passport')(passport); //login config
const fileUpload = require("express-fileupload"); //file upload
var helmet = require('helmet'); //securing HTTP headers
const cors = require('cors'); //helps you access numerous functionalities on the browser | Cross-Origin Resource Sharing (CORS)
require('dotenv').config(); //handling environment variables
const swaggerUi = require('swagger-ui-express'); //API documentation
const swaggerDocument = require('./swagger.json'); //swagger set up
const pug = require('pug');
const { log } = require('console');
//======================ENDS IMPORT=================================






//passport initialization
app.use(session({
    secret: process.env.LOGIN_SECRET_TOKEN_VALUE,
    saveUninitialized: false,
    resave: false,
    cookie: { secure: true, maxAge: parseInt(process.env.LOGIN_SESSION_TIME) }
}));
app.use(passport.initialize());
app.use(passport.session());
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'src/public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());
app.use(cors());
app.use(fileUpload({
    createParentPath: true,
    useTempFiles: true,   // Use temp files instead of memory for managing the upload process. Note: available for versions 1.0.0 and newer.
    tempFileDir: '/tmp/',
    limits: {
        fileSize: 1024 * 1024 * 5 // 5 MB
    },
    abortOnLimit: true
}));

var options = {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
        persistAuthorization: true,
        validatorUrl: null,
    }
};

swaggerDocument.host = process.env.RUNNING_PORT ? `${process.env.SWAGGER_URL}:${process.env.PORT}/` : `${process.env.SWAGGER_URL}/`;

swaggerDocument.basePath = process.env.APP_VERSION;

//Routes
app.use(express.static('src/public/' + process.env.UPLOAD_PATH));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options)); //Swagger - Application Documentation

app.use('/api', require('./src/api')); //Application Route


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.send(err);
});

console.log("Running on " + process.env.NODE_ENV + " mode...");
console.log("Listening to requests on : http://" + process.env.DEV_HOST + ":" + process.env.PORT);
console.log("Checkout the API Documentation (Swagger) here: http://" + process.env.DEV_HOST + ":" + process.env.PORT + "/api-docs/");
console.log("----------------------------------------------------------------");


module.exports = app;
