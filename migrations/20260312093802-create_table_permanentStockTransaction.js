"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    
    await queryInterface.createTable("permanent_stocks_transactions", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      dprId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "dprs",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      stockId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "permanent_stocks",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      transactionType: {
        type: Sequelize.ENUM("receive", "issue", "return"),
        allowNull: false,
      },

      quantity: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      vehicleId:{
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "vehicles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      challanNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      challan: {
        type: Sequelize.BLOB("long"),
        allowNull: true,
      },

      imageContentType: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      note: {
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.dropTable("permanent_stocks_transactions");
  },
};