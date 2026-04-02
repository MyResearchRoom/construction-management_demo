'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("machinery_fuel_logs", "dprId", {
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

    await queryInterface.addColumn("machinery_fuel_logs", "date", {  
      type: Sequelize.DATEONLY,
      allowNull: true,
      after: "ratePerLiter",
    });

    await queryInterface.addColumn("machinery_fuel_logs", "tankerReading", {
      type: Sequelize.FLOAT,
      allowNull: false,
      after: "ratePerLiter",
    });

    await queryInterface.addColumn("machinery_fuel_logs", "totalKmReading", {
      type: Sequelize.FLOAT,
      allowNull: false,
      after: "endReading",
    });

    await queryInterface.addColumn("machinery_fuel_logs", "driverName", {
      type: Sequelize.STRING,
      allowNull: false,
      after: "ratePerLiter",
    });

    await queryInterface.addColumn("machinery_fuel_logs", "dieselEntryBy", {
      type: Sequelize.STRING,
      allowNull: false,
      after: "ratePerLiter",
    });

    await queryInterface.changeColumn("machinery_fuel_logs", "litersFilled", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue:0.00,
    })

    await queryInterface.changeColumn("machinery_fuel_logs", "ratePerLiter", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue:0.00,
    })


  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("machinery_fuel_logs", "dprId");
    await queryInterface.removeColumn("machinery_fuel_logs", "date");
    await queryInterface.removeColumn("machinery_fuel_logs", "tankerReading");
    await queryInterface.removeColumn("machinery_fuel_logs", "totalKmReading");
    await queryInterface.removeColumn("machinery_fuel_logs", "driverName");
    await queryInterface.removeColumn("machinery_fuel_logs", "dieselEntryBy");

    await queryInterface.changeColumn("machinery_fuel_logs", "litersFilled", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: null,
    });

    await queryInterface.changeColumn("machinery_fuel_logs", "ratePerLiter", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: null,
    });
  }
};
