const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PermanentStockTransaction extends Model {
    static associate(models) {
      PermanentStockTransaction.belongsTo(models.Dpr, {
        foreignKey: "dprId",
        targetKey: "id",
        as: "dprData",
      });
      PermanentStockTransaction.belongsTo(models.PermanentStock, {
        foreignKey: "stockId",
        targetKey: "id",
        as: "permanentStock",
      });
      PermanentStockTransaction.belongsTo(models.Vehicle, {
        foreignKey: "vehicleId",
        targetKey: "id",
        as: "vehicle",
      });
      PermanentStockTransaction.belongsTo(models.Project, {
        foreignKey: "projectId",
        targetKey: "id",
        as: "project",
      });
    }
  }

  PermanentStockTransaction.init(
    {
      dprId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      stockId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      vehicleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      transactionType: {
        type: DataTypes.ENUM("receive", "issue", "return","received to store"),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.FLOAT,
        allowNull: false, 
      },
      challanNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      challan: {
        type: DataTypes.BLOB("long"),
        allowNull: true,
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
      tableName: "permanent_stocks_transactions",
      timestamps:true,
    }
  );

  return PermanentStockTransaction;
};
