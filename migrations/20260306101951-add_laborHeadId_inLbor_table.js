'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("labors", "laborHeadId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      after: "contractorName",
      references: {
        model: "labors_head",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("labors", "laborHeadId");
  }
};
