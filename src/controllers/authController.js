const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('../../config/passport')(passport);
const User = require('../../models').User;

const Response = require('../utils/response');
const response = new Response();
require("dotenv").config();

const BaseFunction = require('../utils/baseFunction');
const baseFunction = new BaseFunction();




//Register - As Admin, new user
exports.register = (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.status(400).send({
            message: 'Please enter your email address, and password.'
        })
    } else {
        try {
          User.create({
                email: req.body.email,
                password: req.body.password,
                fullname: req.body.fullname,
            }).then((user) => {
                res.status(200).send(response.responseSuccess(user, true, "New user was created successfully.", "New user and user's profile were create successfully.", 200));
            }).catch((error) => {
                res.status(400).send(response.responseError(error.message, false, "Sorry! user retrieve unsuccessfully!", "Sorry! user retrieve unsuccessfully!", 400));
            });
        
     } catch (error) {
            res.status(400).send(response.responseError(error.message, false, "Sorry! no user role found", "User role does not exist", 400))
        
     }
           
      }
};


//Login as a user
exports.login = async (req, res) => {
    var currentUser = await User.findOne({
        where: { email: req.body.email },
        // attributes: ['id', 'email', 'fullname', 'last_login', 'suspend', 'role_id', 'user_type', 'password']
    });
    if (!currentUser) {
        res.status(401).send(response.responseError([], false, "Authentication failed. Staff not found.", "Authentication failed. Staff not found."));
    } else {
        currentUser.comparePassword(req.body.password, (err, isMatch) => {
            const maxAge = 1;
            if (isMatch && !err) {
                var token = jwt.sign(JSON.parse(JSON.stringify(currentUser)), process.env.LOGIN_SECRET_TOKEN_VALUE, {
                    expiresIn: process.env.LOGIN_SESSION_TIME //parseInt(process.env.LOGIN_SESSION_TIME)
                });
                res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
                jwt.verify(token, process.env.LOGIN_SECRET_TOKEN_VALUE, function (err, data) {
                    console.log(err);
                });
                var data = {
                    'token': 'JWT ' + token,
                    'user': currentUser
                }
                //Update Last Login and Currect Login
                res.status(201).send(response.responseSuccess(data, true, "Login was successfully.", "Staff login was successfully."));
            } else {
                res.status(401).send(response.responseError([], false, "Authentication failed. Wrong password", "Authentication failed. Unable to login due to wrong password."));
            }
        })
    }

};


exports.logout = async (req, res) => {

    try {
        req.logOut(function (err) {
            res.cookie("jwt", "", { expiresIn: "1" })
            if (err) {
                res.status(400).send(response.responseError([err.message], false, 'Unable to logout!'));
            }
            res.status(200).send(response.responseSuccess([], true, 'You have logged out successfully.'));
        });
    } catch (error) {
        res.status(400).send(response.responseError([], false, 'Your token has expired already.', null, 400));
    }
};


// forget password
exports.forgetPassword = async (req, res) => {
    try {
        if (!req.body.email) {
            return res.status(400).send(response.responseError([], false, "Please enter your registered email to reset your password!", "Please enter your registered email to reset your password!", 400));
        } else {
            const { email } = req.body;
            // validate the staff email
            const user = await User.findOne({ where: { email: email } });
            if (!user) {
                return res.status(400).send(response.responseError(null, false, "User email does not exist", "The user email provided is invalid", 400));
            }
            // Generate a random token
            const token = jwt.sign(JSON.parse(JSON.stringify(user)), process.env.FORGET_PASSWORD_SECRET_TOKEN_VALUE, {
                expiresIn: process.env.FORGET_PASSWORD_SESSION_TIME
            });
            jwt.verify(token, process.env.FORGET_PASSWORD_SECRET_TOKEN_VALUE, function (err, data) {
                console.log(err, data);
            });

            var data = {
                'token': token,
                'user': user
            }

            // Store the token in the database
            await User.update({ confirm_token: data.token }, {
                where: { email: email }
            }).then(async () => {
                await User.findOne({ where: { email: email } })
                    .then(async (user_) => {
                        console.log(user_);
                        await baseFunction.sendMailToStaffEmail(user_, token);
                        // Return a success response
                        res.status(201).send(response.responseSuccess(user_, true, "Password reset link has been sent to your registered email address!", "Password reset link has been sent to your registered email address!", 201))
                    }).catch((error) => {
                        console.log(error.message);
                        res.status(400).send(response.responseError(error.message, false, "Unable to retreive data!", null, 400));
                    });
            })
        }

    } catch (err) {
        console.error(err);
        return res.status(500).send(response.responseError(err.message, false, "Internal server error", "Internal server error", 500));

    }

}


// reset password endpoint
exports.resetPassword = async (req, res) => {
    try {

        if (!req.body.token || !req.body.password || !req.body.confirm_password || !req.body.email) {
            return res.status(400).send(response.responseError([], false, "Please enter your email, password and confirm password!", "Please enter your email, password and confirm password!", 400));
        } else {
            const { token, password, confirm_password, email } = req.body;

            // verify the token
            const decodedToken = jwt.verify(token, process.env.FORGET_PASSWORD_SECRET_TOKEN_VALUE);
            // console.log("my token verified", decodedToken);

            if (email !== decodedToken.email) {
                return res.status(400).send(response.responseError([], false, "The email address inputed is wrong!", "The email address inputed is wrong!", 400));
            }

            if (password !== confirm_password) {
                return res.status(400).send(response.responseError([], false, "The confirm password not match with password!", "The confirm password not match with password!", 400));
            }

            const user = await User.findByPk(decodedToken.id);
            if (!user) {
                return res.status(404).send(response.responseError([], false, "User not found", "User not found", 404));
            }

            if (user.confirm_token == null) {
                return res.status(400).send(response.responseError([], false, "The token has been used!", "The token has been used!", 400));
            }
            if (user.confirm_token !== token) {
                return res.status(400).send(response.responseError([], false, "The reset password token is invalid!", "The reset password token is invalid!", 400));
            }

            // // update the user's password
            // const hashedPassword = await bcrypt.hash(password, 10);
            await user.update({ password: password, confirm_token: null });

            return res.status(201).send(response.responseSuccess(user, true, "Password reset successfully!", "Password reset successfully!", 201))

        }

    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(400).send(response.responseError(err.message, false, "The reset password token is not invalid", "The reset password token is not invalid", 400));
        } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(400).send(response.responseError(err.message, false, "The reset password token has expired", "The reset password token has expired", 400));
        }
        console.error(err);
        return res.status(500).send(response.responseError(err.message, false, "Internal server error", "Internal server error", 500));

    }
}
