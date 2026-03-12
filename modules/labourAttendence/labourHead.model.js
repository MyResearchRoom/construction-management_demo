const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class LaborHead extends Model {}

  LaborHead.init(
    {
      name :{
        type: DataTypes.STRING,
        allowNull: false,
      },
      totalAmount :{
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.00,
      },
      totalPaid: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.00,
      },
      totalRemaining: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.00,
      },
      status: {
        type: DataTypes.ENUM("paid", "partial","pending"),
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "LaborHead",
      tableName: "labors_head",
      timestamps: true,
    }
  );

  LaborHead.associate = (models) => { 
    LaborHead.hasOne(models.Labor, {
      foreignKey: "laborHeadId",
      as: "laborData",
    }); 
  };

  return LaborHead;
};
