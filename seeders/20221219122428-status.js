"use strict";
const statusModel = require("../models").Status;
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      statusModel.tableName,
      [
        {
          id: 1,
          name: "pending",
          description: "task pendding",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: "in-progress",
          description: " task in progress",
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          id: 3,
          name: "completed",
          description: "task completed",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(statusModel.tableName, null, {});
  },
};
