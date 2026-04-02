const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class MaterialTransaction extends Model {
    static associate(models) {
      MaterialTransaction.belongsTo(models.ProjectMaterial, {
        foreignKey: "projectMaterialId",
        as: "projectMaterial",
      });
      MaterialTransaction.belongsTo(models.Vehicle, {
        foreignKey: "vehicleId",
        targetKey: "id",
        as: "Vehicle",
      });
      MaterialTransaction.belongsTo(models.Dpr, {
        foreignKey: "dprId",
        targetKey: "id",
        as: "dprData",
      });
    }
  }

  MaterialTransaction.init(
    {
      projectMaterialId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dprId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      transactionType: {
        type: DataTypes.ENUM("receive", "issue", "return","received to store"),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      vehicleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      challanNumber: {
        type: DataTypes.STRING,
      },
      challan: {
        type: DataTypes.BLOB("long"),
      },
      imageContentType:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      note :{
        type: DataTypes.STRING,
        allowNull: true,
      }
    },
    {
      sequelize,
      tableName: "material_transactions",
    }
  );

  return MaterialTransaction;
};
