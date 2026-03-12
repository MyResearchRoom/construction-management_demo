const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class LaborHeadPaymentHistory extends Model {}

  LaborHeadPaymentHistory.init(
    {
      laborHeadId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      paymentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      paymentMode: {
        type: DataTypes.ENUM("cash", "bank", "upi"),
        allowNull: false,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      creditedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "LaborHeadPaymentHistory",
      tableName: "labor_head_payment_history",
      timestamps: true,
    }
  );

  LaborHeadPaymentHistory.associate = (models) => {
    LaborHeadPaymentHistory.belongsTo(models.LaborHead, {
      foreignKey: "laborHeadId",
      as: "laborHead",
    });

    LaborHeadPaymentHistory.belongsTo(models.User, {
      foreignKey: "creditedBy",
      as: "creditedUser",
    });
  };

  return LaborHeadPaymentHistory;
};