const express = require('express');
const User = require('../../models').User;

const passport = require('passport');
require('../../config/passport')(passport);
const Helper = require('../utils/helper');
const helper = new Helper();
const Response = require('../utils/response');
const response = new Response();
const BaseFunction = require('../utils/baseFunction');
const baseFunction = new BaseFunction();

const jwt = require('jsonwebtoken');
const { profile } = require('console');




//POST: Create New User
exports.postCreateNewUser = async (req, res) => {
    if (!req.body.fullname || !req.body.email) {
        var message = 'Please enter your fullname and email.';
        res.status(400).send(response.responseError([], false, "Unable to create user!", message, 400))
    } else {
        //Create User
        var currentUser = await User.findOne({
            where: {
                email: req.body.email
            },
        });

        if (currentUser) {
            res.status(400).send(response.responseError([], false, "Email already taken by another user.", "Email already exist.", 400));
        } else {
            User.create({
                email: req.body.email,
                password: process.env.STAFF_DEFAULT_PASSWORD,
                fullname: req.body.fullname,
            }).then((new_user) => {
                res.status(200).send(response.responseSuccess(new_user, true, "New user was created successfully.", "New user were create successfully.", 200));
            }).catch((error) => {
                console.log(error.message);
                res.status(400).send(response.responseError(error.message, false, "Sorry! create user unsuccessfully!", "Sorry! create user unsuccessfully!", 400));
            });
        }
    }
};


//GET: Create list of user
exports.getCreateUserList = async (req, res) => {
    User.findAll({
        order: [['createdAt', 'DESC']],
      
    }).then((users) => {
        res.status(200).send(response.responseSuccess(users, true, "User retrieve successfully!", 200));
    }).catch((error) => {
        console.log(error.message);
        res.status(400).send(response.responseError(error.message, false, "Sorry! user retrieve unsuccessfully!", "Sorry! user retrieve unsuccessfully!", 400));
    });
};


// Get User by ID
exports.getUserById = (req, res) => {
    const userId = req.params.id;
    User.findByPk(userId, {
        attributes: ['id', 'email', 'fullname'],
    }).then((user) => {
        console.log(user);
        res.status(200).send(response.responseSuccess(user, true, "User retrieve successfully!", 200))
    }).catch((error) => {
        res.status(400).send(response.responseError(error.message, false, "Sorry! user retrieve unsuccessfully!", "Sorry! user retrieve unsuccessfully!", 400));
    });

}


// POST: sign up user and save to temp table



exports.userCreateLoginPassword = async (req, res) => {
    try {

        if (!req.body.token || !req.body.password || !req.body.confirm_password) {
            return res.status(400).send(response.responseError([], false, "Please enter your email, password and confirm password!", "Please enter your, email, password and confirm password!", 400));
        } else {
            let { token, password, confirm_password } = req.body;

            password = password.trim();
            confirm_password = confirm_password.trim();

            // verify the token
            const decodeToken = await baseFunction.verifyToken(token);

            // get the temp user data
            const userExitInTemp = await TempUser.findOne({ where: { email: decodeToken.email } });

            // check if the temp user exists
            if (!userExitInTemp) {
                return res.status(404).send(response.responseError([], false, "User not found", "User not found", 404));
            }

            // check if the token from the body is equal to the one in temp user table
            if (token !== userExitInTemp.url_token) {
                return res.status(400).send(response.responseError([], false, "Token is invalid!", "Token is invalid!", 400));
            }

            // check if the password and confirm password match
            if (password !== confirm_password) {
                return res.status(400).send(response.responseError([], false, "The confirm password does not match with the password!", "The confirm password does not match with the password!", 400));
            }

            // create user
            const createUser = await User.create({
                email: userExitInTemp.email,
                password: password,
                surname: userExitInTemp.surname,
                first_name: userExitInTemp.first_name,
                middle_name: userExitInTemp.middle_name,
                role_id: 2,
                status: 1
            })

            // create profile
            const createUserProfile = await Profile.create({
                user_id: createUser.id,
                email: userExitInTemp.email,
                surname: userExitInTemp.surname,
                first_name: userExitInTemp.first_name,
                middle_name: userExitInTemp.middle_name,
                phone: userExitInTemp.phone,
                status_id: 0
            });

            // delete the user data from temp user table
            await TempUser.destroy({ where: { id: userExitInTemp.id } });

            // return the user from the user table
            return res.status(201).send(response.responseSuccess(createUser, true, "Password saved successfully!", "Password saved successfully!", 201));
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
};
