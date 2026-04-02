'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn("material_transactions", "vehicleId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      after: "quantity",
      references: {
        model: "vehicles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },


  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn("material_transactions", "vehicleId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "quantity",
      references: {
        model: "vehicles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  }
};
