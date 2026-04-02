'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("labors_head", "totalAmount", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0,   
      after: "name",
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("labors_head", "totalAmount");
  }
};
