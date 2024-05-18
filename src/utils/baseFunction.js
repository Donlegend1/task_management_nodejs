var express = require('express');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../../config/config.js');
const { Op } = require("sequelize");
const nodemailer = require('nodemailer');
require("dotenv").config();
var pug = require('pug');
const Profile = require('../../models').Profile;
const Attachment = require('../../models').Attachment;
const jwt = require('jsonwebtoken');
const { log } = require('console');







//##################### THIS CONTAIN FUNCTIONS THAT CAN BE RE-USEABLE ###########
class BaseFunction {
    constructor() {

    }

    //######## success response
    responseSuccess(data = null, success = null, message = null, description = "Operation was successful.", statusCode = 200) {
        return (
            {
                "status": statusCode,
                "success": success,
                "message": message,
                "description": description,
                "data": data,
            }
        );
    }

    //######## error response
    responseError(data = null, success = null, message = null, description = "Operation not successful! An error occurred.", statusCode = 400) {
        return (
            {
                "status": statusCode,
                "success": success,
                "message": message,
                "description": description,
                "error": data,
            }
        );
    }

    rawQueryConnection() {
        // SEQUELIZE DB CONFIG
        var conn = this.currentConnection();
        const sequelize = new Sequelize(conn.database, conn.username, conn.password, {
            host: conn.host,
            dialect: conn.dialect,
        });

        return sequelize;
    }


    //Get the current Database connected to
    currentConnection() {
        // You can call it like:
        // var conn = baseFunction.currentConnection(); OR var conn = currentConnection();
        // console.log(conn.database);
        var mode = process.env.NODE_ENV;
        const activeConnection = {
            "database": config[mode].database,
            "username": config[mode].username,
            "password": config[mode].password,
            "host": config[mode].host,
            "dialect": config[mode].dialect
        }
        return activeConnection;
    }

