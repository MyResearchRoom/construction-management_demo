'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn("fuel_logs", "tankerReading");

    await queryInterface.removeColumn("machinery_fuel_logs", "tankerReading");
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn("fuel_logs", "tankerReading", {  
      type: Sequelize.FLOAT,
      allowNull: false,
    });

    await queryInterface.addColumn("machinery_fuel_logs", "tankerReading", {  
      type: Sequelize.FLOAT,
      allowNull: false,
    });
  }
};
