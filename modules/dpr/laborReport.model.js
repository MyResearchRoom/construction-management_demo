const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class LaborReport extends Model {}

  LaborReport.init(
    {
      dprId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      laborHeadId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      work: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // mukadam: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      // },
      mukadam: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      male: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      female: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      note: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "labor_report",
      timestamps: false,
    }
  );

  LaborReport.associate = (models) => {
    LaborReport.belongsTo(models.Dpr, {
      foreignKey: "dprId",
    });
    LaborReport.belongsTo(models.LaborHead, {
      foreignKey: "laborHeadId",
      as: "laborHead",
    });
  };

  return LaborReport;
};
