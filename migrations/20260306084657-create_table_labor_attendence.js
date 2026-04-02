"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("labors_attendence", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      headId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "labors_head",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      headPresent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      headPayment: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      maleCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      malePresent: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      malePayment: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      femaleCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      femalePresent: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      femalePayment: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("labors_attendence");
  },
};