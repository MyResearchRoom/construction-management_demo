'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("daily_expenses", "date", {  
      type: Sequelize.DATEONLY,
      allowNull: true,
      after: "remainingAmount",
    });

    await queryInterface.removeColumn("daily_expenses", "particular");
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("daily_expenses", "date");

    await queryInterface.addColumn("daily_expenses", "particular", {  
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};
