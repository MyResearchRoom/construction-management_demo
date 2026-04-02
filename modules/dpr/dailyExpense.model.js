const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class DailyExpense extends Model {
    static associate(models) {
      DailyExpense.belongsTo(models.Dpr, {
        foreignKey: "dprId",
        as: "dpr",
      });
      DailyExpense.hasMany(models.DailyExpenseDetails, {
        foreignKey: "expenseId",
        as: "expenseDetails",
      });

    }
  }

  DailyExpense.init(
    {
      dprId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      expense: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      remainingAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      date:{
        type:DataTypes.DATEONLY,
        allowNull:true,
      },
      note: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    { sequelize, tableName: "daily_expenses", timestamps: false }
  );

  return DailyExpense;
};
