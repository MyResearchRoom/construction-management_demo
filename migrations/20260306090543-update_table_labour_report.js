"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("labor_report", "laborHeadId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      after: "dprId",
      references: {
        model: "labors_head",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.changeColumn("labor_report", "mukadam", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.removeColumn("labor_report", "laborHeadName");

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("labor_report", "laborHeadId");

    await queryInterface.changeColumn("labor_report", "mukadam", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn("labor_report", "laborHeadName", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};