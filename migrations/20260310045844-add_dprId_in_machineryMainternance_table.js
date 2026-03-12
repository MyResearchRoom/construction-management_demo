'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("machinery_maintenances", "dprId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "machineId",
      references: {
        model: "dprs",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('machinery_maintenances',"dprId");
  }
};
