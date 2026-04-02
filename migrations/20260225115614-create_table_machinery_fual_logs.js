'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('machinery_fuel_logs', { 
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      machineId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "machineries",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      startReading: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      endReading: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      litersFilled: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      ratePerLiter: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      fuelSupplier: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      billPhoto: {
        type: Sequelize.BLOB("long"),
        allowNull:true,
      },
      imageContentType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull:true,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('machinery_fuel_logs');
  }
};
