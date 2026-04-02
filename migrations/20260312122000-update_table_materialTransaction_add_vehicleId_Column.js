'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("material_transactions", "vehicleId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "quantity",
      references: {
        model: "vehicles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.addColumn("material_transactions", "dprId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "projectMaterialId",
      references: {
        model: "dprs",
          key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },


  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('material_transactions',"vehicleId");
    await queryInterface.removeColumn('material_transactions',"dprId");
  }
};
