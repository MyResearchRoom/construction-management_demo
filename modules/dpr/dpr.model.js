const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Dpr extends Model {
    static associate(models) {

      Dpr.belongsTo(models.Project, {
        foreignKey: "projectId",
        as: "project",
      });
      Dpr.hasMany(models.WorkDone, { 
        as: "workDone", 
        foreignKey: "dprId" 
      });
      Dpr.hasMany(models.MaterialOnSite, {
        as: "materialOnSite",
        foreignKey: "dprId",
      });
      Dpr.hasMany(models.DieselReport, {
        as: "dieselReport",
        foreignKey: "dprId",
      });
      Dpr.hasMany(models.LaborReport, {
        as: "laborReport",
        foreignKey: "dprId",
      });
      Dpr.hasMany(models.DailyExpense, {
        as: "dailyExpense",
        foreignKey: "dprId",
      });
      Dpr.hasMany(models.SitePhoto, {
        as: "photos",
        foreignKey: "dprId",
      });
      Dpr.belongsTo(models.User, {
        foreignKey:"submittedBy",
        as: "submittedByUser"
      });
      Dpr.belongsTo(models.User, {
        foreignKey:"editedBy",
        as: "editedByUser"
      });

      Dpr.hasMany(models.MachineryMaintenance, {
        as: "machineryMaintenance",
        foreignKey: "dprId",
      });

      Dpr.hasMany(models.VehicleMaintenance, {
        as: "vehicleMaintenance",
        foreignKey: "dprId",
      });

      Dpr.hasMany(models.MaterialTransaction, {
        as: "consumableStock",
        foreignKey: "dprId",
      });

      Dpr.hasMany(models.PermanentStockTransaction, {
        as: "permananetStock",
        foreignKey: "dprId",
      });
      
      Dpr.hasMany(models.MachineryFuelLog, {
        as: "machineryFuelLog",
        foreignKey: "dprId",
      });
      
      Dpr.hasMany(models.FuelLog, {
        as: "vehicleFuelLog",
        foreignKey: "dprId",
      });
    }
  }

  Dpr.init(
    {
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      nameOfSite: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nameOfSupervisor: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      dateOfSubmission: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("approved", "rejected", "pending"),
        defaultValue: "pending",
      },
      submittedBy :{
        type:DataTypes.INTEGER,
        allowNull:false,
      },
      rejectionReason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      editedBy :{
        type:DataTypes.INTEGER,
        allowNull:true,
      },
    },
    {
      sequelize,
      tableName: "dprs",
    }
  );

  return Dpr;
};
