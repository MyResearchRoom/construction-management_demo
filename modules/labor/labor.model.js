const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Labor extends Model {}

  Labor.init(
    {
      contractorName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      laborHeadId:{
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      maleWorkersCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      femaleWorkersCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      wageType: {
        type: DataTypes.ENUM("contract", "daily"),
        allowNull: false,
      },
      maleDailyWage: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.00,
      },
      femaleDailyWage: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.00,
      },
      headDailyWage: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.00,
      },

      status: {
        type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
        allowNull: false,
        defaultValue: "ACTIVE",
      },
    },
    {
      sequelize,
      modelName: "Labor",
      tableName: "labors",
      timestamps: true,
    }
  );

  Labor.associate = (models) => {
    Labor.belongsTo(models.LaborHead, {
      foreignKey: "laborHeadId",
      as: "laborHead",
    });
  };

  return Labor;
};
