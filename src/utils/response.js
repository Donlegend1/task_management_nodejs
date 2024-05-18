var express = require('express');

class Response {
    constructor() {}

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
}

module.exports = Response;
