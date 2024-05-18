const express = require('express');
const passport = require('passport');
require('../../config/passport')(passport);
const Helper = require('../utils/helper');
const helper = new Helper();
// Compile the source code



// Display welcome note
exports.index = (req, res) => {
    res.render('index', {
        title: 'Welcome to SCN Common Digital-Diary-Admin Backend API',
        copyright: `Designed by MBR Computer Consultants | Copyright © ${new Date().getFullYear()} . All rights reserved.`
    });
    // res.status(200).render("index");
};
