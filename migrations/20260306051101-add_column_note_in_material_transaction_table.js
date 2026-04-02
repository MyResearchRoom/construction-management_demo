'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("material_transactions", "note", {
      type: Sequelize.STRING,
      allowNull: true,   
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("material_transactions", "note");
  }
};
