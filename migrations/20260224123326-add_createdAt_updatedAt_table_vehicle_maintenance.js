'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("vehicle_maintenances", "createdAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });

    await queryInterface.addColumn("vehicle_maintenances", "updatedAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
    });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn("vehicle_maintenances", "createdAt");
    await queryInterface.removeColumn("vehicle_maintenances", "updatedAt");
  }
};