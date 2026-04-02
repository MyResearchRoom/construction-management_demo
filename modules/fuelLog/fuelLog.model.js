// const { Model } = require("sequelize");

// module.exports = (sequelize, DataTypes) => {
//   class FuelLog extends Model {
//     static associate(models) {
//       FuelLog.belongsTo(models.Vehicle, {
//         foreignKey: "vehicleId",
//         as: "vehicle",
//       });
//     }
//   }

//   FuelLog.init(
//     {
//       vehicleId: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       startReading: {
//         type: DataTypes.FLOAT,
//         allowNull: false,
//       },
//       endReading: {
//         type: DataTypes.FLOAT,
//         allowNull: false,
//       },
//       litersFilled: {
//         type: DataTypes.FLOAT,
//         allowNull: false,
//       },
//       ratePerLiter: {
//         type: DataTypes.FLOAT,
//         allowNull: false,
//       },
//       fuelSupplier: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       billPhoto: {
//         type: DataTypes.BLOB("long"),
//       },
//       remarks: {
//         type: DataTypes.TEXT,
//       },
//       imageContentType: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//     },
//     {
//       sequelize,
//       tableName: "fuel_logs",
//     }
//   );

//   return FuelLog;
// };


const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class FuelLog extends Model {
    static associate(models) {
      FuelLog.belongsTo(models.Vehicle, {
        foreignKey: "vehicleId",
        as: "vehicle",
      });

      FuelLog.belongsTo(models.Dpr, {
        foreignKey: "dprId",
        as: "dpr",
      });
    }
  }

  FuelLog.init(
    {
      vehicleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      dprId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // date: {
      //   type: DataTypes.DATEONLY,
      //   allowNull: false,
      // },

      date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      startReading: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },

      endReading: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },

      totalKmReading: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },

      litersFilled: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
      },

      ratePerLiter: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
      },

      fuelSupplier: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      driverName: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      dieselEntryBy: {   
        type: DataTypes.STRING,
        allowNull: false,
      },

      billPhoto: {
        type: DataTypes.BLOB("long"),
        allowNull: true,
      },

      imageContentType: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "fuel_logs",
    }
  );

  return FuelLog;
};