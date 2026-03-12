'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.removeColumn("labors", "dailyWage");

    await queryInterface.addColumn("labors", "maleDailyWage", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.00,
    });

    await queryInterface.addColumn("labors", "femaleDailyWage", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.00,
    });

    await queryInterface.addColumn("labors", "headDailyWage", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.00,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("labors", "maleDailyWage");
    await queryInterface.removeColumn("labors", "femaleDailyWage");
    await queryInterface.removeColumn("labors", "headDailyWage");

    await queryInterface.addColumn("labors", "dailyWage", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },
};
