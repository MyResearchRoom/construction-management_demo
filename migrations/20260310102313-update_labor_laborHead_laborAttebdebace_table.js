'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn("labors_head", "projectId");

    await queryInterface.removeColumn("labors", "projectId");

    await queryInterface.addColumn("labors_attendence", "projectId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "headId",
      references: {
        model: "projects",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn("labors_head", "projectId", {
      type: Sequelize.INTEGER,
      allowNull: fa,
      references: {
        model: "projects",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.addColumn("labors", "projectId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "projects",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.removeColumn("labors_attendence", "projectId");
  }
};