    async sendMailToUserEmail(user, token) {
        let isNodemailerConnected = false;

        // Create an email transporter
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            service: process.env.MAIL_MAILER,
            secure: process.env.MAIL_ENCRYPTION,
            port: process.env.MAIL_PORT,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            },
        });

        // console.log("my transporter", transporter);
        transporter.verify(function (error, success) {
            if (error) {
                console.log("transporter", error);
            } else {
                // console.log('Server is ready to take our messages', success);
                isNodemailerConnected = true;
            }
        });

        // const templatePath = path.resolve(__dirname);
        const templatePath = path.join(__dirname, "../views/mail/forget_password.pug");

        const compiledFunction = pug.compileFile(templatePath);
        const name = `${user.first_name} ${user.last_name}`;
        // const resetLink = `${process.env.FRONTEND_APP_URL}:${process.env.FRONTEND_PORT}/reset-password/${token}`;
        const resetLink = process.env.RUNNING_PORT ? `${process.env.FRONTEND_APP_URL}:${process.env.FRONTEND_PORT}/reset-password/${token}` : `${process.env.FRONTEND_APP_URL}/reset-password/${token}`;

        const title = 'Reset Password';
        const year = new Date().getFullYear();

        // Render the HTML email content using the Pug template and the provided data
        const htmlContent = compiledFunction({ name, resetLink, title, token, year });


        // var sendMail = async (content, resetLink, next) => {
        var mailOptions = {
            from: process.env.MAIL_FROM_ADDRESS,
            to: user.email,
            subject: 'Password Reset Request',
            html: htmlContent,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    };


    //Get upload path
    uploadPath(param = null) {
        let getUploadPath = null;
        try {
            if (!isNaN(param) && (param)) {
                getUploadPath = require('path').resolve("src/public/", process.env.UPLOAD_PATH + "/" + param + "/") + "/";
                //getUploadPath = require('path').join(__dirname, "src/public/" + process.env.UPLOAD_PATH) + "/" + userId + "/";
                return getUploadPath; //return this.responseSuccess(getUploadPath, true, "Get file upload path.", "This returns document upload path", 200);
            } else {
                getUploadPath = require('path').resolve("src/public/", process.env.UPLOAD_PATH + "/" + "/") + "/";
                return getUploadPath; //return this.responseSuccess(getUploadPath, true, "Get file upload path.", "This returns document upload path", 200);
            }
        } catch (error) {
            return error.message; //return this.responseError(error.message, false, "file path doesn't exit", "Unable to get path", 400);
        }
    }

    passportAndSignatureUploadPath(type = null, req = null) {
        let id
        if (req) {
            id = this.getAuthenticatedUser(req);
            // console.log("wrong id", id);
        }
        try {
            let getUploadPath = null;

            if (type === "passport_url") {
                getUploadPath = require('path').resolve("src/public/", process.env.UPLOAD_PATH + "/" + "/") + "/" + "passports/";
                return this.responseSuccess(getUploadPath, true, "Get file upload path.", "This returns document granduad passport upload path", 200);
            } else if (type === "specimen_signature") {
                getUploadPath = require('path').resolve("src/public/", process.env.UPLOAD_PATH + "/" + "/") + "/" + "signatures/";
                return this.responseSuccess(getUploadPath, true, "Get file upload path.", "This returns document granduad signature upload path", 200);
            } else if (type === "signature") { // for registrar signature
                getUploadPath = require('path').resolve("src/public/", process.env.UPLOAD_PATH + "/" + "/") + "/" + "chiefjudge/";
                return this.responseSuccess(getUploadPath, true, "Get file upload path.", "This returns Chief Judge signature upload path", 200);
            }
            else if (type === "document_url") {// for granduad attache document for editing their profile
                getUploadPath = require('path').resolve("src/public/", process.env.UPLOAD_PATH + "/" + "/") + "/" + "document_attachements/" + id + "/";
                return this.responseSuccess(getUploadPath, true, "Get file upload path.", "This returns registrar signature upload path", 200);
            }

            else if (type === "response_attachement") {// state response attachement
                getUploadPath = require('path').resolve("src/public/", process.env.UPLOAD_PATH + "/" + "/") + "/" + "response_attachement/" + id + "/";
                return this.responseSuccess(getUploadPath, true, "Get file upload path.", "This returns registrar signature upload path", 200);
            }

            else if (type === "oath_evidence") {// state response attachement
                getUploadPath = require('path').resolve("src/public/", process.env.UPLOAD_PATH + "/" + "/") + "/" + "oath_evidence/" + "/";
                return this.responseSuccess(getUploadPath, true, "Get file upload path.", "This returns oath evidence upload path", 200);
            }

            else {
                return this.responseError("Invalid file type.", false, "Invalid file type specified.", "Unable to get path", 400);
            }
        } catch (error) {
            return error.message; //return this.responseError(error.message, false, "file path doesn't exit", "Unable to get path", 400);
        }
    }


    //Get download path
    downloadPath(directory = null) {
        let getDownloadPath = null;
        var conn = this.currentConnection();
        try {
            if (!isNaN(directory) && (directory)) {
                getDownloadPath = conn.host + ":" + process.env.PORT + "/src/public/" + directory + "/" + process.env.UPLOAD_PATH + "/";
            } else {
                getDownloadPath = conn.host + ":" + process.env.PORT + "/src/public/" + process.env.UPLOAD_PATH + "/";
            }
            return getDownloadPath; //this.responseSuccess(getDownloadPath, true, "Document download path", "This returns document download path.", 200);
        } catch (error) {
            return error.message; //this.responseError(error.message, false, "Path doesn't exit", "Unable to get path", 400);
        }
    }

    decodeFileBase64(base64String, filePath) {

        // Remove the data URL prefix (e.g., 'data:image/png;base64,')
        const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");

        // Create a buffer from the base64 data
        const imageBuffer = Buffer.from(base64Data, "base64");

        // Create the directory if it doesn't exist
        const directory = path.dirname(filePath);
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        };

        // Write the buffer to the file
        fs.writeFile(filePath, imageBuffer, (error) => {
            if (error) {
                console.error("Error saving image:", error);
            } else {
                console.log("Image saved successfully.");
            }
        });

        return imageBuffer;
    };


    //Get File Number
    async generateNewFileNumber() {
        try {
            let totalRecord = await Profile.count({ where: { enrollment_number: { [Op.ne]: '' } } });
            console.log('Total records:', totalRecord);

            totalRecord++; // Increment the totalRecord by 1

            const companyShortName = process.env.COMPANY_STAFF_NO_FORMAT;
            let fileNo = '';

            if (totalRecord > 999) {
                fileNo = companyShortName + '0' + totalRecord;
            } else if (totalRecord > 99) {
                fileNo = companyShortName + '00' + totalRecord;
            } else if (totalRecord > 9) {
                fileNo = companyShortName + '000' + totalRecord;
            } else {
                fileNo = companyShortName + '0000' + totalRecord;
            }

            return fileNo;
        } catch (error) {
            console.error('Error:', error);
            return null; // Return null in case of an error
        }
    };


    getAuthenticatedUser(req, res) {

        try {
            const token = req.headers.authorization.split(' ')[1]; // Assuming the token is sent in the "Authorization" header
            const decodedToken = jwt.verify(token, process.env.LOGIN_SECRET_TOKEN_VALUE);
            const userId = decodedToken.id; // Access the user ID from the token payload
            return userId;
        } catch (error) {
            // Handle token verification failure or invalid token
            console.error('JWT verification error:', error);
            throw new Error('Invalid token');
        }
    };


    async sendConfirmationMailToUserEmail(user = null, type = null, token = null, remark = null) {

        try {
            let isNodemailerConnected = false;

            // Create an email transporter
            const transporter = nodemailer.createTransport({
                host: process.env.MAIL_HOST,
                service: process.env.MAIL_MAILER,
                secure: process.env.MAIL_ENCRYPTION,
                port: process.env.MAIL_PORT,
                auth: {
                    user: process.env.MAIL_USERNAME,
                    pass: process.env.MAIL_PASSWORD
                },
            });

            transporter.verify(function (error, success) {
                if (error) {
                    console.log("transporter", error);
                } else {
                    isNodemailerConnected = true;
                }
            });

            let templatePath;
            let title;
            let name = `${user.surname} ${user.first_name} ${user.middle_name}`;
            let email = `${user.email}`;
            let year = new Date().getFullYear();
            let link;

            if (type === "signup_token") {
                templatePath = path.join(__dirname, "../views/mail/signup.pug");
                title = 'Signup Confirmation';
                // link = `${process.env.APP_URL}:${process.env.FRONTEND_PORT}/create-password/${token}` decline_profile
                link = process.env.RUNNING_PORT ? `${process.env.FRONTEND_APP_URL}:${process.env.FRONTEND_PORT}/create-password/${token}` : `${process.env.FRONTEND_APP_URL}/create-password/${token}`;
            } else if (type === "reject") {
                templatePath = path.join(__dirname, "../views/mail/reject.pug");
            }
            else if (type === "decline_profile") {
                templatePath = path.join(__dirname, "../views/mail/decline_profile.pug");
                name = `${user.surname} ${user.first_name} ${user.middle_name}`;
                email = `${user.email}`;
                title = 'Application Declined';
                link = process.env.RUNNING_PORT ? `${process.env.FRONTEND_APP_URL}:${process.env.FRONTEND_PORT}/login` : `${process.env.FRONTEND_APP_URL}/login`;
            }
            else {
                templatePath = path.join(__dirname, "../views/mail/confirmation.pug");
            }

            const compiledFunction = pug.compileFile(templatePath);

            var conn = this.currentConnection();

            const imageSrcURL = process.env.APP_URL;

            // Render the HTML email content using the Pug template and the provided data
            const htmlContent = compiledFunction({ name, title, year, imageSrcURL, email, link, remark });


            let mailOptions;

            if (type === "signup_token") {
                mailOptions = {
                    from: process.env.MAIL_FROM_ADDRESS,
                    to: user.email,
                    subject: 'SCN NOTARY PUBLIC',
                    html: htmlContent,
                };
            } else if (type === "decline_profile") {
                mailOptions = {
                    from: process.env.MAIL_FROM_ADDRESS,
                    to: user.email,
                    subject: 'SCN NOTARY PUBLIC',
                    html: htmlContent,
                };
            }
            else {
                mailOptions = {
                    from: process.env.MAIL_FROM_ADDRESS,
                    to: user.email,
                    subject: 'SCN NOTARY PUBLIC',
                    html: htmlContent,
                };
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });

        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send email.');
        }
    };

    async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.SIGNUP_SECRET_TOKEN_VALUE);
            return decoded;
        } catch (err) {
            if (err instanceof jwt.JsonWebTokenError) {
                if (err.name === 'TokenExpiredError') {
                    // Token has expired
                    console.log('Token has expired:', err.message);
                } else {
                    // Other JWT errors
                    console.log('Invalid token:', err.message);
                }
            } else {
                // Other errors
                console.log('Error verifying token:', err.message);
            }
            return null;
        }
    };


    async isDocNameUnique(profileId, docName) {
        try {
            console.log("A22", docName);

            const existingDocument = await Attachment.findOne({ where: { profile_id: profileId, doc_name: docName, }, });

            return !existingDocument;

        } catch (err) {
            console.log('Error in attachment:', err.message);
        }
    };


}


module.exports = BaseFunction;
