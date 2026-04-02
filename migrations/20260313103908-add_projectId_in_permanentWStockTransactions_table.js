'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("permanent_stocks_transactions", "projectId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "dprId",
      references: {
        model: "projects",
          key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("permanent_stocks_transactions", "projectId");
  }
};
