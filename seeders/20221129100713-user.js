"use strict";
const userModel = require("../models").User;
const profileModel = require("../models").Profile;
const bcrypt = require("bcryptjs");
var { faker } = require("@faker-js/faker");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      let usersData = [];
      for (var i = 1; i <= 2; i++) {
        let fullname = faker.name.firstName();

        let hashPassword = bcrypt.hashSync(
          process.env.STAFF_DEFAULT_PASSWORD,
          bcrypt.genSaltSync(10),
          null
        );

        let newUsers = {
          email:
            i == 1
              ? "testgmail.com"
              : faker.internet.email(fullname).toLowerCase(),
          password: hashPassword, //faker.internet.password(),
          fullname: "John",

          status: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        usersData.push(newUsers);
      }
      await queryInterface.bulkInsert(userModel.tableName, usersData);
    } catch (error) {
      console.log(error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(userModel.tableName, null, {});
  },
};
