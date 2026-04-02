'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', "role",{ 
      type: Sequelize.ENUM(
          "ADMIN",
          "PROJECT_MANAGER",
          "SITE_MANAGER",
          "TENDER_MANAGER",
          "FINANCE_MANAGER",
          "HR_MANAGER",
          "SUPERVISOR"
        ),
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('users',"role",{
      type: Sequelize.ENUM(
          "ADMIN",
          "PROJECT_MANAGER",
          "SITE_MANAGER",
          "TENDER_MANAGER",
          "FINANCE_MANAGER",
          "HR_MANAGER"),
      allowNull: false,
    });
  }
};
