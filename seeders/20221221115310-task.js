"use strict";
const TaskModel = require("../models").Task;
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      TaskModel.tableName,
      [
        {
          title: "Washing",
          description: "Wash my clothes",
          priority: 1,
          dueDate: new Date(),
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          title: "Cooking",
          description: "Cooking of food",
          priority: 1,
          dueDate: new Date(),
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          title: "Visiting my mum",
          description: "Visiting my mom every 3 weeks",
          priority: 1,
          dueDate: new Date(),
          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(TaskModel.tableName, null, {});
  },
};
