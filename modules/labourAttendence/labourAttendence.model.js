const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class LaborAttendence extends Model {}

  LaborAttendence.init(
    {
      headId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      projectId :{
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      maleCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      headPresent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
     },
     
      headPayment: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      malePresent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      malePayment: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      femaleCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      femalePresent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      femalePayment: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      date:{
        type:DataTypes.DATEONLY,
        allowNull:false,
      }
    },
    {
      sequelize,
      modelName: "LaborAttendence",
      tableName: "labors_attendence",
      timestamps: true,
    }
  );

  LaborAttendence.associate = (models) => {
    LaborAttendence.belongsTo(models.LaborHead, {
      foreignKey: "headId",
      as: "head",
    });
    LaborAttendence.belongsTo(models.Project, {
      foreignKey: "projectId",
      as: "project",
    });
  };

  return LaborAttendence;
};
