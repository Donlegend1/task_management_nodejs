const express = require("express");
const Task = require("../../models").Task;
const Response = require("../utils/response");
const response = new Response();
const moment = require("moment");

//create task
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    // Check for required fields
    if (!title || !description) {
      const message = "Please enter title and description.";
      return res
        .status(400)
        .send(
          response.responseError(
            [],
            false,
            "Unable to create Task!",
            message,
            400
          )
        );
    }

    // Validate priority is an integer
    if (!Number.isInteger(priority)) {
      const message = "Priority must be an integer.";
      return res
        .status(400)
        .send(
          response.responseError([], false, "Invalid input!", message, 400)
        );
    }

    // Validate dueDate is a valid date
    if (!moment(dueDate, moment.ISO_8601, true).isValid()) {
      const message = "Due date must be a valid date.";
      return res
        .status(400)
        .send(
          response.responseError([], false, "Invalid input!", message, 400)
        );
    }

    // Check if task already exists
    const count = await Task.count({
      where: { title, dueDate },
    });

    if (count < 1) {
      const task = await Task.create({
        title,
        priority,
        dueDate,
        description,
      });

      return res
        .status(201)
        .send(
          response.responseSuccess(
            task,
            true,
            "Task Created Successfully",
            "Task Created Successfully",
            201
          )
        );
    } else {
      const message = "The task name already exists.";
      return res
        .status(400)
        .send(
          response.responseError([], false, "Task already exists", message, 400)
        );
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send(
        response.responseError(
          error.message,
          false,
          "Unable to create Task",
          null,
          500
        )
      );
  }
};

// Route handler for getting all task
exports.getAllTask = async (req, res) => {
  try {
    // Fetch all Task from the database
    const Tasks = await Task.findAll();
    res
      .status(200)
      .send(
        response.responseSuccess(
          Tasks,
          true,
          "Task information was retrieved.",
          "task retrieved successfully",
          200
        )
      );
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res
      .status(400)
      .send(
        response.responseError(
          error.message,
          false,
          "Unable to retrieve task",
          null,
          400
        )
      );
  }
};

// get a all task
exports.getATask = async (req, res) => {
  const file_type = await Task.findByPk(req.params.TaskId);
  if (file_type == null) {
    res
      .status(400)
      .send(
        response.responseError(
          [],
          false,
          "File type not exist",
          "The file type does not exist",
          400
        )
      );
  } else {
    res
      .status(201)
      .send(
        response.responseSuccess(
          file_type,
          true,
          "File type information was retrieved.",
          "File type retrieved",
          201
        )
      );
  }
};


//edit task
exports.editTask = async (req, res) => {
  try {
    // Get the task by its id
    const taskData = await Task.findByPk(req.params.TaskId);

    // Check if the task exists
    if (!taskData) {
      return res
        .status(404)
        .send(
          response.responseError(
            [],
            false,
            "Task not found",
            "The task does not exist",
            404
          )
        );
    }

    const { name, description, priority, dueDate, status } = req.body;

    // Check for required fields
    if (!name || !description) {
      const message = "Please enter name and description.";
      return res
        .status(400)
        .send(
          response.responseError(
            [],
            false,
            "Unable to update task!",
            message,
            400
          )
        );
    }

    // Validate priority is an integer if provided
    if (priority !== undefined && !Number.isInteger(priority)) {
      const message = "Priority must be an integer.";
      return res
        .status(400)
        .send(
          response.responseError([], false, "Invalid input!", message, 400)
        );
    }

    // Validate dueDate is a valid date if provided
    if (
      dueDate !== undefined &&
      !moment(dueDate, moment.ISO_8601, true).isValid()
    ) {
      const message = "Due date must be a valid date.";
      return res
        .status(400)
        .send(
          response.responseError([], false, "Invalid input!", message, 400)
        );
    }

    // Update the task
    await Task.update(
      {
        name,
        description,
        priority,
        dueDate,
        status,
      },
      {
        where: { id: req.params.TaskId },
      }
    );

    const updatedTask = await Task.findOne({
      where: { id: req.params.TaskId },
    });

    return res
      .status(200)
      .send(
        response.responseSuccess(
          updatedTask,
          true,
          "Task information was updated.",
          "Task updated successfully",
          200
        )
      );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send(
        response.responseError(
          error.message,
          false,
          "Unable to update task",
          null,
          500
        )
      );
  }
};

//edit task
exports.deleteTask = async (req, res) => {
  const file_type = await Task.findByPk(req.params.TaskId);
  if (file_type == null) {
    res
      .status(400)
      .send(
        response.responseError(
          [],
          false,
          "File type not exist",
          "The file type not exist",
          400
        )
      );
  } else {
    Task.destroy({
      where: {
        id: req.params.TaskId,
      },
    })
      .then(() => {
        res
          .status(201)
          .send(
            response.responseSuccess(
              null,
              true,
              "File type was deleted.",
              "File type was deleted successfully",
              201
            )
          );
      })
      .catch((error) => {
        res
          .status(400)
          .send(
            response.responseError(
              error.message,
              false,
              "Unable to deleted file type",
              null,
              400
            )
          );
      });
  }
};
