'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('participants', "role",{ 
      type: Sequelize.ENUM(
          "PROJECT_MANAGER",
          "SITE_MANAGER",
          "FINANCE_MANAGER",
          "SUPERVISOR"
        ),
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('participants',"role",{
      type: Sequelize.ENUM(
          "PROJECT_MANAGER",
          "SITE_MANAGER",
          "FINANCE_MANAGER",
        ),
      allowNull: false,
    });
  }
};
