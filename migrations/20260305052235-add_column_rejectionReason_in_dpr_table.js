'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("dprs", "rejectionReason", {
      type: Sequelize.STRING,
      allowNull: true,   
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("dprs", "rejectionReason");
  }
};
