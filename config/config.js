
const Sequelize = require('sequelize');
// require('dotenv').config({path: '../../.env'});
require('dotenv').config();

module.exports = {
    "development": {
        "username": process.env.DEV_USERNAME,
        "password": process.env.DEV_PASSWORD,
        "database": process.env.DEV_DATABASE,
        "host": process.env.DEV_HOST,
        "dialect": process.env.DEV_DIALECT,
        "protocol": process.env.PROTOCOL,
        "ssl": process.env.SSL,
        "keepDefaultTimezone": process.env.KEEPDEFAULTTIMEZONE,
        "logging": (process.env.DEV_LOGGING == "1" ? true : false)
    },
    "test": {
        "username": "root",
        "password": null,
        "database": "database_test",
        "host": "127.0.0.1",
        "dialect": "mysql"
    },
    "production": {
        "username": "root",
        "password": null,
        "database": "database_production",
        "host": "127.0.0.1",
        "dialect": "mysql"
    }
};
