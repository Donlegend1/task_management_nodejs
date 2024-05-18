const express = require('express');
const Status = require('../../models').Status;
const Response = require('../utils/response');
const response = new Response();

//############### DEPARTMENT DOCUMENTATION CONTROLLERS

// Storing title for Documentation
exports.createNewStatus = async (req, res) => {

    if (!req.body.name) {
        var message = 'Please enter status, name.';
        res.status(400).send(response.responseError([], false, "Unable to create status !", message, 400))
    } else {

        Status.count({ where: { name: req.body.name } })
            .then(count => {
                if (count < 1) {
                    Status.create({
                        name: req.body.name
                    }).then((status) => {
                        res.status(201).send(response.responseSuccess(status, true, "status information was recorded.", "status created successfull", 201))
                    }).catch((error) => {
                        console.log(error.message);
                        res.status(400).send(response.responseError(error.message, false, "Unable to create status", null, 400));
                    });
                } else {
                    res.status(400).send(response.responseError([], false, "Record is already exist", "the status has already been created", 400));
                    // res.send("not working")
                } // end else for Title.count
            });

    } // end else

} // end createNewTitle method



// Get All title Information
exports.getStatusList = async (req, res) => {

    Status.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        order: [['createdAt', 'DESC']],
    }).then((status) => {
        res.status(201).send(response.responseSuccess(status, true, "status's information was retrieved.", "status was retrieved successfull", 201))
    }).catch((error) => {
        console.log(error.message);
        res.status(400).send(response.responseError(error.message, false, "Unable to retrieve status", null, 400));
    })

} // end getTitleList method



// Get a single title
exports.getStatusById = async (req, res) => {
    Status.count({ where: { id: req.params.status_id } })
        .then(count => {
            if (count != 0) {
                Status.findByPk(req.params.status_id,
                    {
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        order: [['createdAt', 'DESC']],
                    }
                ).then((status) => {
                    res.status(201).send(response.responseSuccess(status, true, "status information was retrieved.", "status was retrieved successfull", 201))
                }).catch((error) => {
                    console.log(error.message);
                    res.status(400).send(response.responseError(error.message, false, "Unable to retrieve status", null, 400));
                })
            } else {
                res.status(404).send(response.responseError([], false, "status id did not exist", "the status id did not exist", 404));
            }
        });

} // end getTitleById method


// Edit title Information by id
exports.editStatusById = async (req, res) => {

    Status.count({ where: { id: req.params.status_id } }).then((count) => {
        if (count > 0) {
            if (!req.body.name) {
                res.status(400).send(response.responseError(null, false, "Could not update status", "Provide status name", 400))
            } else {
                Status.update(req.body, {
                    where: {
                        id: req.params.status_id
                    }
                }).then(() => {
                    Status.findOne({
                        where: {
                            id: req.params.status_id
                        },
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        order: [['createdAt', 'DESC']]
                    }).then((status) => {
                        res.status(200).send(response.responseSuccess(status, true, "status information was updated.", "status was updated successfull", 200))
                    }).catch((error) => {
                        console.log(error.message);
                        res.status(400).send(response.responseError(error.message, false, "Unable to retrieve the status after updating", null, 400));
                    })
                }).catch((error) => {
                    console.log(error.message);
                    res.status(400).send(response.responseError(error.message, false, "Unable to edit status", null, 400));
                })
            }
        } else {
            res.status(404).send(response.responseError([], false, "status id did not exist", "the status id did not exist", 404));
        } // end else
    }) // end Title.count() method


} // end editTitleById method


// Delete title using the title id
exports.deleteStatusById = async (req, res) => {
    Status.count({ where: { id: req.params.status_id } })
        .then(count => {
            if (count >= 1) {
                Status.destroy({
                    where: {
                        id: req.params.status_id
                    }
                })
                    .then(() => {
                        res.status(201).send(response.responseSuccess(null, true, "status information was deleted.", "status was deleted successfull", 201))
                    }).catch((error) => {
                        console.log(error.message);
                        res.status(400).send(response.responseError(error.message, false, "Unable to delete status", null, 400));
                    })
            } else {
                res.status(404).send(response.responseError([], false, "status id did not exist", "the status id did not exist", 404));
            } // end if
        });
} // end deleteTitleById method




