const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class VehicleMaintenance extends Model {
    static associate(models) {
      VehicleMaintenance.belongsTo(models.Vehicle, {
        foreignKey: "vehicleId",
        targetKey: "vehicleId",
        as: "vehicle",
      });
      VehicleMaintenance.belongsTo(models.Dpr, {
        foreignKey: "dprId",
        targetKey: "id",
        as: "vehicleDprData",
      });
    }
  }

  VehicleMaintenance.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull:false,
        autoIncrement: true,
      },
      vehicleId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      dprId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      serviceDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cost: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
      },
      garageName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      garageContactNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nextServiceDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      invoice: {
        type: DataTypes.BLOB("long"),
        allowNull: true,
      },
      invoiceContentType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "vehicle_maintenances",
    }
  );

  return VehicleMaintenance;
};