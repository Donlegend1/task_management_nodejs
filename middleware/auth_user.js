const express = require('express');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.LOGIN_SECRET_TOKEN_VALUE);
        const userId = decodedToken.id;
        if (req.body.userId && (req.body.userId !== userId)) {
            throw 'Invalid user ID';
        } else {
            next();
        }
    } catch (err) {
        res.status(401).send({
            error: "It seems your login session has expired - " + err.message
        });
    }
};
