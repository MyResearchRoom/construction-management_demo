const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PermanentStock extends Model {
    static associate(models) {
      PermanentStock.belongsTo(models.Company, {
        foreignKey: "companyId",
        as: "company",
      });
      PermanentStock.hasMany(models.PermanentStockTransaction, {
        foreignKey: "stockId",
        as: "transactions",
      });
    }
  }

  PermanentStock.init(
    {
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      available_quantity : {  
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalQuantity : {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      totalUsed : {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: "permanent_stocks",
      timestamps:true,
    }
  );

  return PermanentStock;
};
