'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('permanent_stocks_transactions', "transactionType",{ 
      type: Sequelize.ENUM(
          "receive", "issue", "return","received to store"
        ),
      allowNull: false,
    });

    await queryInterface.changeColumn('material_transactions', "transactionType",{ 
      type: Sequelize.ENUM(
          "receive", "issue", "return","received to store"
        ),
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('permanent_stocks_transactions', "transactionType",{ 
      type: Sequelize.ENUM(
          "receive", "issue", "return"
        ),
      allowNull: false,
    });

    await queryInterface.changeColumn('material_transactions', "transactionType",{ 
      type: Sequelize.ENUM(
          "receive", "issue", "return"
        ),
      allowNull: false,
    });
    
  }
};
