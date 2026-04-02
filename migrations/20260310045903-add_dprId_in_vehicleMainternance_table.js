'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("vehicle_maintenances", "dprId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "vehicleId",
      references: {
        model: "dprs",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },


  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('vehicle_maintenances',"dprId");
  }
};
