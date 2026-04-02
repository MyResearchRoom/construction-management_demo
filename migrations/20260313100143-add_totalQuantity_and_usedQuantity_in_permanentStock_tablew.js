'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("permanent_stocks", "totalQuantity", {
      type: Sequelize.INTEGER,
      allowNull: false,
      after: "name",
      defaultValue:0,
    });
    await queryInterface.addColumn("permanent_stocks", "totalUsed", {
      type: Sequelize.INTEGER,
      allowNull: false,
      after: "totalQuantity",
      defaultValue:0,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("permanent_stocks", "totalQuantity");
    await queryInterface.removeColumn("permanent_stocks", "totalUsed");
  }
};
