'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('machinery_maintenances', { 
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull:false,
        autoIncrement: true,
      },
      machineId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "machineries",
          key: "machineId",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      serviceDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cost: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: false,
      },
      garageName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      garageContactNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nextServiceDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      invoice: {
        type: Sequelize.BLOB("long"),
        allowNull: true,
      },
      invoiceContentType: {
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.dropTable('machinery_maintenances');
  }
};
