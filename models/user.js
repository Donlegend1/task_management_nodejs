'use strict';
const { Model } = require('sequelize');
//const Profile = require('./profile');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {

        // define association here
        static associate(models) {

            // User.belongsTo(models.Role, {
            //     foreignKey: 'role_id',

            // });
        }
    }

    User.init({
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING
        },
        fullname: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: { type: DataTypes.INTEGER },
    },
        {
            sequelize,
            modelName: 'User',
        });

    const bcrypt = require("bcryptjs");

    User.beforeSave(async (user, options) => {
        if (user.password) {
            user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
        }
    });
    User.prototype.comparePassword = function (passw, cb) {
        bcrypt.compare(passw, this.password, function (err, isMatch) {
            if (err) {
                return cb(err);
            }
            cb(null, isMatch);
        });
    };

    // add a hook that will be triggered after a successful login
    // User.afterLogin((user, options) => {
    //     return user.update({ last_login: new Date().toUTCString() });
    // });

    return User;
};
