"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("vehicles", "status", {
      type: Sequelize.ENUM("ACTIVE", "INACTIVE", "UNDER_MAINTENANCE"),
      defaultValue: "ACTIVE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("vehicles", "status", {
      type: Sequelize.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    });
  },
};