'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("fuel_logs", "dprId", {
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

    await queryInterface.addColumn("fuel_logs", "date", {  
      type: Sequelize.DATEONLY,
      allowNull: true,
      after: "ratePerLiter",
    });

    await queryInterface.addColumn("fuel_logs", "tankerReading", {
      type: Sequelize.FLOAT,
      allowNull: false,
      after: "ratePerLiter",
    });

    await queryInterface.addColumn("fuel_logs", "totalKmReading", {
      type: Sequelize.FLOAT,
      allowNull: false,
      after: "endReading",
    });

    await queryInterface.addColumn("fuel_logs", "driverName", {
      type: Sequelize.STRING,
      allowNull: false,
      after: "ratePerLiter",
    });

    await queryInterface.addColumn("fuel_logs", "dieselEntryBy", {
      type: Sequelize.STRING,
      allowNull: false,
      after: "ratePerLiter",
    });

    await queryInterface.changeColumn("fuel_logs", "litersFilled", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue:0.00,
    })

    await queryInterface.changeColumn("fuel_logs", "ratePerLiter", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue:0.00,
    })


  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("fuel_logs", "dprId");
    await queryInterface.removeColumn("fuel_logs", "date");
    await queryInterface.removeColumn("fuel_logs", "tankerReading");
    await queryInterface.removeColumn("fuel_logs", "totalKmReading");
    await queryInterface.removeColumn("fuel_logs", "driverName");
    await queryInterface.removeColumn("fuel_logs", "dieselEntryBy");

    await queryInterface.changeColumn("fuel_logs", "litersFilled", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: null,
    });

    await queryInterface.changeColumn("fuel_logs", "ratePerLiter", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: null,
    });
  }
};
