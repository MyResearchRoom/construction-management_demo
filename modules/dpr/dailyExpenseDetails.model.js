const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class DailyExpenseDetails extends Model {
    static associate(models) {
      DailyExpenseDetails.belongsTo(models.DailyExpense, {
        foreignKey: "expenseId",
        as: "expense",
      });
    }
  }

  DailyExpenseDetails.init(
    {
      expenseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      workName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      date:{
        type:DataTypes.DATEONLY,
        allowNull:false,
      },
      note: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    { sequelize, tableName: "daily_expense_details", timestamps: true }
  );

  return DailyExpenseDetails;
};
