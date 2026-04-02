const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Machinery extends Model {
    static associate(models) {
        Machinery.hasMany(models.MachineryFuelLog,{
            foreignKey:"machineId",
            as:"fuelLogs",
        })
        Machinery.hasMany(models.MachineryMaintenance,{
            foreignKey: "machineId",
            sourceKey: "machineId",
            as: "maintenances",
        })
    }
  }

  Machinery.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      machineId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      machineName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      registrationNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      targetEfficiency: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      capacity: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("ACTIVE", "INACTIVE","UNDERMAINTENANCE"),
        defaultValue: "ACTIVE",
      },
    },
    {
      sequelize,
      tableName: "machineries",
    }
  );

  return Machinery;
};
