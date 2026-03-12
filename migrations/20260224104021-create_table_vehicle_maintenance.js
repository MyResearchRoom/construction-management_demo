'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
  await queryInterface.createTable('vehicle_maintenances', { 
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },

    vehicleId: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: "vehicles",   
        key: "vehicleId",    
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
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
  });
  },

  async down (queryInterface, Sequelize) {
  await queryInterface.dropTable('vehicle_maintenances');

  }
};
