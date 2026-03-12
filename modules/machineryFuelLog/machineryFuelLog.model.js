const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class MachineryFuelLog extends Model {
    static associate(models) {
      MachineryFuelLog.belongsTo(models.Machinery, {
        foreignKey: "machineId",
        as: "machine",
      });
    }
  }

  MachineryFuelLog.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      machineId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      startReading: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      endReading: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      litersFilled: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      ratePerLiter: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      fuelSupplier: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      billPhoto: {
        type: DataTypes.BLOB("long"),
        allowNull:true,
      },
      imageContentType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull:true,
      },
      
    },
    {
      sequelize,
      tableName: "machinery_fuel_logs",
    }
  );

  return MachineryFuelLog;
};
