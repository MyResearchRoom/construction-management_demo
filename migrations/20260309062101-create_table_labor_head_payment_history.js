"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("labor_head_payment_history", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      laborHeadId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "labors_head",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      paymentDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      paymentMode: {
        type: Sequelize.ENUM("cash", "bank", "upi"),
        allowNull: false,
      },

      note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      creditedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("labor_head_payment_history");
  },
};